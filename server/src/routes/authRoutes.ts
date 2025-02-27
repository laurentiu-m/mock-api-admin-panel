import { Router, Request, Response } from "express";
import jsonServer from "json-server";
import { User, LoginUser, RegisterUser } from "../types";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const config = {
  jwtSecret: process.env.JWT_SECRET_KEY || "default-secret-key",
  jwtExpiration: process.env.JWT_EXPIRATION_TIME || "1h",
  port: process.env.PORT || 3000,
  db: "./db.json",
};

const db = jsonServer.router(config.db).db;

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  db.read();

  const { email, password }: LoginUser = req.body;

  const users: User[] = db.get("users").value();
  const user: User = users.find((user) => user.email === email);

  if (!user || user.password !== password) {
    const invalidFields = [
      {
        field: "email",
        message: req.t("invalid_email_or_password"),
      },
      { field: "password", message: "" },
    ];
    res.status(400).json({ errors: invalidFields });
    return;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      language: user.language,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );

  res.status(200).json({ message: "You have login successfully", token });
});

router.post("/register", async (req: Request, res: Response) => {
  const { name, username, email, phone, gender, password, role }: RegisterUser =
    req.body;

  const missingFields = [
    { field: "email", value: email },
    { field: "name", value: name },
    { field: "password", value: password },
    { field: "gender", value: gender },
    { field: "username", value: username },
    { field: "phone", value: phone },
  ].filter(({ value }) => !value);

  if (missingFields.length > 0) {
    res.status(400).json({
      error: "form_invalid",
      fields: missingFields.map(({ field }) => ({
        field,
        messageKey: req.t(`${field}_empty`),
      })),
    });
    return;
  }

  const users: User[] = db.get("users").value();

  const checkEmail: User | undefined = users.find(
    (user) => user.email === email
  );
  if (checkEmail) {
    res.status(404).json({
      field: "email",
      type: "server",
      message: req.t("email_taken"),
    });
    return;
  }

  const checkUsername: User | undefined = users.find(
    (user) => user.username === username
  );
  if (checkUsername) {
    res.status(404).json({
      field: "username",
      type: "server",
      message: req.t("username_taken"),
    });
    return;
  }

  const newId =
    users.length > 0
      ? Math.max(...users.map((user) => Number(user.id))) + 1
      : 1;

  const newUser = {
    id: newId,
    name,
    username,
    email,
    phone,
    gender,
    password,
    role: role || "user",
  };

  db.get("users").push(newUser).write();

  const user = db.get("users").find({ email }).value();

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );

  res.status(200).json({
    message: req.t("register_success"),
    token,
  });
});

router.post("/valid", (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({
      message: req.t("token_not_found"),
    });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret);
    res.status(200).json({ message: req.t("token_valid"), decodedToken });
    return;
  } catch (error) {
    res.status(400).json({
      message: req.t("token_invalid"),
    });
  }
});

export default router;

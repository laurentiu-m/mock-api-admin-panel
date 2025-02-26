import { Router, Request, Response } from "express";
import jsonServer from "json-server";
import dotenv from "dotenv";

dotenv.config();

const config = {
  db: "./db.json",
};

const db = jsonServer.router(config.db).db;

const router = Router();

router.get("", (req: Request, res: Response) => {
  db.read();

  const { search, page, rows } = req.query;

  const pageNumber = Number(page) || 1;
  const rowsNumber = Number(rows) || 10;

  let users = db.get("users").value();

  const searchValue = typeof search === "string" ? search.toLowerCase() : "";

  if (searchValue) {
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchValue) ||
        user.username.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
    );
  }

  const totalCount = users.length;
  const totalPages = Math.ceil(totalCount / rowsNumber);

  const validPage = totalPages > 0 ? pageNumber : 0;

  const startIndex = (validPage - 1) * rowsNumber;
  const endIndex = startIndex + rowsNumber;

  users = users.slice(startIndex, endIndex);

  res.json({
    result: users,
    count: totalCount,
    totalPages,
    currentPage: validPage,
    rows: rowsNumber,
  });
});

router.put("/edit/:id", async (req: Request, res: Response) => {
  db.read();

  const { id } = req.params;
  const { email, username } = req.body;

  const users = db.get("users").value();
  const otherUsers = users.filter((user) => user.id !== Number(id));

  const isEmailTaken = otherUsers.some((user) => user.email === email);
  const isUsernameTaken = otherUsers.some((user) => user.username === username);

  if (isEmailTaken) {
    res.status(404).json({
      field: "email",
      type: "server",
      message: req.t("email_taken"),
    });
    return;
  }

  if (isUsernameTaken) {
    res.status(404).json({
      field: "username",
      type: "server",
      message: req.t("username_taken"),
    });
    return;
  }

  const user = db
    .get("users")
    .find({ id: Number(id) })
    .value();

  Object.assign(user, req.body);

  db.write();

  res.status(200).json({
    message: `You've edited user ${id} successfully`,
    user,
  });
});

export default router;

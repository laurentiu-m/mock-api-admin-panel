import { faker } from "@faker-js/faker";
import { User } from "../types";
import jsonServer from "json-server";
import dotenv from "dotenv";

dotenv.config();

const config = {
  db: "./db.json",
};

const db = jsonServer.router(config.db).db;

const updateUser = (user: User): User => {
  return {
    ...user,
    gender: faker.helpers.arrayElement(["male", "female", "prefer_not_to_say"]),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(["admin", "moderator", "user"]),
  };
};

const updateUsersData = async () => {
  const users = db.get("users").value();

  const updatedUsers = users.map((user) => updateUser(user));

  Object.assign(users, updatedUsers);

  db.write();
};

updateUsersData();

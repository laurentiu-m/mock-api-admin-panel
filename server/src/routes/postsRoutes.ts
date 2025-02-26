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

  const { userId, search, page, rows } = req.query;

  const pageNumber = Number(page) || 1;
  const rowsNumber = Number(rows) || 10;

  const users = db.get("users").value();

  const searchValue = typeof search === "string" ? search.toLowerCase() : "";

  let posts = db.get("posts").value();

  if (userId) {
    posts = posts.filter((post) => post.userId === Number(userId));
  } else {
    posts = posts.map(({ userId, ...rest }) => ({
      ...rest,
      username: users.find((user) => user.id === userId)?.username,
    }));
  }

  if (searchValue) {
    posts = posts.filter((post) => {
      const title = post.title.toLowerCase().includes(searchValue);
      const username =
        !userId && post.username.toLowerCase().includes(searchValue);

      return title || username;
    });
  }

  const totalCount = posts.length;
  const totalPages = Math.ceil(totalCount / rowsNumber);

  const validPage = totalPages > 0 ? pageNumber : 0;

  const startIndex = (validPage - 1) * rowsNumber;
  const endIndex = startIndex + rowsNumber;

  posts = posts.slice(startIndex, endIndex);

  res.json({
    result: posts,
    count: totalCount,
    totalPages,
    currentPage: validPage,
    rows: rowsNumber,
  });
});

export default router;

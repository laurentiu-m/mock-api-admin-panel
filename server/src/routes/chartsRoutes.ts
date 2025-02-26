import { Router, Request, Response } from "express";
import jsonServer from "json-server";
import dotenv from "dotenv";

dotenv.config();

const config = {
  db: "./db.json",
};

const db = jsonServer.router(config.db).db;

const router = Router();

const onPercentage = (value: number, total: number) => {
  return Math.round(((value * 100) / total) * 100) / 100;
};

router.get("/users/top", (req: Request, res: Response) => {
  const posts = db.get("posts").value();
  const users = db.get("users").value();

  const postCounts = users.map((user) => {
    const postCount = posts.filter((post) => post.userId === user.id).length;
    return { userId: user.id, postCount, username: user.username };
  });

  const topUsers = postCounts
    .toSorted((a, b) => b.postCount - a.postCount)
    .slice(0, 12);

  res.json(topUsers);
});

router.get("/posts/top", (req: Request, res: Response) => {
  const posts = db.get("posts").value();
  const comments = db.get("comments").value();

  const commentCounts = posts.map((post) => {
    const commentCount = comments.filter(
      (comment) => comment.postId === post.id
    ).length;
    return { title: post.title, commentCount };
  });

  const topPosts = commentCounts
    .toSorted((a, b) => b.commentCount - a.commentCount)
    .slice(0, 12);

  res.json(topPosts);
});

router.get("/gender", (req: Request, res: Response) => {
  db.read();

  const users = db.get("users").value();

  const { female, male, prefer_not_to_say } = users.reduce((acc, user) => {
    acc[user.gender] = (acc[user.gender] || 0) + 1;
    return acc;
  }, {});

  const total = female + male + prefer_not_to_say;

  res.json({
    total,
    result: [
      {
        name: req.t("gender.female"),
        value: female,
        percentage: onPercentage(female, total),
      },
      {
        name: req.t("gender.male"),
        value: male,
        percentage: onPercentage(male, total),
      },
      {
        name: req.t("gender.prefer_not_to_say"),
        value: prefer_not_to_say,
        percentage: onPercentage(prefer_not_to_say, total),
      },
    ],
  });
});

router.get("/roles", (req: Request, res: Response) => {
  db.read();

  const users = db.get("users").value();

  const { admin, moderator, user } = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const total = admin + moderator + user;

  res.json({
    total,
    result: [
      {
        name: "admin",
        value: admin,
        percentage: onPercentage(admin, total),
      },
      {
        name: "moderator",
        value: moderator,
        percentage: onPercentage(moderator, total),
      },
      {
        name: req.t("user"),
        value: user,
        percentage: onPercentage(user, total),
      },
    ],
  });
});

router.get("/users/:id/posts/comments", (req: Request, res: Response) => {
  const { id } = req.params;

  const comments = db.get("comments").value();
  const posts = db
    .get("posts")
    .filter((post) => post.userId === Number(id))
    .value();

  const totalComments = posts.reduce((acc, post) => {
    const count = comments.filter(
      (comment) => comment.postId === post.id
    ).length;
    return acc + count;
  }, 0);

  const commentsCounts = posts
    .map((post) => {
      const commentCount = comments.filter(
        (comment) => comment.postId === post.id
      ).length;
      if (commentCount > 0) {
        return { title: post.title, commentCount };
      }
      return null;
    })
    .filter((item) => item !== null);

  res.json({ totalComments, commentsCounts });
});

router.get("/users/:id/albums/total", (req: Request, res: Response) => {
  const { id } = req.params;

  const totalAlbums = db
    .get("albums")
    .filter((album) => album.userId === Number(id))
    .value().length;

  res.json(totalAlbums);
});

router.get("/comments/total", (req: Request, res: Response) => {
  const comments = db.get("comments").value();

  res.json({ total: comments.length });
});

export default router;

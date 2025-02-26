import { Router } from "express";
import authRoutes from "./authRoutes";
import chartsRoutes from "./chartsRoutes";
import usersRoutes from "./usersRoutes";
import postsRoutes from "./postsRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/charts", chartsRoutes);
router.use("/users", usersRoutes);
router.use("/posts", postsRoutes);

export default router;

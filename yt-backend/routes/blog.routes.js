import express from "express";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  getLatestBlog,
} from "../controllers/blog.controller.js";

import { authMiddleware } from "../middleware/auth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

/* 🌍 PUBLIC */
router.get("/", getBlogs);
router.get("/latest", getLatestBlog);
router.get("/:slug", getBlogBySlug);

/* 🔐 ADMIN */
router.get("/admin/all", authMiddleware, verifyRoles("admin"), getAllBlogsAdmin);
router.post("/", authMiddleware, verifyRoles("admin"), createBlog);
router.put("/:id", authMiddleware, verifyRoles("admin"), updateBlog);
router.delete("/:id", authMiddleware, verifyRoles("admin"), deleteBlog);

export default router;

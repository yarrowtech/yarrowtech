import express from "express";
import uploadResume from "../middleware/uploadResume.js";
import {
  submitCareer,
  getAllCareerSubmissions,
} from "../controllers/career.Controller.js";
import { authMiddleware } from "../middleware/auth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

// PUBLIC route → receives form + resume file
router.post("/", uploadResume.single("resume"), submitCareer);

// ADMIN + MANAGER route → fetch career applications
router.get(
  "/all",
  authMiddleware,
  verifyRoles("admin", "manager"),
  getAllCareerSubmissions
);

export default router;

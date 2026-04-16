import express from "express";
import uploadResume from "../middleware/uploadResume.js";
import { submitCareer } from "../controllers/career.Controller.js";

const router = express.Router();

// PUBLIC route → receives form + resume file
router.post("/", uploadResume.single("resume"), submitCareer);

export default router;

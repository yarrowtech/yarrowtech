import express from "express";
import multer from "multer";
import uploadResume, { MAX_RESUME_MB } from "../middleware/uploadResume.js";
import {
  submitCareer,
  getAllCareerSubmissions,
  downloadResume,
} from "../controllers/career.Controller.js";
import { authMiddleware } from "../middleware/auth.js";
import verifyRoles from "../middleware/verifyRoles.js";
import { formLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// PUBLIC route → receives form + resume file
const handleResumeUpload = (req, res, next) => {
  uploadResume.single("resume")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: `Resume must be smaller than ${MAX_RESUME_MB} MB.` });
    }
    if (err instanceof multer.MulterError || err.status === 400) {
      return res.status(400).json({ message: err.message });
    }

    // Cloudinary rejected the upload (e.g. plan size limit, bad credentials)
    // Cloudinary errors are often plain objects, not Error instances.
    const reason = err.message || err.error?.message || JSON.stringify(err);
    req.log.error({ err, reason, httpCode: err.http_code }, "Resume upload failed");
    return res.status(502).json({
      message: "Could not upload your resume. Please try again.",
      ...(process.env.NODE_ENV !== "production" && { detail: reason }),
    });
  });
};

router.post("/", formLimiter, handleResumeUpload, submitCareer);

// ADMIN + MANAGER route → fetch career applications
router.get(
  "/all",
  authMiddleware,
  verifyRoles("admin", "manager"),
  getAllCareerSubmissions
);

// ADMIN + MANAGER route → proxy resume download from Cloudinary
router.get(
  "/download/:id",
  authMiddleware,
  verifyRoles("admin", "manager"),
  downloadResume
);

export default router;

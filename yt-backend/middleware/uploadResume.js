import path from "path";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resumes",
    resource_type: "raw",
    access_mode: "public",
    // No allowed_formats: Cloudinary can't detect formats of raw uploads and
    // rejects real PDFs/DOCs as "unknown file format". fileFilter below checks type.
  },
});

export const MAX_RESUME_MB = 5;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

// Cloudinary's allowed_formats is not enforced for raw uploads, so check here.
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    const err = new Error("Resume must be a PDF, DOC or DOCX file.");
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_RESUME_MB * 1024 * 1024, files: 1 },
});

export default uploadResume;

import path from "path";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

export const MAX_PROJECT_DOC_MB = 10;
export const MAX_PROJECT_DOCS = 10;

const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".txt", ".csv", ".png", ".jpg", ".jpeg", ".zip",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = path
      .basename(file.originalname || "document", ext)
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .slice(0, 60);
    return {
      folder: "project-documents",
      resource_type: "raw",
      access_mode: "public",
      // Keep the extension in the public id so downloads open with the right type.
      public_id: `${Date.now()}-${base}${ext}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    const err = new Error(
      "Unsupported file type. Allowed: PDF, Word, Excel, PowerPoint, TXT, CSV, PNG, JPG, ZIP."
    );
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
};

const uploadProjectDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_PROJECT_DOC_MB * 1024 * 1024, files: 1 },
});

export default uploadProjectDocument;

// erp/routes/client.routes.js
import express from "express";
import { downloadClientSrs } from "../controllers/srsDownload.controller.js";
import multer from "multer";
import uploadProjectDocument, {
  MAX_PROJECT_DOC_MB,
} from "../../middleware/uploadProjectDocument.js";
import {
  getClientDashboard,
  getMyProjects,
  getPayments,
  getPaymentsForProject,
  getProjectHistory,
  getProfile,
  sendMessage,
  updateProfile,
  updateProjectRequirements,
  uploadProjectDocumentFile,
  deleteProjectDocument,
} from "../controllers/client.controller.js";

import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

router.use(verifyErpToken, verifyRoles("client"));

router.get("/dashboard", getClientDashboard);
router.get("/projects", getMyProjects);
router.get("/payments", getPayments);
router.get("/project/:projectId/payments", getPaymentsForProject);
router.get("/project-history", getProjectHistory);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/project/:projectId/message", sendMessage);
router.put("/project/:projectId/requirements", updateProjectRequirements);
router.get("/project/:projectId/requirements/pdf", downloadClientSrs);

const handleDocumentUpload = (req, res, next) => {
  uploadProjectDocument.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: `File must be smaller than ${MAX_PROJECT_DOC_MB} MB.` });
    }
    if (err instanceof multer.MulterError || err.status === 400) {
      return res.status(400).json({ message: err.message });
    }
    // Cloudinary errors are often plain objects, not Error instances.
    return res.status(502).json({
      message: err.message || err.error?.message || "Upload failed. Please try again.",
    });
  });
};

router.post("/project/:projectId/documents", handleDocumentUpload, uploadProjectDocumentFile);
router.delete("/project/:projectId/documents/:docId", deleteProjectDocument);

export default router;

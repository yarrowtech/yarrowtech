// erp/routes/client.routes.js
import express from "express";
import {
  getClientDashboard,
  getMyProjects,
  getPayments,
  getPaymentsForProject,
  getProjectHistory,
  getProfile,
  sendMessage,
  updateProfile,
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

export default router;

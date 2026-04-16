// erp/routes/client.routes.js
import express from "express";
import {
  getMyProjects,
  getPaymentsForProject,
  sendMessage,
  
} from "../controllers/client.controller.js";

import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

router.use(verifyErpToken, verifyRoles("client"));

router.get("/projects", getMyProjects);
router.get("/project/:projectId/payments", getPaymentsForProject);
router.post("/project/:projectId/message", sendMessage);
// router.get("/dashboard", getClientDashboard);

export default router;

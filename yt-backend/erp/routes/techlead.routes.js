import express from "express";
import {
  getAssigned,
  getDashboardStats,
  updateProject,
  sendMessage,
  getProfile, updateProfile
} from "../controllers/techlead.controller.js";

import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

/* 🔐 TECH LEAD PROTECTED ROUTES */
router.use(verifyErpToken, verifyRoles("techlead"));

/* 📊 DASHBOARD STATS */
router.get("/stats", getDashboardStats);

/* 📋 ASSIGNED PROJECTS */
router.get("/assigned", getAssigned);

/* 🔄 UPDATE PROJECT (STATUS + PROGRESS) ✅ */
router.put("/project/:projectId", updateProject);

/* 💬 SEND MESSAGE */
router.post("/project/:projectId/message", sendMessage);

export default router;



router.get("/profile", getProfile);
router.put("/profile", updateProfile);
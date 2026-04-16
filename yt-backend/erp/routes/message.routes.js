// erp/routes/message.routes.js
import express from "express";
import { byProject } from "../controllers/message.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";

const router = express.Router();

router.get("/project/:projectId", verifyErpToken, byProject);

export default router;

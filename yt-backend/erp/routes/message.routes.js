// erp/routes/message.routes.js
import express from "express";
import {
  byProductUser,
  byProject,
  sendMessage,
} from "../controllers/message.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";

const router = express.Router();

router.get("/project/:projectId", verifyErpToken, byProject);
router.get("/product-user/:productUserId", verifyErpToken, byProductUser);
router.post("/send", verifyErpToken, sendMessage);

export default router;

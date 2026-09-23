import express from "express";
import {
  erpLogin,
  erpLogout,
} from "../controllers/erpAuth.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";
import { loginLimiter } from "../../middleware/rateLimiters.js";

const router = express.Router();

/* LOGIN */
router.post("/login", loginLimiter, erpLogin);

/* LOGOUT */
router.post("/logout", verifyErpToken, erpLogout);

export default router;

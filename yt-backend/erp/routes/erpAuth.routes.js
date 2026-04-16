import express from "express";
import {
  erpLogin,
  erpLogout,
} from "../controllers/erpAuth.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";

const router = express.Router();

/* LOGIN */
router.post("/login", erpLogin);

/* LOGOUT */
router.post("/logout", verifyErpToken, erpLogout);

export default router;

import express from "express";
import {
  addPayment,
  getPaymentsByProject,
  updatePayment,
} from "../controllers/payment.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

/* ADD PAYMENT */
router.post(
  "/",
  verifyErpToken,
  verifyRoles("manager", "admin"),
  addPayment
);

/* GET PAYMENTS BY PROJECT */
router.get(
  "/project/:projectId",
  verifyErpToken,
  getPaymentsByProject
);

/* UPDATE PAYMENT ✅ FIXED */
router.put(
  "/:paymentId",
  verifyErpToken,
  verifyRoles("manager", "admin"),
  updatePayment
);

export default router;

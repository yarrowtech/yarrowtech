import express from "express";
import {
  addPayment,
  getPaymentsByProject,
  updatePayment,
  updateProjectPaymentSummary,
} from "../controllers/payment.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

router.post(
  "/",
  verifyErpToken,
  verifyRoles("manager", "admin"),
  addPayment
);

router.get(
  "/project/:projectId",
  verifyErpToken,
  getPaymentsByProject
);

router.put(
  "/project/:projectId/summary",
  verifyErpToken,
  verifyRoles("manager", "admin"),
  updateProjectPaymentSummary
);

router.put(
  "/:paymentId",
  verifyErpToken,
  verifyRoles("manager", "admin"),
  updatePayment
);

export default router;

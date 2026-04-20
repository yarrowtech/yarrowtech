import express from "express";

import {
  createClientAndProject,
  deleteClient,
  getDeletedClientHistory,
  getProjects,
  getTechLeads,
  resetClientPassword,
  updateProject,
} from "../controllers/manager.controller.js";
import {
  addProductUserPayment,
  getProductUserAnalytics,
  getProductUserDetails,
  getProductUsers,
  updateProductUserPaymentSummary,
} from "../controllers/productUser.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

router.get(
  "/techleads",
  verifyErpToken,
  verifyRoles("manager"),
  getTechLeads
);

router.post(
  "/create-project",
  verifyErpToken,
  verifyRoles("manager"),
  createClientAndProject
);

router.get(
  "/projects",
  verifyErpToken,
  verifyRoles("manager"),
  getProjects
);

router.put(
  "/projects/:id",
  verifyErpToken,
  verifyRoles("manager"),
  updateProject
);

router.delete(
  "/client/:id",
  verifyErpToken,
  verifyRoles("manager"),
  deleteClient
);

router.get(
  "/client-history",
  verifyErpToken,
  verifyRoles("manager"),
  getDeletedClientHistory
);

router.put(
  "/client/reset-password/:id",
  verifyErpToken,
  verifyRoles("manager"),
  resetClientPassword
);

router.get(
  "/product-users",
  verifyErpToken,
  verifyRoles("manager"),
  getProductUsers
);

router.get(
  "/product-users/analytics",
  verifyErpToken,
  verifyRoles("manager"),
  getProductUserAnalytics
);

router.get(
  "/product-users/:id",
  verifyErpToken,
  verifyRoles("manager"),
  getProductUserDetails
);

router.put(
  "/product-users/:id/payment-summary",
  verifyErpToken,
  verifyRoles("manager"),
  updateProductUserPaymentSummary
);

router.post(
  "/product-users/:id/payments",
  verifyErpToken,
  verifyRoles("manager"),
  addProductUserPayment
);

export default router;

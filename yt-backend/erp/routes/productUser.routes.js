import express from "express";

import {
  getMyDashboard,
  getMyPayments,
  getMyProjectDetails,
} from "../controllers/productUser.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

router.use(verifyErpToken, verifyRoles("productuser"));

router.get("/dashboard", getMyDashboard);
router.get("/project", getMyProjectDetails);
router.get("/payments", getMyPayments);

export default router;

import express from "express";
import {
  createSignupOrder,
  createVendorSubscriptionOrder,
  getPlans,
  getVendorPlans,
  vendorLogin,
  vendorSignup,
  verifySignupPayment,
  verifyVendorSubscriptionPayment,
} from "../controllers/efnbmmsSignup.Controller.js";

const router = express.Router();

// Public — no auth required, mirrors EFNBMMS's own public signup endpoints
router.get("/plans", getPlans);
router.post("/signup/order", createSignupOrder);
router.post("/signup/verify", verifySignupPayment);

// Vendor — free self-signup, then login, then a paid plan
// (order/verify expect the vendor's EFNBMMS token in Authorization: Bearer <token>)
router.get("/vendor/plans", getVendorPlans);
router.post("/vendor/signup", vendorSignup);
router.post("/vendor/login", vendorLogin);
router.post("/vendor/subscription/order", createVendorSubscriptionOrder);
router.post("/vendor/subscription/verify", verifyVendorSubscriptionPayment);

export default router;

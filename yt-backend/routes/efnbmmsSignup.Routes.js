import express from "express";
import {
  createSignupOrder,
  createVendorSubscriptionOrder,
  getPlans,
  getPolicyDocument,
  getVendorPlans,
  vendorLogin,
  vendorSignup,
  verifySignupPayment,
  verifyVendorSubscriptionPayment,
} from "../controllers/efnbmmsSignup.Controller.js";
import {
  formLimiter,
  loginLimiter,
  paymentLimiter,
} from "../middleware/rateLimiters.js";

const router = express.Router();

// Public — no auth required, mirrors EFNBMMS's own public signup endpoints
router.get("/plans", getPlans);
router.post("/signup/order", paymentLimiter, createSignupOrder);
router.post("/signup/verify", paymentLimiter, verifySignupPayment);

// Legal/policy content for the signup consent step (Terms & Conditions,
// Privacy Policy) — real content from EFNBMMS's policy API.
router.get("/policy/:docType", getPolicyDocument);

// Vendor — free self-signup, then login, then a paid plan
// (order/verify expect the vendor's EFNBMMS token in Authorization: Bearer <token>)
router.get("/vendor/plans", getVendorPlans);
router.post("/vendor/signup", formLimiter, vendorSignup);
router.post("/vendor/login", loginLimiter, vendorLogin);
router.post("/vendor/subscription/order", paymentLimiter, createVendorSubscriptionOrder);
router.post("/vendor/subscription/verify", paymentLimiter, verifyVendorSubscriptionPayment);

export default router;

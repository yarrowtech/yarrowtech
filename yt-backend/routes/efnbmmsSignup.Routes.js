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
import requireCaptchaPass from "../middleware/requireCaptchaPass.js";
import rateLimit from "express-rate-limit";
import {
  captchaProvider,
  createChallenge,
  isCaptchaEnabled,
  issueCaptchaPass,
  verifyChallenge,
  verifyTurnstileToken,
} from "../utils/captcha.js";

const router = express.Router();

// Public — no auth required, mirrors EFNBMMS's own public signup endpoints
router.get("/plans", getPlans);

// Captcha: the form solves Turnstile, we verify it and hand back a short-lived signed pass
// that the order/signup routes below require.
const captchaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many security checks. Please wait a few minutes." },
});

router.get("/captcha/config", (req, res) =>
  res.json({ enabled: isCaptchaEnabled(), provider: captchaProvider() })
);

// Built-in image captcha: a fresh signed challenge per request
router.get("/captcha/challenge", captchaLimiter, (req, res) => {
  if (!isCaptchaEnabled() || captchaProvider() !== "builtin") {
    return res.status(404).json({ success: false, message: "Not available" });
  }
  res.set("Cache-Control", "no-store");
  return res.json({ success: true, ...createChallenge() });
});

router.post("/captcha/verify", captchaLimiter, async (req, res) => {
  if (!isCaptchaEnabled()) return res.json({ success: true, pass: "" });

  let ok = false;
  if (captchaProvider() === "turnstile") {
    ok = await verifyTurnstileToken(req.body?.token, req.ip);
  } else {
    // token is JSON: { id, answer }
    let parsed = {};
    try { parsed = JSON.parse(String(req.body?.token || "{}")); } catch { parsed = {}; }
    ok = verifyChallenge(parsed.id, parsed.answer);
  }

  if (!ok) {
    return res.status(400).json({ success: false, message: "The security code was wrong or expired. Please try again." });
  }
  return res.json({ success: true, pass: issueCaptchaPass() });
});

router.post("/signup/order", paymentLimiter, requireCaptchaPass, createSignupOrder);
router.post("/signup/verify", paymentLimiter, verifySignupPayment);

// Legal/policy content for the signup consent step (Terms & Conditions,
// Privacy Policy) — real content from EFNBMMS's policy API.
router.get("/policy/:docType", getPolicyDocument);

// Vendor — free self-signup, then login, then a paid plan
// (order/verify expect the vendor's EFNBMMS token in Authorization: Bearer <token>)
router.get("/vendor/plans", getVendorPlans);
router.post("/vendor/signup", formLimiter, requireCaptchaPass, vendorSignup);
router.post("/vendor/login", loginLimiter, vendorLogin);
router.post("/vendor/subscription/order", paymentLimiter, createVendorSubscriptionOrder);
router.post("/vendor/subscription/verify", paymentLimiter, verifyVendorSubscriptionPayment);

export default router;

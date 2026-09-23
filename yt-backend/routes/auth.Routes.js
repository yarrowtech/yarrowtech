import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.Controller.js";
import {
  formLimiter,
  loginLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimiters.js";

const router = express.Router();

// Register new user
router.post("/register", formLimiter, registerUser);

// Login with email + password
router.post("/login", loginLimiter, loginUser);

// Google login (frontend sends: { credential })
router.post("/google", loginLimiter, googleLogin);

// Forgot password
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

// Reset password with token
router.post("/reset-password", passwordResetLimiter, resetPassword);

export default router;

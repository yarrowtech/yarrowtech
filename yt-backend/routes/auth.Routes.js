import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.Controller.js";

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login with email + password
router.post("/login", loginUser);

// Google login (frontend sends: { credential })
router.post("/google", googleLogin);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password with token
router.post("/reset-password", resetPassword);

export default router;

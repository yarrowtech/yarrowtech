import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
} from "../controllers/auth.Controller.js";

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login with email + password
router.post("/login", loginUser);

// Google login (frontend sends: { credential })
router.post("/google", googleLogin);

export default router;

import User from "../models/User.js";
import ERPUser from "../erp/models/User.js";
import ERPClient from "../erp/models/Client.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { signErpToken } from "../erp/middleware/erpAuth.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import nodemailer from "nodemailer";
import sendEmail from "../erp/utils/sendEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createMailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email service is not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// --------------------------------
// REGISTER USER
// --------------------------------
export const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });

    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password
    });

    res.json({
      message: "Registration successful",
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// hello 

// --------------------------------
// LOGIN USER
// --------------------------------
// Single unified login: tries the website account first, then falls back to
// the ERP staff and ERP client accounts, so one form covers every login type.
export const loginUser = async (req, res) => {
  try {
    const normalizedEmail = req.body?.email?.toLowerCase()?.trim();
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1) Website customer account
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const match = await user.matchPassword(password);
      if (!match) return res.status(400).json({ message: "Incorrect password" });

      const role = "user";

      res.json({
        message: "Login successful",
        token: signErpToken({ id: user._id, email: user.email, role, name: user.name }),
        role,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role,
        },
      });

      const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      sendEmail(
        user.email,
        "New login to your YarrowTech account",
        `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#071a2d;color:#f1f5f9;border-radius:14px;padding:32px;">
          <h2 style="color:#ffcb05;margin-top:0;">New Login Detected</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>We noticed a new login to your YarrowTech account.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:120px;">Account</td>
              <td style="padding:8px 0;font-weight:600;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Time</td>
              <td style="padding:8px 0;">${loginTime} IST</td>
            </tr>
          </table>
          <p>If this was you, no action is needed.</p>
          <p style="color:#ef4444;">If you did not log in, please reset your password immediately.</p>
          <p style="margin-top:28px;color:#64748b;font-size:0.85rem;">
            — Team YarrowTech<br/>
            <a href="https://yarrowtech.co.in" style="color:#ffcb05;">yarrowtech.co.in</a>
          </p>
        </div>
        `
      );
      return;
    }

    // 2) ERP staff account (admin / manager / techlead / productuser)
    const erpUser = await ERPUser.findOne({ email: normalizedEmail });
    if (erpUser) {
      if (erpUser.status !== "active") {
        return res.status(403).json({ message: "Account is disabled. Contact administrator." });
      }

      const match = await erpUser.matchPassword(password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const role = erpUser.role;
      const name = erpUser.name || erpUser.email.split("@")[0];

      return res.json({
        message: "Login successful",
        token: signErpToken({ id: erpUser._id, email: erpUser.email, role, name }),
        role,
        user: { id: erpUser._id, name, email: erpUser.email, role },
      });
    }

    // 3) ERP client account
    const client = await ERPClient.findOne({ email: normalizedEmail });
    if (client) {
      if (client.status && client.status !== "active") {
        return res.status(403).json({ message: "Client account is inactive" });
      }

      if (!client.password) {
        return res.status(400).json({ message: "Client account has no password. Contact support." });
      }

      const match = await client.matchPassword(password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const role = "client";
      const name = client.name || client.email.split("@")[0];

      return res.json({
        message: "Login successful",
        token: signErpToken({ id: client._id, email: client.email, role, name }),
        role,
        user: { id: client._id, name, email: client.email, role },
      });
    }

    return res.status(400).json({ message: "User not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------
// GOOGLE LOGIN
// --------------------------------
export const googleLogin = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google login is not configured" });
    }

    const { credential } = req.body;

    if (!credential)
      return res.status(400).json({ message: "No Google credential received" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub: googleId } = payload;
    const normalizedEmail = email?.toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Google account email not available" });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name,
        email: normalizedEmail,
        googleId,
        avatar: picture,
        password: googleId + process.env.JWT_SECRET,
      });
    } else {
      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }

      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        shouldSave = true;
      }

      if (name && user.name !== name) {
        user.name = name;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    res.json({
      message: "Google login successful",
      token: generateToken(user),
      user,
    });
  } catch (err) {
    console.log("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

// --------------------------------
// FORGOT PASSWORD
// --------------------------------
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body?.email?.trim()?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If that email exists, a password reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    const frontendBase =
      process.env.FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:5173";
    const resetLink = `${frontendBase}/?resetToken=${rawToken}`;

    const transporter = createMailTransporter();

    await transporter.sendMail({
      from: `"YarrowTech Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your YarrowTech password",
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;background:#071a2d;color:#ffffff;border-radius:14px;">
          <h2 style="margin-top:0;color:#ffb128;">Reset your password</h2>
          <p>Hello ${user.name || "there"},</p>
          <p>We received a request to reset your YarrowTech account password.</p>
          <p style="margin:24px 0;">
            <a
              href="${resetLink}"
              style="display:inline-block;padding:12px 20px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;"
            >
              Reset Password
            </a>
          </p>
          <p>This link will expire in 30 minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to send password reset email",
    });
  }
};

// --------------------------------
// RESET PASSWORD
// --------------------------------
export const resetPassword = async (req, res) => {
  try {
    const token = req.body?.token?.trim();
    const password = req.body?.password;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to reset password",
    });
  }
};

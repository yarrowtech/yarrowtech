import nodemailer from "nodemailer";
import { Contact } from "../models/contact.js";
import logger from "../utils/logger.js";

/* -------------------------------------------------------
   Ensure Environment Variables Exist
------------------------------------------------------- */
const assertEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
};

// Visitor input goes into email HTML, so escape it.
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);

/* -------------------------------------------------------
   SUBMIT CONTACT FORM  (POST /api/contact)
------------------------------------------------------- */
export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields (name, email, message) are required.",
      });
    }

    // Save to DB
    const savedEntry = await Contact.create({ name, email, message });

    // The message is saved; email is best-effort so an SMTP problem
    // doesn't show the visitor an error for a submission we already have.
    try {
      assertEnv("EMAIL_USER");
      assertEnv("EMAIL_PASS");

      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safeMessage = escapeHtml(message);

      // Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Mail to Admin
      await transporter.sendMail({
        from: `"YarrowTech Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `📩 New Contact Message from ${String(name).slice(0, 100)}`,
        html: `
          <div style="font-family:Arial; padding:20px;">
            <h2>📬 New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Message:</strong></p>
            <p style="background:#f1f1f1;padding:10px;border-radius:6px;">
              ${safeMessage}
            </p>
            <hr/>
            <p style="font-size:12px;color:#666;">Sent from YarrowTech Website</p>
          </div>
        `,
      });

      // Auto-reply to user
      await transporter.sendMail({
        from: `"YarrowTech Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Thank you for contacting YarrowTech!",
        html: `
          <div style="font-family:Arial; padding:20px; background:#071a2d; color:white; border-radius:12px;">
            <h2 style="color:#ff9a1f;">Thank you, ${safeName}! 🙌</h2>
            <p>We’ve received your message and our support team will respond shortly.</p>

            <div style="margin-top:15px; padding:12px 15px; background:#0d2538; border-radius:8px;">
              <strong>Your Message:</strong><br/>
              <em>"${safeMessage}"</em>
            </div>

            <p style="margin-top:20px;">Warm regards,<br/>— Team YarrowTech</p>
          </div>
        `,
      });
    } catch (mailError) {
      logger.error(
        { err: mailError, contactId: savedEntry._id },
        "Contact saved but email notification failed"
      );
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      contact: savedEntry,
    });

  } catch (error) {
    logger.error({ err: error }, "Contact Form Error");

    return res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Something went wrong. Please try again later."
          : error.message,
    });
  }
};

/* -------------------------------------------------------
   GET ALL CONTACTS (GET /api/contact/all) – ADMIN
------------------------------------------------------- */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: contacts.length,
      contacts,
    });
  } catch (error) {
    logger.error({ err: error }, "Error fetching contacts");
    return res.status(500).json({
      success: false,
      error: "Failed to fetch contacts",
    });
  }
};

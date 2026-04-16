// backend/erp/seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import ERPUser from "./models/User.js";

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const exists = await ERPUser.findOne({ role: "admin" });
    if (exists) {
      console.log("❌ Admin already exists");
      process.exit(0);
    }

    await ERPUser.create({
      email: "admin@yarrowtech.com",
      password: "Admin@123", // ⬅ will be hashed by pre-save hook
      role: "admin",
      status: "active",
    });

    console.log("✅ Admin created successfully");
    console.log("📧 Email: admin@yarrowtech.com");
    console.log("🔑 Password: Admin@123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed admin failed:", err.message);
    process.exit(1);
  }
}

seedAdmin();
 
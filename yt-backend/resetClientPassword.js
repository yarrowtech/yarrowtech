import mongoose from "mongoose";
import ERPClient from "./erp/models/Client.js";
import dotenv from "dotenv";

dotenv.config();

const email = process.argv[2];
const newPassword = process.argv[3];

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (!email || !newPassword) {
      console.log("❌ Usage: node resetClientPassword.js email password");
      process.exit(0);
    }

    const client = await ERPClient.findOne({ email });

    if (!client) {
      console.log("❌ Client not found");
      process.exit(0);
    }

    client.password = newPassword;
    await client.save();

    console.log("✅ Password reset successful for:", email);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPassword();

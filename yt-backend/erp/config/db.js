// erp/config/db.js
import mongoose from "mongoose";

const connectErpDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 ERP Database Connected");
  } catch (error) {
    console.error("❌ ERP DB Error:", error.message);
    process.exit(1);
  }
};

export default connectErpDB;

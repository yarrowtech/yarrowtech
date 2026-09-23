// erp/config/db.js
import mongoose from "mongoose";
import logger from "../../utils/logger.js";

const connectErpDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("ERP database connected");
  } catch (error) {
    logger.error({ err: error }, "ERP database connection failed");
    process.exit(1);
  }
};

export default connectErpDB;

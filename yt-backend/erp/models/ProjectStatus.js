// erp/models/ProjectStatus.js
import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "ERPProject" },
  status: String,
  note: String,
  updatedByEmail: String,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ERPProjectStatus", statusSchema);

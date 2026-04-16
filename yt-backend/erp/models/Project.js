// // erp/models/Project.js
// import mongoose from "mongoose";

// const projectSchema = new mongoose.Schema({
//   projectId: { type: String, unique: true },
//   name: { type: String, required: true },
//   description: { type: String },
//   projectDetails: { type: String },
//   client: { type: mongoose.Schema.Types.ObjectId, ref: "ERPClient" },
//   clientName: String,
//   clientEmail: String,
//   managerEmail: String,
//   techLeadEmail: String,
//   expectedDelivery: Date,
//   status: { type: String, default: "new" },
//   createdAt: { type: Date, default: Date.now }
// });

// // ⬇⬇ FIX for OverwriteModelError ⬇⬇
// export default mongoose.models.ERPProject ||
//   mongoose.model("ERPProject", projectSchema);



import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true }, // display only
  name: { type: String, required: true },
  projectDetails: String,

  /* ✅ CLIENT RELATION */
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ERPClient",
    required: true,
  },
  clientName: String,
  clientEmail: String,

  /* ✅ MANAGER REAL RELATION (THIS FIXED YOUR ISSUE) */
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ERPUser",
    required: true,
  },

  /* ✅ KEEP EMAILS FOR DISPLAY / EMAIL PURPOSE */
  managerEmail: String,
  techLeadEmail: String,

  expectedDelivery: Date,
  status: { type: String, default: "pending" },
  progress: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ERPProject ||
  mongoose.model("ERPProject", projectSchema);

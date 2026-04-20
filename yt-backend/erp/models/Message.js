import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "ERPProject" },
  productUser: { type: mongoose.Schema.Types.ObjectId, ref: "ERPUser" },

  fromEmail: String,
  toEmail: String,

  roleFrom: { type: String, enum: ["manager", "techlead", "client", "productuser"] },
  roleTo:   { type: String, enum: ["manager", "techlead", "client", "productuser"] },

  text: String,
  read: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ERPMessage", messageSchema);

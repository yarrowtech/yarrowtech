import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ERPProject",
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: String,
    default: "project-payment",
  },
  method: {
    type: String,
    required: true,
  },
  invoiceNo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "paid",
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ERPPayment", paymentSchema);

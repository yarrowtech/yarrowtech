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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ERPPayment", paymentSchema);

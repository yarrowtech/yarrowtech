import mongoose from "mongoose";

const productUserPaymentSchema = new mongoose.Schema(
  {
    productUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ERPUser",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    invoiceNo: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ERPProductUserPayment ||
  mongoose.model("ERPProductUserPayment", productUserPaymentSchema);

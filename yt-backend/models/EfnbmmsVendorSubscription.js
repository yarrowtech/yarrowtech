import mongoose from "mongoose";

const EfnbmmsVendorSubscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    // EFNBMMS's vendor record only stores one government ID (used for GST),
    // so PAN has nowhere to go on their side — kept here for our own records.
    panNumber: { type: String, trim: true, uppercase: true, default: "" },

    planCode: { type: String, required: true, uppercase: true, trim: true },
    amount: { type: Number, default: 0 },

    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: "" },

    status: {
      type: String,
      enum: ["created", "verified", "failed"],
      default: "created",
    },
    failureReason: { type: String, default: "" },

    efnbmmsVendorId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model(
  "EfnbmmsVendorSubscription",
  EfnbmmsVendorSubscriptionSchema
);

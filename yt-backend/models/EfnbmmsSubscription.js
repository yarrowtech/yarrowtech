import mongoose from "mongoose";

const EfnbmmsSubscriptionSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },

    planCode: { type: String, required: true, uppercase: true, trim: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    amount: { type: Number, default: 0 },

    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: "" },

    status: {
      type: String,
      enum: ["created", "verified", "failed"],
      default: "created",
    },
    failureReason: { type: String, default: "" },

    efnbmmsAdminId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("EfnbmmsSubscription", EfnbmmsSubscriptionSchema);

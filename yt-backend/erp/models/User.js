import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "manager", "techlead", "productuser"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    mobileNumber: {
      type: String,
      default: "",
      trim: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ERPUser",
      default: null,
    },

    managerEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    productName: {
      type: String,
      default: "",
      trim: true,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Set only for product users created from an EFNBMMS signup/vendor
    // flow — their total amount and payment history are written
    // automatically from verified Razorpay payments (see
    // utils/efnbmmsProductUserSync.js), so the admin/manager UI locks
    // manual payment editing for these records to avoid double entry.
    billingSource: {
      type: String,
      enum: ["manual", "efnbmms"],
      default: "manual",
    },
  },
  { timestamps: true }
);

/* ================= PASSWORD HASH ================= */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* ================= PASSWORD MATCH ================= */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.ERPUser ||
  mongoose.model("ERPUser", userSchema);

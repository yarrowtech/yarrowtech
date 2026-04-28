import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientEmail: { type: String, required: true, lowercase: true, trim: true },
    recipientRole:  { type: String, required: true },
    title:          { type: String, required: true, trim: true },
    message:        { type: String, default: "", trim: true },
    type: {
      type: String,
      enum: ["career_application", "demo_request", "project_created", "project_updated", "payment_added", "system"],
      default: "system",
    },
    link:   { type: String, default: "" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientEmail: 1, createdAt: -1 });
notificationSchema.index({ recipientEmail: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

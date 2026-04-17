import mongoose from "mongoose";

const deletedClientHistorySchema = new mongoose.Schema(
  {
    originalClientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ERPUser",
      required: true,
    },
    managerEmail: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "inactive",
    },
    company: {
      type: String,
      default: "",
    },
    clientCode: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    projects: [
      {
        projectId: String,
        name: String,
        status: String,
        progress: Number,
        expectedDelivery: Date,
      },
    ],
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DeletedClientHistory ||
  mongoose.model("DeletedClientHistory", deletedClientHistorySchema);

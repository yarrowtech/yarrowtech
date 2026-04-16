// import mongoose from "mongoose";

// const RequestDemoSchema = new mongoose.Schema(
//   {
//     userId: String,
//     name: String,
//     email: String,
//     company: String,
//     message: String,
//   },
//   { timestamps: true }
// );

// export default mongoose.model("RequestDemo", RequestDemoSchema);






import mongoose from "mongoose";

const RequestDemoSchema = new mongoose.Schema(
  {
    // Basic lead info
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    serviceInterested: {
      type: String,
      required: true,
    },

    preferredContactMethod: {
      type: String,
      enum: ["email", "phone", "whatsapp"],
      default: "email",
    },

    projectDescription: {
      type: String,
      required: true,
    },

    // CRM fields
    status: {
      type: String,
      enum: ["new", "contacted", "in-progress", "closed"],
      default: "new",
    },

    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ERPUser",
      default: null,
    },

    // Audit
    createdByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RequestDemo", RequestDemoSchema);

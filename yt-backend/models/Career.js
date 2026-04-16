// import mongoose from "mongoose";

// const CareerSchema = new mongoose.Schema(
//   {
//     userId: String,
//     name: String,
//     email: String,
//     message: String,
//     resumeUrl: String,
//     resumeName: String,
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Career", CareerSchema);



import mongoose from "mongoose";

const CareerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    // optional: if later you attach user
    userId: {
      type: String,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Career", CareerSchema);

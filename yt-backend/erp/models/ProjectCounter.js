import mongoose from "mongoose";

const projectCounterSchema = new mongoose.Schema({
  _id: String,
  sequence: { type: Number, default: 0 },
});

export default mongoose.models.ERPProjectCounter ||
  mongoose.model("ERPProjectCounter", projectCounterSchema);

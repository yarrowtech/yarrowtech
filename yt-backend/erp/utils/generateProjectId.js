import ProjectCounter from "../models/ProjectCounter.js";

export const generateProjectId = async () => {
  const year = new Date().getFullYear();
  const counter = await ProjectCounter.findOneAndUpdate(
    { _id: `project-${year}` },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true }
  );
  return `YT-${String(year).slice(-2)}-${String(counter.sequence).padStart(4, "0")}`;
};

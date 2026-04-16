// backend/controllers/career.Controller.js
import Career from "../models/Career.js";

export const submitCareer = async (req, res) => {
  try {
    // Debug logs
    console.log(
      "REQ.FILE:",
      req.file ? JSON.stringify(req.file, null, 2) : "NO FILE"
    );
    console.log(
      "REQ.BODY:",
      req.body ? JSON.stringify(req.body, null, 2) : "NO BODY"
    );

    if (!req.file) {
      return res.status(400).json({ message: "Resume is required" });
    }

    const data = await Career.create({
      ...req.body,
      resumeUrl: req.file.path,
      resumeName: req.file.originalname,
    });

    res.json({ message: "Career application submitted", data });
  } catch (err) {
    console.error("Career Submit Error:", JSON.stringify(err, null, 2));
    res.status(500).json({ message: err.message });
  }
};

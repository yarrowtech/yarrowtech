// backend/controllers/career.Controller.js
import Career from "../models/Career.js";

export const submitCareer = async (req, res) => {
  try {
    console.log("REQ.FILE:", req.file ? JSON.stringify(req.file, null, 2) : "NO FILE");
    console.log("REQ.BODY:", req.body ? JSON.stringify(req.body, null, 2) : "NO BODY");

    if (!req.file) {
      return res.status(400).json({ message: "Resume is required" });
    }

    const data = await Career.create({
      ...req.body,
      resumeUrl:    req.file.path,
      resumeName:   req.file.originalname,
      resumePublicId: req.file.filename,   // store public_id for signed downloads
    });

    res.json({ message: "Career application submitted", data });
  } catch (err) {
    console.error("Career Submit Error:", JSON.stringify(err, null, 2));
    res.status(500).json({ message: err.message });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const career = await Career.findById(id);

    console.log("Download requested for:", id, "| resumeUrl:", career?.resumeUrl);

    if (!career?.resumeUrl) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Insert fl_attachment into the Cloudinary URL → forces Content-Disposition: attachment
    // e.g. .../upload/v123/... → .../upload/fl_attachment/v123/...
    const downloadUrl = career.resumeUrl.includes("/upload/")
      ? career.resumeUrl.replace("/upload/", "/upload/fl_attachment/")
      : career.resumeUrl;

    console.log("Download URL:", downloadUrl);

    res.json({ url: downloadUrl, filename: career.resumeName || "resume" });
  } catch (err) {
    console.error("Download Resume Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllCareerSubmissions = async (_req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, total: careers.length, careers });
  } catch (err) {
    console.error("Career Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch career applications" });
  }
};

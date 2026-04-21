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

export const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const career = await Career.findById(id);
    if (!career?.resumeUrl) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const fileRes = await fetch(career.resumeUrl);
    if (!fileRes.ok) {
      return res.status(502).json({ message: "Failed to fetch resume from storage" });
    }

    const contentType = fileRes.headers.get("content-type") || "application/octet-stream";
    const filename = encodeURIComponent(career.resumeName || "resume");

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);

    const { Readable } = await import("stream");
    Readable.fromWeb(fileRes.body).pipe(res);
  } catch (err) {
    console.error("Download Resume Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllCareerSubmissions = async (req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: careers.length,
      careers,
    });
  } catch (err) {
    console.error("Career Fetch Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch career applications",
    });
  }
};

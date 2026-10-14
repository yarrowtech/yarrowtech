import ERPProject, {
  REQUIREMENT_LIST_FIELDS,
  REQUIREMENT_PRIORITIES,
  REQUIREMENT_STRING_FIELDS,
} from "../models/Project.js";
import logger from "../../utils/logger.js";
import { buildSrsPayload } from "../utils/srsExport.js";
import { sendSrsLockedWebhook } from "../utils/srsWebhook.js";
import { validatePaymentTerms } from "./srs.controller.js";

/* key is the project's _id or its display id such as YT-26-0001 */
const findProject = async (key) => {
  const isId = /^[a-f0-9]{24}$/i.test(key);
  return ERPProject.findOne(
    isId ? { $or: [{ _id: key }, { projectId: key }] } : { projectId: key }
  ).populate("client");
};

/* GET /api/erp/external/srs: locked projects, newest lock first */
export const listLockedSrs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const filter = { srsLockedAt: { $ne: null } };
    const [items, total] = await Promise.all([
      ERPProject.find(filter)
        .sort({ srsLockedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("projectId name clientName clientEmail srsLockedAt srsRevision srsExternalUpdatedAt")
        .lean(),
      ERPProject.countDocuments(filter),
    ]);
    res.json({
      success: true,
      total,
      items: items.map((p) => ({
        id: String(p._id),
        projectId: p.projectId,
        name: p.name,
        clientName: p.clientName || "",
        clientEmail: p.clientEmail || "",
        lockedAt: p.srsLockedAt,
        revision: p.srsRevision || 0,
        externalUpdatedAt: p.srsExternalUpdatedAt || null,
      })),
    });
  } catch (err) {
    logger.error({ err }, "External SRS list error");
    res.status(500).json({ message: "Failed to list locked SRS documents" });
  }
};

/* GET /api/erp/external/srs/:key */
export const getLockedSrs = async (req, res) => {
  try {
    const project = await findProject(req.params.key);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!project.srsLockedAt) return res.status(409).json({ message: "This SRS is not locked yet" });
    res.json({ success: true, srs: buildSrsPayload(project) });
  } catch (err) {
    logger.error({ err }, "External SRS get error");
    res.status(500).json({ message: "Failed to fetch SRS" });
  }
};

/* PUT /api/erp/external/srs/:key
   The only way a locked SRS can change.
   Body: { revision, requirements?: {...}, functionalRequirements?: [...], paymentTerms?: {...} } */
export const updateLockedSrs = async (req, res) => {
  try {
    const project = await findProject(req.params.key);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!project.srsLockedAt) {
      return res.status(409).json({ message: "This SRS is not locked yet; it is still edited inside the ERP" });
    }

    const body = req.body || {};
    if (body.revision !== (project.srsRevision || 0)) {
      return res.status(409).json({
        message: "The SRS changed. Fetch the latest revision before updating",
        revision: project.srsRevision || 0,
      });
    }

    const set = { srsExternalUpdatedAt: new Date() };
    const incoming = body.requirements && typeof body.requirements === "object" ? body.requirements : {};

    REQUIREMENT_STRING_FIELDS.forEach((key) => {
      if (incoming[key] !== undefined) {
        set[`requirements.${key}`] = String(incoming[key] ?? "").trim().slice(0, 3000);
      }
    });
    REQUIREMENT_LIST_FIELDS.forEach((key) => {
      if (incoming[key] !== undefined) {
        set[`requirements.${key}`] = (Array.isArray(incoming[key]) ? incoming[key] : [])
          .map((item) => String(item || "").trim().slice(0, 200))
          .filter(Boolean)
          .slice(0, key === "brandColors" ? 12 : 50);
      }
    });
    if (body.functionalRequirements !== undefined) {
      set["requirements.functionalRequirements"] = (
        Array.isArray(body.functionalRequirements) ? body.functionalRequirements : []
      )
        .map((item) => ({
          title: String(item?.title || "").trim().slice(0, 200),
          description: String(item?.description || "").trim().slice(0, 1500),
          priority: REQUIREMENT_PRIORITIES.includes(item?.priority) ? item.priority : "Should have",
        }))
        .filter((item) => item.title)
        .slice(0, 100);
    }
    if (body.paymentTerms !== undefined) {
      let terms;
      try {
        terms = validatePaymentTerms(body.paymentTerms);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
      set.srsPaymentTerms = { ...terms, updatedAt: new Date() };
      set.totalPayment = terms.total;
    }

    if (Object.keys(set).length === 1) return res.status(400).json({ message: "Nothing to update" });

    // Compare-and-swap on the revision; the document stays locked.
    const updated = await ERPProject.findOneAndUpdate(
      { _id: project._id, srsLockedAt: { $ne: null }, srsRevision: project.srsRevision || 0 },
      { $set: set, $inc: { srsRevision: 1 } },
      { new: true }
    ).populate("client");
    if (!updated) {
      return res.status(409).json({ message: "The SRS changed. Fetch the latest revision before updating" });
    }

    logger.info({ projectId: updated.projectId, revision: updated.srsRevision }, "Locked SRS updated by external admin");
    res.json({ success: true, srs: buildSrsPayload(updated) });
  } catch (err) {
    logger.error({ err }, "External SRS update error");
    res.status(500).json({ message: "Failed to update SRS" });
  }
};

/* POST /api/erp/external/srs/:key/resend: push the webhook again */
export const resendLockedSrsWebhook = async (req, res) => {
  try {
    const project = await findProject(req.params.key);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!project.srsLockedAt) return res.status(409).json({ message: "This SRS is not locked yet" });
    if (!process.env.SRS_WEBHOOK_URL) return res.status(503).json({ message: "Webhook URL is not configured" });

    await sendSrsLockedWebhook(project);
    const fresh = await ERPProject.findById(project._id)
      .select("srsWebhookStatus srsWebhookAt srsWebhookError")
      .lean();
    res.json({
      success: true,
      webhook: { status: fresh.srsWebhookStatus, at: fresh.srsWebhookAt, error: fresh.srsWebhookError || "" },
    });
  } catch (err) {
    logger.error({ err }, "External SRS resend error");
    res.status(500).json({ message: "Failed to resend webhook" });
  }
};

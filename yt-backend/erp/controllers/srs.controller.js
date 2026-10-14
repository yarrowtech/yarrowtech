import ERPProject from "../models/Project.js";
import ERPUser from "../models/User.js";
import { randomUUID } from "node:crypto";
import { sendSrsLockedWebhook } from "../utils/srsWebhook.js";

// Compare-and-swap guards edits, attachments and approval against concurrent changes.
export const editableSrsFilter = (project) => ({
  _id: project._id,
  srsLockedAt: null,
  ...(project.srsRevision
    ? { srsRevision: project.srsRevision }
    : { $or: [{ srsRevision: 0 }, { srsRevision: { $exists: false } }] }),
});

export const validatePaymentTerms = (body = {}) => {
  const cents = (value) => {
    if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 1e10 && Math.abs(n * 100 - Math.round(n * 100)) < 0.001
      ? Math.round(n * 100) : null;
  };
  const total = cents(body.total);
  if (total === null || !Array.isArray(body.breakdown) || !body.breakdown.length || body.breakdown.length > 30) {
    throw new Error("Enter a valid total and 1–30 payment instalments");
  }
  const breakdown = body.breakdown.map((row) => {
    const amount = cents(row?.amount);
    const label = String(row?.label || "").trim();
    const due = String(row?.due || "").trim();
    if (amount === null || !label || label.length > 200 || !due || due.length > 300) {
      throw new Error("Each instalment needs a name, valid amount and due date or milestone");
    }
    const dueDate = String(row.dueDate || "");
    if (dueDate && (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate)) || new Date(dueDate).toISOString().slice(0, 10) !== dueDate)) {
      throw new Error("Enter a valid instalment due date");
    }
    const id = row.id ? String(row.id) : randomUUID();
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error("Invalid instalment identifier");
    return { id, label, amount: amount / 100, due, dueDate, description: String(row.description || "").trim().slice(0, 1000) };
  });
  if (new Set(breakdown.map((row) => row.id)).size !== breakdown.length) throw new Error("Instalment identifiers must be unique");
  if (breakdown.reduce((sum, row) => sum + Math.round(row.amount * 100), 0) !== total) {
    throw new Error("Payment breakdown must add up to the total");
  }
  return { total: total / 100, currency: "INR", breakdown, notes: String(body.notes || "").trim().slice(0, 3000) };
};

// Admins can act on any project; managers only on projects they own.
const projectScope = (req) => (req.erpUser?.role === "admin"
  ? { _id: req.params.id }
  : { _id: req.params.id, manager: req.erpUser?._id });

export const saveSrsPaymentTerms = async (req, res) => {
  try {
    const project = await ERPProject.findOne(projectScope(req));
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.srsLockedAt || req.body?.revision !== (project.srsRevision || 0)) {
      return res.status(409).json({ message: "The document changed or is locked. Reload before editing payment terms" });
    }
    // Keep an instalment's id stable across re-saves so recorded payments stay linked to it.
    const previous = project.srsPaymentTerms?.breakdown || [];
    const body = {
      ...req.body,
      breakdown: Array.isArray(req.body?.breakdown)
        ? req.body.breakdown.map((row) => {
            if (row?.id) return row;
            const match = previous.find((old) => String(old.label || "").trim().toLowerCase() === String(row?.label || "").trim().toLowerCase());
            return match?.id ? { ...row, id: match.id } : row;
          })
        : req.body?.breakdown,
    };
    let terms;
    try { terms = validatePaymentTerms(body); }
    catch (err) { return res.status(400).json({ message: err.message }); }
    const updated = await ERPProject.findOneAndUpdate(editableSrsFilter(project), {
      $set: { srsPaymentTerms: { ...terms, updatedAt: new Date(), updatedBy: req.erpUser._id },
        totalPayment: terms.total,
        "requirements.approved": "", "requirements.approvalName": "", "requirements.approvedOn": "",
        "requirements.paymentApproved": "", "requirements.paymentApprovedOn": "" },
      $inc: { srsRevision: 1 },
    }, { new: true });
    if (!updated) return res.status(409).json({ message: "The document changed. Reload before saving payment terms" });
    return res.json({ success: true, project: updated });
  } catch (err) {
    return res.status(err.name === "CastError" ? 400 : 500).json({ message: "Unable to save payment terms" });
  }
};

export const approveProjectSrs = async (req, res) => {
  try {
    const managerId = req.erpUser?._id;
    const project = await ERPProject.findOne(projectScope(req));
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.srsLockedAt) return res.status(409).json({ message: "This SRS is already agreed and locked" });
    if (req.body?.agree !== true || req.body?.revision !== (project.srsRevision || 0)) {
      return res.status(409).json({ message: "Reload and review the current SRS before agreeing" });
    }
    if (project.requirements?.approved !== "yes" || !project.requirements?.approvalName) {
      return res.status(400).json({ message: "The client must approve the SRS first" });
    }
    const manager = await ERPUser.findById(managerId);
    if (!project.srsPaymentTerms?.updatedAt || project.requirements?.paymentApproved !== "yes") {
      return res.status(400).json({ message: "Set payment terms and obtain client payment approval before locking" });
    }
    if (!manager) return res.status(403).json({ message: "Manager account not found" });
    const now = new Date();
    const updated = await ERPProject.findOneAndUpdate(
      { ...editableSrsFilter(project), "requirements.approved": "yes", "requirements.paymentApproved": "yes" },
      { $set: { srsLockedAt: now, srsManagerApprovedAt: now,
        srsManagerName: manager.name || manager.email, srsManagerId: managerId },
        $inc: { srsRevision: 1 } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "The SRS changed. Reload and review it before agreeing" });
    // Hand the locked SRS to the other project's admin; failures are logged, not fatal.
    sendSrsLockedWebhook(updated).catch(() => {});
    return res.json({ success: true, project: updated });
  } catch (err) {
    return res.status(err.name === "CastError" ? 400 : 500).json({ message: "Unable to approve the SRS" });
  }
};

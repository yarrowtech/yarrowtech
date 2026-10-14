import crypto from "crypto";

/* The locked SRS as the other project's admin receives it. */
export const buildSrsPayload = (project) => {
  const p = typeof project.toObject === "function" ? project.toObject() : project;
  const client = p.client && typeof p.client === "object" ? p.client : {};
  const { updatedAt, ...requirements } = p.requirements || {};

  return {
    id: String(p._id),
    projectId: p.projectId,
    name: p.name,
    status: p.status,
    revision: p.srsRevision || 0,
    locked: Boolean(p.srsLockedAt),
    lockedAt: p.srsLockedAt || null,
    client: {
      name: p.clientName || client.name || "",
      email: p.clientEmail || client.email || "",
      phone: client.phone || "",
      company: client.company || "",
    },
    managerEmail: p.managerEmail || "",
    agreement: {
      clientName: requirements.approvalName || "",
      clientApprovedOn: requirements.approvedOn || "",
      managerName: p.srsManagerName || "",
      managerApprovedAt: p.srsManagerApprovedAt || null,
    },
    requirements,
    requirementsUpdatedAt: updatedAt || null,
    paymentTerms: p.srsPaymentTerms || null,
    documents: (p.requirementDocuments || []).map((d) => ({
      id: String(d._id),
      name: d.name,
      url: d.url,
      size: d.size || 0,
      uploadedAt: d.uploadedAt,
    })),
    externalUpdatedAt: p.srsExternalUpdatedAt || null,
  };
};

export const signBody = (body, secret) =>
  crypto.createHmac("sha256", secret).update(body).digest("hex");

import PDFDocument from "pdfkit";
import ERPProject from "../models/Project.js";
import ERPPayment from "../models/Payment.js";
import { calculateProjectPaymentSummary } from "../utils/paymentSummary.js";

const SECTIONS = [
  ["Introduction", [["Business / company name", "businessName"], ["Project type", "projectType"], ["Purpose", "purpose"], ["Scope", "overview"], ["Objectives", "goals"], ["Definitions & abbreviations", "glossary"], ["References", "referenceLinks"]]],
  ["Overall Description", [["Target audience", "targetAudience"], ["User roles & permissions", "userRoles"], ["Industry", "industry"], ["Languages", "languages"], ["Platforms", "platforms"], ["Preferred technologies", "technology"], ["Constraints", "constraints"], ["Assumptions & dependencies", "assumptions"], ["Competitors", "competitors"]]],
  ["Functional Requirements", [["Pages / screens", "pages"], ["Additional modules", "extras"], ["Business rules", "businessRules"], ["Out of scope", "outOfScope"]]],
  ["External Interfaces & Design", [["Brand colors", "brandColors"], ["Design style", "designStyles"], ["Logo", "logoStatus"], ["Font preference", "fontPreference"], ["Content", "contentProvider"], ["Integrations", "integrations"], ["Other interfaces", "externalInterfaces"]]],
  ["Non-Functional Requirements", [["Performance", "nfPerformance"], ["Security", "nfSecurity"], ["Usability", "nfUsability"], ["Reliability & availability", "nfReliability"], ["Compatibility", "nfCompatibility"]]],
  ["Delivery, Timeline & Acceptance", [["Hosting", "hostingStatus"], ["Domain status", "domainStatus"], ["Domain name", "domainName"], ["Preferred launch date", "launchDate"], ["Budget range", "budgetRange"], ["Acceptance criteria", "acceptanceCriteria"], ["Additional notes", "additionalNotes"]]],
  ["Business Materials & Supporting Documents", [["Company profile", "companyProfile"], ["Brand materials", "brandMaterials"], ["Current website / application", "existingSystem"], ["Existing technical documentation", "existingDocumentation"], ["Product catalog & sample data", "catalogData"], ["Database structure", "databaseStructure"], ["API documentation", "apiDocumentation"], ["Signed agreements", "agreementNotes"]]],
  ["Project Feedback & Final Acceptance", [["Design feedback", "designFeedback"], ["Change requests", "changeRequests"], ["UAT feedback", "uatFeedback"], ["Final acceptance notes", "finalAcceptanceNotes"]]],
  ["Contact & Mutual Agreement", [["Client contact", "contactName"], ["Phone / WhatsApp", "contactPhone"], ["Email", "contactEmail"]]],
];

const displayDate = (value) => {
  const date = value && new Date(value);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
    : "Not recorded";
};

export const createSrsPdf = (project, payments = []) => new Promise((resolve, reject) => {
  const pdf = new PDFDocument({ size: "A4", bufferPages: true,
    margins: { top: 72, bottom: 64, left: 48, right: 48 },
    info: { Title: `SRS - ${project.name || "Project"}`, Author: "Yarrowtech", Subject: "Software Requirements Specification" } });
  const chunks = [];
  pdf.on("data", (chunk) => chunks.push(chunk));
  pdf.on("end", () => resolve(Buffer.concat(chunks)));
  pdf.on("error", reject);
  const req = project.requirements || {};
  const width = pdf.page.width - 96;
  const ink = "#182536", muted = "#526175", accent = "#CC6500";
  const clean = (value) => String(value).replace(/₹/g, "INR ");
  const header = () => {
    pdf.font("Helvetica-Bold").fontSize(10).fillColor(accent).text("YARROWTECH", 48, 30, { lineBreak: false });
    pdf.font("Helvetica").fontSize(8).fillColor(muted).text("PROJECT REQUIREMENTS / SRS", 310, 32, { width: width - 262, align: "right", lineBreak: false });
    pdf.moveTo(48, 51).lineTo(48 + width, 51).strokeColor("#E1E6ED").stroke();
    pdf.x = 48; pdf.y = 72;
  };
  header();
  pdf.on("pageAdded", header);
  const ensure = (height) => { if (pdf.y + height > pdf.page.height - 64) pdf.addPage(); };
  const text = (value) => pdf.font("Helvetica").fontSize(10).fillColor(ink).text(clean(value), 48, pdf.y, { width, lineGap: 4 });
  const field = (label, value) => {
    if (!value || (Array.isArray(value) && !value.length)) return;
    const content = Array.isArray(value) ? value.join("  /  ") : String(value);
    pdf.font("Helvetica-Bold").fontSize(10);
    const labelHeight = pdf.heightOfString(label, { width });
    pdf.font("Helvetica").fontSize(10);
    const contentHeight = pdf.heightOfString(clean(content), { width, lineGap: 4 });
    ensure(Math.min(labelHeight + contentHeight + 20, 170));
    pdf.font("Helvetica-Bold").fontSize(10).fillColor(ink).text(label, 48, pdf.y, { width });
    pdf.y += 5;
    text(content);
    pdf.y += 13;
  };
  const section = (number, title) => {
    ensure(108);
    const y = pdf.y + 5;
    pdf.roundedRect(48, y, width, 34, 5).fill("#F0F3F7");
    pdf.rect(48, y, 4, 34).fill(accent);
    pdf.font("Helvetica-Bold").fontSize(12).fillColor(ink).text(`${number}.  ${title}`, 61, y + 10, { width: width - 26 });
    pdf.x = 48; pdf.y = y + 49;
  };
  pdf.font("Helvetica-Bold").fontSize(26).fillColor(ink).text("Software Requirements\nSpecification", 48, 83, { width, lineGap: 3 });
  pdf.y += 14;
  field("Project", project.name || "Untitled project");
  field("Project ID", project.projectId || String(project._id || "Not assigned"));
  field("Document status", project.srsLockedAt ? "AGREED & LOCKED" : "DRAFT / AWAITING AGREEMENT");
  field("Last saved", displayDate(req.updatedAt));
  pdf.moveDown(0.4);
  SECTIONS.forEach(([title, fields], index) => {
    if (index === 8) {
      section(9, "Payment Terms & Breakdown");
      const terms = project.srsPaymentTerms;
      const money = (amount) => `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (terms?.updatedAt) {
        field("Total project amount", money(terms.total));
        (terms.breakdown || []).forEach((row, i) => {
          field(`${i + 1}. ${row.label}`, `Amount: ${money(row.amount)}${terms.total > 0 ? ` (${(row.amount / terms.total * 100).toFixed(1)}%)` : ""}\nMilestone: ${row.due}${row.dueDate ? `\nDue date: ${displayDate(row.dueDate)}` : ""}${row.description ? `\nDetails: ${row.description}` : ""}`);
        });
        field("Payment notes", terms.notes);
        field("Client payment approval", req.paymentApproved === "yes"
          ? `Approved by ${req.approvalName}\nDate: ${displayDate(req.paymentApprovedOn)}` : "Pending client approval");
      } else { text("The manager has not set payment terms yet."); pdf.y += 14; }
    }
    section(index === 8 ? 10 : index + 1, title);
    let hasContent = false;
    if (index === 2 && req.functionalRequirements?.length) {
      req.functionalRequirements.forEach((item, i) => {
        field(`FR-${String(i + 1).padStart(2, "0")} | ${item.priority || "Should have"}`, `${item.title}${item.description ? `\n${item.description}` : ""}`);
      });
      hasContent = true;
    }
    fields.forEach(([label, key]) => {
      const value = req[key];
      if (value && (!Array.isArray(value) || value.length)) {
        field(label, key === "launchDate" ? displayDate(value) : value);
        hasContent = true;
      }
    });
    if (index === 6 && project.requirementDocuments?.length) {
      project.requirementDocuments.forEach((item, i) => {
        field(`Attachment ${i + 1}`, item.name);
        if (/^https?:\/\//i.test(item.url || "")) {
          ensure(30);
          pdf.font("Helvetica").fontSize(9).fillColor("#2563EB").text("Open attachment", 48, pdf.y, { link: item.url, underline: true });
          pdf.y += 14;
        }
      });
      hasContent = true;
    }
    if (index === 7 && req.finalAcceptance === "yes") {
      field("Final delivery acceptance", `Accepted by ${req.finalAcceptanceName}\nDate: ${displayDate(req.finalAcceptanceDate)}`);
      hasContent = true;
    }
    if (index === 8) {
      field("Client approval", req.approved === "yes"
        ? `Approved by: ${req.approvalName}\nDate: ${displayDate(req.approvedOn)}` : "Pending client approval");
      field("Manager agreement", project.srsManagerApprovedAt
        ? `Agreed by: ${project.srsManagerName}\nDate: ${displayDate(project.srsManagerApprovedAt)}` : "Pending manager agreement");
      field("Document lock", project.srsLockedAt
        ? `Locked on ${displayDate(project.srsLockedAt)}. Both sides have agreed; the SRS and its attachments are read-only.`
        : "This document will lock once the client and assigned manager have both agreed.");
      hasContent = true;
    }
    if (!hasContent) { text("Not provided."); pdf.y += 14; }
  });
  section(11, "Payment History & Outstanding Balance");
  text(`Payment records as of ${displayDate(new Date())}. Receipts can be updated after the agreed terms are locked.`);
  pdf.y += 14;
  const summary = calculateProjectPaymentSummary(project, payments);
  const money = (amount) => `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  field("Total payable / received / balance due", `${money(summary.totalPayment)} / ${money(summary.paidAmount)} / ${money(summary.dueAmount)}`);
  if (summary.paidAmount > summary.totalPayment) field("Excess received", money(summary.paidAmount - summary.totalPayment));
  if (!payments.length) text("No client payments recorded yet.");
  payments.forEach((payment, i) => {
    field(`Payment ${i + 1} | ${displayDate(payment.paymentDate || payment.createdAt)}`,
      `Amount: ${money(payment.amount)}\nStatus: ${payment.status}\nMethod: ${payment.method || "Not recorded"}\nInstalment / type: ${payment.instalmentLabel || payment.paymentType || "Unallocated"}\nTransaction reference: ${payment.transactionReference || "Not recorded"}\nInvoice: ${payment.invoiceNo || "Not recorded"}${payment.notes ? `\nNotes: ${payment.notes}` : ""}`);
  });
  pdf.y += 10;
  text("Only paid entries reduce the outstanding balance. Pending and failed entries are excluded from the received total.");
  const pages = pdf.bufferedPageRange();
  for (let i = pages.start; i < pages.start + pages.count; i++) {
    pdf.switchToPage(i);
    const y = pdf.page.height - 40;
    pdf.moveTo(48, y - 10).lineTo(48 + width, y - 10).strokeColor("#E1E6ED").stroke();
    pdf.font("Helvetica").fontSize(8).fillColor(muted);
    pdf.text("Yarrowtech | Software Requirements Specification", 48, y, { lineBreak: false });
    pdf.text(`Page ${i + 1} of ${pages.count}`, 440, y, { lineBreak: false });
  }
  pdf.end();
});

export const downloadClientSrs = async (req, res) => {
  try {
    const project = await ERPProject.findOne({
      _id: req.params.projectId, client: req.erpUser?._id || req.erpUser?.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    const payments = await ERPPayment.find({ project: project._id }).sort({ paymentDate: -1, createdAt: -1 }).lean();
    const pdf = await createSrsPdf(project, payments);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="project-srs.pdf"');
    res.setHeader("Cache-Control", "private, no-store");
    return res.send(pdf);
  } catch (err) {
    return res.status(err.name === "CastError" ? 400 : 500).json({ message: "Unable to download SRS" });
  }
};

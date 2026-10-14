import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../services/axiosInstance";
import { SrsPaymentSummary, SrsPaymentHistory } from "./SrsPaymentTerms";
import "../styles/ProjectRequirements.css";

const HEX = /^#[0-9a-fA-F]{6}$/;

/* ================= OPTIONS ================= */
const INDUSTRIES = [
  "Restaurant / Food", "Retail / E-commerce", "Education", "Healthcare", "Real Estate",
  "Travel / Hospitality", "Finance", "Manufacturing", "IT / Services", "Non-profit", "Other",
];
const PROJECT_TYPES = [
  "New project (from scratch)", "Redesign of existing project",
  "Add features to existing project", "Maintenance / support",
];
const PLATFORMS = [
  "Website", "Web App", "E-commerce", "WordPress / CMS", "Android App", "iOS App", "ERP / Software",
];
const DESIGN_STYLES = [
  "Modern", "Minimal", "Corporate", "Playful", "Luxury", "Bold & Colorful", "Traditional",
];
const INTEGRATIONS = [
  "Payment gateway", "WhatsApp", "Email service", "SMS", "Google Maps", "Google Analytics",
  "Social media login", "CRM", "Live chat",
];
const EXTRAS = [
  "Admin panel", "SEO", "Mobile responsive", "Multi-language", "Blog / News", "Newsletter",
  "Reports / Analytics", "Training / Documentation", "Maintenance support",
];
const PAGE_IDEAS = ["Home", "About Us", "Services", "Products", "Gallery", "Blog", "Contact", "FAQ"];
const FR_IDEAS = [
  "User registration & login", "Admin dashboard", "Online payment", "Contact / enquiry form",
  "Search & filter", "Email notifications",
];
const PRIORITIES = ["Must have", "Should have", "Nice to have"];
const COLOR_PRESETS = ["#ff8800", "#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#0f172a"];
const LOGO_STATUS = ["We have a logo", "We need a logo designed", "Logo being prepared"];
const CONTENT_PROVIDER = [
  "We will provide all content", "Please help write the content", "Mix of both",
];
const HOSTING = ["We already have hosting", "We need hosting", "Not sure — please advise"];
const DOMAIN = ["We already have a domain", "We need a domain", "Not sure — please advise"];
const BUDGETS = [
  "Under ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000 – ₹3,00,000",
  "Above ₹3,00,000", "Not decided",
];

/* ================= SRS STRUCTURE ================= */
const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "overall", label: "Overall Description" },
  { id: "functional", label: "Functional Req." },
  { id: "interfaces", label: "Interfaces & Design" },
  { id: "nonfunctional", label: "Non-Functional" },
  { id: "delivery", label: "Delivery & Acceptance" },
  { id: "documents", label: "Documents" },
  { id: "approval", label: "Contact & Approval" },
  { id: "followup", label: "Feedback & Handover" },
];

const MAX_DOCS = 10;
const MAX_DOC_MB = 10;
const DOC_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.zip";

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const STRING_KEYS = [
  "paymentApproved", "paymentApprovedOn",
  "companyProfile", "brandMaterials", "existingSystem", "existingDocumentation",
  "catalogData", "databaseStructure", "apiDocumentation", "agreementNotes",
  "designFeedback", "changeRequests", "uatFeedback", "finalAcceptance",
  "finalAcceptanceName", "finalAcceptanceDate", "finalAcceptanceNotes",
  "businessName", "projectType", "purpose", "overview", "goals", "glossary", "referenceLinks",
  "industry", "targetAudience", "userRoles", "technology", "languages", "constraints",
  "assumptions", "competitors", "businessRules", "outOfScope", "fontPreference", "logoStatus",
  "contentProvider", "externalInterfaces", "nfPerformance", "nfSecurity", "nfUsability",
  "nfReliability", "nfCompatibility", "hostingStatus", "domainStatus", "domainName",
  "launchDate", "budgetRange", "acceptanceCriteria", "additionalNotes", "contactName",
  "contactPhone", "contactEmail", "approved", "approvalName", "approvedOn",
];
const LIST_KEYS = ["pages", "brandColors", "designStyles", "platforms", "integrations", "extras"];

/* Fields that count towards the completion bar, grouped by section */
const SECTION_FIELDS = {
  intro: ["businessName", "projectType", "purpose", "overview", "goals"],
  overall: ["targetAudience", "userRoles", "platforms", "constraints"],
  functional: ["functionalRequirements", "pages"],
  interfaces: ["brandColors", "designStyles", "logoStatus", "contentProvider"],
  nonfunctional: ["nfPerformance", "nfSecurity", "nfUsability", "nfCompatibility"],
  delivery: ["hostingStatus", "domainStatus", "launchDate", "budgetRange", "acceptanceCriteria"],
  approval: ["contactName", "contactPhone", "contactEmail", "approved"],
};

const buildInitial = (saved = {}) => {
  const data = {};
  STRING_KEYS.forEach((k) => (data[k] = saved[k] || ""));
  LIST_KEYS.forEach((k) => (data[k] = Array.isArray(saved[k]) ? saved[k] : []));
  data.functionalRequirements = Array.isArray(saved.functionalRequirements)
    ? saved.functionalRequirements.map((r) => ({
        title: r.title || "",
        description: r.description || "",
        priority: r.priority || "Should have",
      }))
    : [];
  return data;
};

const isFilled = (value) =>
  Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim());

/* ================= SMALL PIECES ================= */
function Field({ label, hint, required, children }) {
  return (
    <div className="req-field">
      <label className="req-label">
        {label}
        {required && <em> *</em>}
      </label>
      {children}
      {hint && <p className="req-field-hint">{hint}</p>}
    </div>
  );
}

function Chips({ options, selected, onToggle }) {
  return (
    <div className="req-chips">
      {options.map((item) => {
        const on = selected.includes(item);
        return (
          <button
            type="button"
            key={item}
            className={on ? "active" : ""}
            aria-pressed={on}
            onClick={() => onToggle(item)}
          >
            {on ? "✓ " : ""}
            {item}
          </button>
        );
      })}
    </div>
  );
}

function ListEditor({ items, onChange, ideas, placeholder }) {
  const [input, setInput] = useState("");

  const add = (text = input) => {
    const value = text.trim();
    if (!value) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      toast.error("Already added");
      return;
    }
    onChange([...items, value]);
    setInput("");
  };

  return (
    <>
      <div className="req-feature-add">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className="req-add-btn" onClick={() => add()}>
          Add
        </button>
      </div>

      {items.length > 0 && (
        <ul className="req-feature-list">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>
              <span className="req-feature-no">{index + 1}</span>
              <span className="req-feature-text">{item}</span>
              <button
                type="button"
                className="req-icon-btn"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="req-suggest">
        <span>Quick add:</span>
        {ideas
          .filter((idea) => !items.some((i) => i.toLowerCase() === idea.toLowerCase()))
          .map((idea) => (
            <button type="button" key={idea} onClick={() => add(idea)}>
              + {idea}
            </button>
          ))}
      </div>
    </>
  );
}

/* Numbered functional requirements: FR-01, FR-02 ... each with priority + details */
function RequirementsEditor({ items, onChange }) {
  const update = (index, patch) =>
    onChange(items.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const add = (title = "") =>
    onChange([...items, { title, description: "", priority: "Should have" }]);

  return (
    <>
      {items.length === 0 && (
        <p className="req-hint">
          No requirements yet. Add each thing the system must do as a separate item.
        </p>
      )}

      <div className="req-fr-list">
        {items.map((item, index) => (
          <div className="req-fr" key={index}>
            <div className="req-fr-top">
              <span className="req-fr-id">FR-{String(index + 1).padStart(2, "0")}</span>
              <input
                type="text"
                value={item.title}
                onChange={(e) => update(index, { title: e.target.value })}
                placeholder="Requirement title, e.g. Customer can book a table"
              />
              <select
                value={item.priority}
                onChange={(e) => update(index, { priority: e.target.value })}
                className={`req-prio req-prio--${PRIORITIES.indexOf(item.priority)}`}
                aria-label="Priority"
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <button
                type="button"
                className="req-icon-btn"
                aria-label="Remove requirement"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
            <textarea
              rows="2"
              value={item.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="Describe how it should work (what the user does and what the system does)."
            />
          </div>
        ))}
      </div>

      <button type="button" className="req-add-btn req-add-btn--block" onClick={() => add()}>
        + Add requirement
      </button>

      <div className="req-suggest">
        <span>Quick add:</span>
        {FR_IDEAS.filter(
          (idea) => !items.some((r) => r.title.toLowerCase() === idea.toLowerCase())
        ).map((idea) => (
          <button type="button" key={idea} onClick={() => add(idea)}>
            + {idea}
          </button>
        ))}
      </div>
    </>
  );
}

/* Documents upload: files upload immediately and are stored separately from the form */
function DocumentsUploader({ projectId, documents, onChange, locked }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const uploadFiles = async (fileList) => {
    if (locked || uploading) return;
    const files = Array.from(fileList || []);
    if (!files.length) return;

    let current = documents;
    setUploading(true);
    for (const file of files) {
      if (current.length >= MAX_DOCS) {
        toast.error(`You can upload up to ${MAX_DOCS} documents`);
        break;
      }
      if (file.size > MAX_DOC_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_DOC_MB} MB`);
        continue;
      }
      try {
        const body = new FormData();
        body.append("file", file);
        // The shared axios instance defaults to JSON, which would turn FormData into JSON.
        const res = await API.post(`/erp/client/project/${projectId}/documents`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        current = res.data.documents || current;
        onChange(current, res.data.srsRevision);
      } catch (err) {
        toast.error(err?.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = async (doc) => {
    if (locked) return;
    if (!window.confirm(`Remove "${doc.name}"?`)) return;
    try {
      setRemovingId(doc._id);
      const res = await API.delete(`/erp/client/project/${projectId}/documents/${doc._id}`);
      onChange(res.data.documents || [], res.data.srsRevision);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove document");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <div
        className={`req-drop ${dragging ? "req-drop--on" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
      >
        <p>
          <strong>Drag and drop files here</strong>, or
        </p>
        <button
          type="button"
          className="req-add-btn"
          disabled={uploading || documents.length >= MAX_DOCS}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : "Choose files"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={DOC_ACCEPT}
          hidden
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <small>
          PDF, Word, Excel, PowerPoint, TXT, CSV, PNG, JPG or ZIP · up to {MAX_DOC_MB} MB each ·
          max {MAX_DOCS} files
        </small>
      </div>

      {documents.length > 0 && (
        <ul className="req-doc-list">
          {documents.map((doc) => (
            <li key={doc._id || doc.url}>
              <span className="req-doc-icon">📄</span>
              <div className="req-doc-info">
                <a href={doc.url} target="_blank" rel="noreferrer">
                  {doc.name}
                </a>
                <small>
                  {formatSize(doc.size)}
                  {doc.uploadedAt ? ` · ${new Date(doc.uploadedAt).toLocaleDateString()}` : ""}
                </small>
              </div>
              <button
                type="button"
                className="req-icon-btn"
                aria-label={`Remove ${doc.name}`}
                disabled={removingId === doc._id}
                onClick={() => remove(doc)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Card({ id, step, title, subtitle, done, total, badge, children }) {
  return (
    <section className="req-card" id={`req-${id}`}>
      <div className="req-card-head">
        <span className="req-step">{step}</span>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span
          className={`req-count ${badge === undefined && done === total ? "req-count--done" : ""}`}
        >
          {badge !== undefined ? badge : `${done}/${total}`}
        </span>
      </div>
      {children}
    </section>
  );
}

/* ================= MAIN FORM ================= */
export default function ProjectRequirementsForm({
  project,
  onClose,
  onSaved,
  onDocumentsChange,
}) {
  const [data, setData] = useState(() => buildInitial(project.requirements));
  const [documents, setDocuments] = useState(project.requirementDocuments || []);
  const [revision, setRevision] = useState(project.srsRevision || 0);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await API.get(`/erp/client/project/${project._id}/requirements/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${String(project.projectId || "project").replace(/[^a-zA-Z0-9_-]/g, "_")}-SRS.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      toast.error("Unable to download the SRS. Please try again.");
    } finally { setDownloading(false); }
  };
  const locked = Boolean(project.srsLockedAt);

  const set = (key, value) => setData((prev) => ({ ...prev, [key]: value,
    ...(key === "approvalName" ? {} : { approved: "", approvedOn: "" }),
  }));
  const bind = (key) => ({
    value: data[key],
    onChange: (e) => set(key, e.target.value),
  });
  const toggle = (key) => (item) =>
    set(
      key,
      data[key].includes(item) ? data[key].filter((i) => i !== item) : [...data[key], item]
    );

  const sectionProgress = useMemo(() => {
    const result = {};
    Object.entries(SECTION_FIELDS).forEach(([id, keys]) => {
      result[id] = {
        done: keys.filter((k) =>
          k === "functionalRequirements"
            ? data.functionalRequirements.some((r) => r.title.trim())
            : isFilled(data[k])
        ).length,
        total: keys.length,
      };
    });
    return result;
  }, [data]);

  const completion = useMemo(() => {
    const all = Object.values(sectionProgress);
    const done = all.reduce((n, s) => n + s.done, 0);
    const total = all.reduce((n, s) => n + s.total, 0);
    return Math.round((done / total) * 100);
  }, [sectionProgress]);

  const addColor = (value) => {
    if (data.brandColors.length >= 12 || data.brandColors.includes(value)) return;
    set("brandColors", [...data.brandColors, value]);
  };
  const updateColor = (index, value) =>
    set("brandColors", data.brandColors.map((c, i) => (i === index ? value : c)));

  const scrollTo = (id) =>
    document.getElementById(`req-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleDocumentsChange = (docs, nextRevision) => {
    setDocuments(docs);
    setRevision(nextRevision);
    setData((prev) => ({ ...prev, approved: "", approvalName: "", approvedOn: "", paymentApproved: "", paymentApprovedOn: "" }));
    onDocumentsChange?.(project._id, docs, nextRevision);
  };

  const handleApproval =(checked) => {
    setData((prev) => ({
      ...prev,
      approved: checked ? "yes" : "",
      approvedOn: checked ? new Date().toISOString().slice(0, 10) : "",
    }));
  };

  const handleSave = async () => {
    if (locked) return;
    if (data.approved === "yes" && (!project.srsPaymentTerms?.updatedAt || data.paymentApproved !== "yes")) {
      toast.error("Review and approve the manager's payment terms before approving the SRS");
      return;
    }
    if (data.finalAcceptance === "yes" &&
        (!data.finalAcceptanceName.trim() || !data.finalAcceptanceDate)) {
      toast.error("Enter your full name and date to confirm final project acceptance");
      return;
    }
    if (data.brandColors.some((c) => !HEX.test(c))) {
      toast.error("Brand colors must be hex values like #ff8800");
      return;
    }
    if (data.contactEmail && !/^\S+@\S+\.\S+$/.test(data.contactEmail)) {
      toast.error("Please enter a valid contact email");
      return;
    }
    if (data.approved === "yes" && !data.approvalName.trim()) {
      toast.error("Type your name to confirm the approval");
      return;
    }
    if (data.approved === "yes" && !data.functionalRequirements.some((r) => r.title.trim())) {
      toast.error("Add at least one functional requirement before approving");
      return;
    }

    try {
      setSaving(true);
      const res = await API.put(`/erp/client/project/${project._id}/requirements`, { ...data, srsRevision: revision,
        paymentTermsUpdatedAt: project.srsPaymentTerms?.updatedAt ? new Date(project.srsPaymentTerms.updatedAt).toISOString() : null,
      });
      toast.success("Project details saved");
      onSaved(project._id, res.data.requirements, res.data.srsRevision);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  const showDomainName = data.domainStatus === DOMAIN[0];

  return (
    <div className="client-details-page">
      {/* STICKY HEADER */}
      <header className="req-topbar">
        <div className="req-topbar-inner">
          <div className="req-title">
            <h2>Software Requirements Specification</h2>
            <p>{project.name}</p>
          </div>

          <div className="req-progress" title="How much of the form is filled in">
            <div className="req-progress-label">
              <span>Completed</span>
              <strong>{completion}%</strong>
            </div>
            <div className="req-progress-track">
              <div className="req-progress-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="req-topbar-actions">
            <button type="button" className="req-cancel" onClick={downloadPdf} disabled={downloading || saving}
              title="Download the last saved document. Save changes before downloading.">
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
            <button className="req-cancel" onClick={onClose}>
              Close
            </button>
            <button className="req-save" onClick={handleSave} disabled={saving || locked}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <nav className="req-nav">
          {SECTIONS.map((s, i) => {
            const p = sectionProgress[s.id];
            const full = p ? p.done === p.total : documents.length > 0;
            return (
              <button type="button" key={s.id} onClick={() => scrollTo(s.id)}>
                <span className={`req-nav-dot ${full ? "done" : ""}`}>{full ? "✓" : i + 1}</span>
                {s.label}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="req-wrap">
        <p className="req-field-hint">Download PDF includes the last saved document. Save any changes before downloading.</p>
        <div className="req-intro">
          This is the <strong>Software Requirements Specification (SRS)</strong> for your project:
          the agreed document of what will be built. Our team sees the same document, so both
          sides work from one reference and nothing gets misunderstood. Fields marked * matter
          most. Skip anything you are unsure about and update it later. When everything is
          correct, confirm it in Contact & Approval. The manager then reviews and agrees;
          both approvals lock this document and its attachments.
        </div>
        <div className="req-intro" role="status">
          {locked ? `Agreed and locked. Client: ${data.approvalName}. Manager: ${project.srsManagerName}. Locked on ${new Date(project.srsLockedAt).toLocaleString()}.`
            : data.approved === "yes" ? "Client approved. Waiting for the manager to agree."
            : "Waiting for client approval, followed by manager agreement."}
        </div>
        <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>

        {/* 1 INTRODUCTION */}
        <Card
          id="intro"
          step="1"
          title="Introduction"
          subtitle="Purpose, scope and objectives of the project."
          {...sectionProgress.intro}
        >
          <div className="req-grid">
            <Field label="Business / Company name" required>
              <input type="text" {...bind("businessName")} placeholder="e.g. Sunrise Restaurant" />
            </Field>
            <Field label="Type of project" required>
              <select {...bind("projectType")}>
                <option value="">Select type</option>
                {PROJECT_TYPES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            <div className="req-wide">
              <Field label="1.1 Purpose" required hint="Why is this software needed? What problem does it solve?">
                <textarea
                  rows="3"
                  {...bind("purpose")}
                  placeholder="e.g. Customers cannot book tables online today. This system lets them book from any device."
                />
              </Field>
            </div>
            <div className="req-wide">
              <Field label="1.2 Scope" required hint="What the software will do, and who it is for. What it will NOT do goes in section 3.">
                <textarea
                  rows="4"
                  {...bind("overview")}
                  placeholder="e.g. A website with menu, table booking and an admin panel for staff."
                />
              </Field>
            </div>
            <div className="req-wide">
              <Field label="1.3 Objectives" required hint="How will you measure success?">
                <textarea
                  rows="3"
                  {...bind("goals")}
                  placeholder="e.g. 100 online bookings per month, a modern brand image"
                />
              </Field>
            </div>
            <Field label="1.4 Definitions & abbreviations" hint="Terms we should both understand the same way.">
              <textarea rows="3" {...bind("glossary")} placeholder="e.g. Member = a customer with a loyalty card" />
            </Field>
            <Field label="1.5 References" hint="Existing documents, designs or websites. One per line.">
              <textarea rows="3" {...bind("referenceLinks")} placeholder="Optional" />
            </Field>
          </div>
        </Card>

        {/* 2 OVERALL */}
        <Card
          id="overall"
          step="2"
          title="Overall Description"
          subtitle="Users, environment, constraints and assumptions."
          {...sectionProgress.overall}
        >
          <div className="req-grid">
            <Field label="2.1 Target audience" required hint="Who will use it?">
              <textarea
                rows="3"
                {...bind("targetAudience")}
                placeholder="e.g. Families and office workers aged 20–45 in Kolkata"
              />
            </Field>
            <Field label="2.2 User types & what each can do" required hint="e.g. Customer: book tables. Admin: manage menu.">
              <textarea rows="3" {...bind("userRoles")} />
            </Field>
            <Field label="Industry">
              <select {...bind("industry")}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="Languages the software must support">
              <input type="text" {...bind("languages")} placeholder="e.g. English, Hindi" />
            </Field>
          </div>

          <label className="req-label req-label--gap">
            2.3 Operating environment (platform) <em>*</em>
          </label>
          <Chips options={PLATFORMS} selected={data.platforms} onToggle={toggle("platforms")} />

          <div className="req-grid req-grid--top">
            <div className="req-wide">
              <Field label="Preferred technologies" hint="Only if you have a preference. Otherwise we will recommend.">
                <input type="text" {...bind("technology")} placeholder="e.g. React, Node.js, WordPress" />
              </Field>
            </div>
            <Field label="2.4 Constraints" required hint="Limits we must work within: laws, budget, devices, tools, deadlines.">
              <textarea rows="3" {...bind("constraints")} />
            </Field>
            <Field label="2.5 Assumptions & dependencies" hint="What we assume is true, or that depends on you or others.">
              <textarea
                rows="3"
                {...bind("assumptions")}
                placeholder="e.g. Client supplies all photos before design starts"
              />
            </Field>
            <div className="req-wide">
              <Field label="Competitors" hint="Businesses similar to yours (names or links).">
                <textarea rows="2" {...bind("competitors")} placeholder="Optional" />
              </Field>
            </div>
          </div>
        </Card>

        {/* 3 FUNCTIONAL */}
        <Card
          id="functional"
          step="3"
          title="Functional Requirements"
          subtitle="Everything the software must do. One item per requirement, with a priority."
          {...sectionProgress.functional}
        >
          <label className="req-label">
            3.1 System functions <em>*</em>
          </label>
          <RequirementsEditor
            items={data.functionalRequirements}
            onChange={(v) => set("functionalRequirements", v)}
          />

          <label className="req-label req-label--gap">3.2 Pages / screens</label>
          <ListEditor
            items={data.pages}
            onChange={(v) => set("pages", v)}
            ideas={PAGE_IDEAS}
            placeholder="Type a page name and press Enter"
          />

          <label className="req-label req-label--gap">3.3 Additional modules</label>
          <Chips options={EXTRAS} selected={data.extras} onToggle={toggle("extras")} />

          <div className="req-grid req-grid--top">
            <Field label="3.4 Business rules" hint="Rules the system must follow, e.g. 'Bookings need 2 hours notice'.">
              <textarea rows="3" {...bind("businessRules")} placeholder="Optional" />
            </Field>
            <Field label="3.5 Out of scope" hint="Things you do NOT want, to avoid confusion later.">
              <textarea rows="3" {...bind("outOfScope")} placeholder="Optional" />
            </Field>
          </div>
        </Card>

        {/* 4 INTERFACES */}
        <Card
          id="interfaces"
          step="4"
          title="External Interfaces & Design"
          subtitle="Look and feel, content, and connections to other systems."
          {...sectionProgress.interfaces}
        >
          <label className="req-label">4.1 User interface: brand colors</label>
          <div className="req-colors">
            {data.brandColors.map((color, index) => (
              <div className="req-color-item" key={index}>
                <input
                  type="color"
                  value={HEX.test(color) ? color : "#ff8800"}
                  onChange={(e) => updateColor(index, e.target.value)}
                  aria-label="Pick color"
                />
                <input
                  type="text"
                  value={color}
                  maxLength={7}
                  onChange={(e) => updateColor(index, e.target.value)}
                  className={HEX.test(color) ? "" : "req-invalid"}
                />
                <button
                  type="button"
                  className="req-icon-btn"
                  aria-label="Remove color"
                  onClick={() =>
                    set("brandColors", data.brandColors.filter((_, i) => i !== index))
                  }
                >
                  ×
                </button>
              </div>
            ))}
            {data.brandColors.length === 0 && (
              <p className="req-hint">No colors yet. Pick a preset or add your own.</p>
            )}
          </div>
          <div className="req-presets">
            <span>Presets:</span>
            {COLOR_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                className="req-swatch"
                style={{ background: preset }}
                title={preset}
                aria-label={`Add ${preset}`}
                onClick={() => addColor(preset)}
              />
            ))}
            <button
              type="button"
              className="req-add-btn req-add-btn--ghost"
              onClick={() => addColor("#000000")}
              disabled={data.brandColors.length >= 12}
            >
              + Custom color
            </button>
          </div>

          <label className="req-label req-label--gap">Design style</label>
          <Chips options={DESIGN_STYLES} selected={data.designStyles} onToggle={toggle("designStyles")} />

          <div className="req-grid req-grid--top">
            <Field label="Logo">
              <select {...bind("logoStatus")}>
                <option value="">Select</option>
                {LOGO_STATUS.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="Font preference" hint="Font names or a style (e.g. clean sans-serif).">
              <input type="text" {...bind("fontPreference")} placeholder="Optional" />
            </Field>
            <Field label="Content (text, images, videos)">
              <select {...bind("contentProvider")}>
                <option value="">Select</option>
                {CONTENT_PROVIDER.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
          </div>

          <label className="req-label req-label--gap">4.2 Software interfaces (integrations)</label>
          <Chips options={INTEGRATIONS} selected={data.integrations} onToggle={toggle("integrations")} />

          <div className="req-grid req-grid--top">
            <div className="req-wide">
              <Field label="4.3 Other interfaces" hint="Hardware (printers, scanners), existing systems, APIs or data to import.">
                <textarea rows="3" {...bind("externalInterfaces")} placeholder="Optional" />
              </Field>
            </div>
          </div>
        </Card>

        {/* 5 NON-FUNCTIONAL */}
        <Card
          id="nonfunctional"
          step="5"
          title="Non-Functional Requirements"
          subtitle="How well the software must work: speed, safety, ease of use."
          {...sectionProgress.nonfunctional}
        >
          <div className="req-grid">
            <Field label="5.1 Performance" hint="How fast and how many users at once.">
              <textarea
                rows="3"
                {...bind("nfPerformance")}
                placeholder="e.g. Pages load in under 3 seconds; supports 500 visitors at a time"
              />
            </Field>
            <Field label="5.2 Security" hint="Logins, data protection, payment safety.">
              <textarea
                rows="3"
                {...bind("nfSecurity")}
                placeholder="e.g. Admin login with password; customer data is kept private"
              />
            </Field>
            <Field label="5.3 Usability" hint="Who must be able to use it, and how easily.">
              <textarea
                rows="3"
                {...bind("nfUsability")}
                placeholder="e.g. Staff with no technical background can update the menu"
              />
            </Field>
            <Field label="5.4 Reliability & availability" hint="How much downtime is acceptable.">
              <textarea
                rows="3"
                {...bind("nfReliability")}
                placeholder="e.g. Available 24/7; daily backups"
              />
            </Field>
            <div className="req-wide">
              <Field label="5.5 Compatibility" hint="Browsers, devices and screen sizes that must work.">
                <textarea
                  rows="2"
                  {...bind("nfCompatibility")}
                  placeholder="e.g. Chrome, Safari, Edge; mobile, tablet and desktop"
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* 6 DELIVERY */}
        <Card
          id="delivery"
          step="6"
          title="Delivery, Timeline & Acceptance"
          subtitle="Hosting, dates, budget and how we agree the work is complete."
          {...sectionProgress.delivery}
        >
          <div className="req-grid">
            <Field label="Hosting">
              <select {...bind("hostingStatus")}>
                <option value="">Select</option>
                {HOSTING.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="Domain name">
              <select {...bind("domainStatus")}>
                <option value="">Select</option>
                {DOMAIN.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            {showDomainName && (
              <Field label="Your domain">
                <input type="text" {...bind("domainName")} placeholder="e.g. sunriserestaurant.com" />
              </Field>
            )}
            <Field label="Preferred launch date">
              <input type="date" {...bind("launchDate")} />
            </Field>
            <Field label="Budget range">
              <select {...bind("budgetRange")}>
                <option value="">Select</option>
                {BUDGETS.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            <div className="req-wide">
              <Field
                label="6.1 Acceptance criteria"
                hint="How will you decide the work is done and correct? List the checks you will do."
              >
                <textarea
                  rows="4"
                  {...bind("acceptanceCriteria")}
                  placeholder={"e.g.\n- A customer can book a table and receives an email\n- Admin can add and remove menu items\n- Works on mobile"}
                />
              </Field>
            </div>
            <div className="req-wide">
              <Field label="Additional notes">
                <textarea rows="3" {...bind("additionalNotes")} placeholder="Optional" />
              </Field>
            </div>
          </div>
        </Card>

        {/* 7 DOCUMENTS */}
        <Card
          id="documents"
          step="7"
          title="Supporting Documents"
          subtitle="Upload anything that helps us understand the project: brief, logo, designs, sample data."
          badge={`${documents.length}/${MAX_DOCS}`}
        >
          <div className="req-grid">
            {[
              ["Company profile & business information", "companyProfile", "Describe your business, products and services. Upload your company profile below."],
              ["Business & brand materials", "brandMaterials", "List available or pending materials: logo, brand guidelines, product images, banners, brochures and website page content. Upload files below or provide shared-folder links."],
              ["Current website / application", "existingSystem", "Website URL or app name, what it does, and what should be retained or changed."],
              ["Existing SRS & technical documentation", "existingDocumentation", "Add document links or upload existing requirements and technical documentation below."],
              ["Product catalog, price list & sample data", "catalogData", "Describe the catalog, price lists or Excel files to use or import. Attach them below."],
              ["Existing database structure", "databaseStructure", "If relevant, describe the schema and migration needs or attach a structure document."],
              ["API documentation", "apiDocumentation", "Link or upload documentation for required integrations."],
              ["Signed agreements", "agreementNotes", "Where required, upload signed agreements below and note their names or any pending signatures."],
            ].map(([label, key, hint]) => (
              <Field key={key} label={label} hint={hint}>
                <textarea rows="3" maxLength={3000} {...bind(key)} placeholder="Optional" aria-label={label} />
              </Field>
            ))}
          </div>
          <p className="req-field-hint">
            Upload business and brand files, existing-system documents, or signed agreements here.
            You can also attach design reviews, UAT results and final acceptance documents later.
          </p>
          <DocumentsUploader
            locked={locked}
            projectId={project._id}
            documents={documents}
            onChange={handleDocumentsChange}
          />
          <p className="req-field-hint">
            Files are uploaded as soon as you choose them. You do not need to press Save for
            documents. Our team can open them from the project page.
          </p>
        </Card>

        {/* 8 APPROVAL */}
        <Card
          id="approval"
          step="8"
          title="Contact & Approval"
          subtitle="Who we talk to, and your confirmation that this document is correct."
          {...sectionProgress.approval}
        >
          <h4>Payment Terms & Breakdown</h4>
          <SrsPaymentSummary project={{ ...project, requirements: data }} />
          {project.srsPaymentTerms?.updatedAt && (
            <label className="req-approval-check">
              <input type="checkbox" checked={data.paymentApproved === "yes"}
                onChange={(e) => set("paymentApproved", e.target.checked ? "yes" : "")} />
              <span>I agree to the total project amount, payment breakdown and due milestones shown above. My approval will be submitted when I sign and save this SRS.</span>
            </label>
          )}
          <div className="req-grid">
            <Field label="Contact name" required>
              <input type="text" {...bind("contactName")} placeholder="Full name" />
            </Field>
            <Field label="Phone / WhatsApp" required>
              <input type="text" {...bind("contactPhone")} placeholder="+91 ..." />
            </Field>
            <Field label="Email" required>
              <input type="email" {...bind("contactEmail")} placeholder="name@company.com" />
            </Field>
          </div>

          <div className={`req-approval ${data.approved === "yes" ? "req-approval--on" : ""}`}>
            <label className="req-approval-check">
              <input
                type="checkbox"
                checked={data.approved === "yes"}
                onChange={(e) => handleApproval(e.target.checked)}
              />
              <span>
                I have read this document and confirm these are the requirements for my
                project, including the payment terms above. The manager can then agree and lock this document.
              </span>
            </label>
            {data.approved === "yes" && (
              <div className="req-grid req-approval-fields">
                <Field label="Type your full name to sign" required>
                  <input type="text" {...bind("approvalName")} placeholder="Full name" />
                </Field>
                <Field label="Date">
                  <input type="text" value={data.approvedOn} readOnly />
                </Field>
              </div>
            )}
          </div>
        </Card>

        <Card
          id="followup"
          step="9"
          title="Project Feedback & Final Acceptance"
          subtitle="Complete during design review, testing and handover. These optional records are separate from your initial SRS approval."
          badge="Later stages"
        >
          <div className="req-grid">
            {[
              ["Design feedback", "designFeedback", "Include the date, design version or screen, feedback and review outcome."],
              ["Change requests", "changeRequests", "List each requested change, date, reason and current status. Record agreed cost or timeline changes once confirmed with the team."],
              ["UAT (User Acceptance Testing) feedback", "uatFeedback", "Record the tested version, date, checks performed, expected and actual results, issues and retest outcomes."],
              ["Final acceptance notes", "finalAcceptanceNotes", "Identify the delivered version, acceptance checks and any agreed outstanding items. Attach supporting records in section 7."],
            ].map(([label, key, hint]) => (
              <Field key={key} label={label} hint={hint}>
                <textarea rows="4" maxLength={3000} {...bind(key)} placeholder="Complete when this stage is reached" aria-label={label} />
              </Field>
            ))}
          </div>
          <div className={`req-approval ${data.finalAcceptance === "yes" ? "req-approval--on" : ""}`}>
            <label className="req-approval-check">
              <input type="checkbox" checked={data.finalAcceptance === "yes"}
                onChange={(e) => setData((prev) => ({ ...prev,
                  finalAcceptance: e.target.checked ? "yes" : "",
                  finalAcceptanceName: "", finalAcceptanceDate: "",
                  approved: "", approvedOn: "",
                }))} />
              <span>I confirm that I have reviewed the completed project against the agreed acceptance criteria and accept the delivery described above.</span>
            </label>
            {data.finalAcceptance === "yes" && (
              <div className="req-grid req-approval-fields">
                <Field label="Full name for final acceptance" required>
                  <input type="text" {...bind("finalAcceptanceName")} aria-label="Full name for final acceptance" />
                </Field>
                <Field label="Final acceptance date" required>
                  <input type="date" {...bind("finalAcceptanceDate")} aria-label="Final acceptance date" />
                </Field>
              </div>
            )}
          </div>
        </Card>

        </fieldset>
        <SrsPaymentHistory project={project} />
        <div className="req-footer">
          <button className="req-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="req-save" onClick={handleSave} disabled={saving || locked}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

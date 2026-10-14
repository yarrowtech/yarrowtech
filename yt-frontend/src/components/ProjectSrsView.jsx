import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, FileText, AlertCircle, ExternalLink, Printer, BookOpen,
  ListChecks, Layers, Paperclip, Clock, ChevronRight,
} from "lucide-react";
import PdModal from "./PdModal";
import SrsPaymentTerms, { SrsPaymentSummary, SrsPaymentHistory } from "./SrsPaymentTerms";
import API from "../services/axiosInstance";
import { toast } from "react-hot-toast";

const GROUPS = [
  { id: "intro", title: "Introduction", items: [
    ["Business name", "businessName"], ["Project type", "projectType"],
    ["Purpose", "purpose"], ["Scope", "overview"], ["Objectives", "goals"],
    ["Definitions", "glossary"], ["References", "referenceLinks"],
  ]},
  { id: "overall", title: "Overall Description", items: [
    ["Target audience", "targetAudience"], ["User types", "userRoles"],
    ["Industry", "industry"], ["Languages", "languages"],
    ["Platform", "platforms"], ["Preferred technologies", "technology"],
    ["Constraints", "constraints"], ["Assumptions & dependencies", "assumptions"],
    ["Competitors", "competitors"],
  ]},
  { id: "functional", title: "Functional Requirements", items: [
    ["System functions", "functionalRequirements"], ["Pages / screens", "pages"],
    ["Additional modules", "extras"], ["Business rules", "businessRules"],
    ["Out of scope", "outOfScope"],
  ]},
  { id: "interfaces", title: "Interfaces & Design", items: [
    ["Brand colors", "brandColors"], ["Design style", "designStyles"],
    ["Logo", "logoStatus"], ["Font preference", "fontPreference"],
    ["Content", "contentProvider"], ["Integrations", "integrations"],
    ["Other interfaces", "externalInterfaces"],
  ]},
  { id: "nonfunctional", title: "Non-Functional Requirements", items: [
    ["Performance", "nfPerformance"], ["Security", "nfSecurity"],
    ["Usability", "nfUsability"], ["Reliability", "nfReliability"],
    ["Compatibility", "nfCompatibility"],
  ]},
  { id: "delivery", title: "Delivery & Acceptance", items: [
    ["Hosting", "hostingStatus"], ["Domain", "domainStatus"], ["Domain name", "domainName"],
    ["Launch date", "launchDate"], ["Budget", "budgetRange"],
    ["Acceptance criteria", "acceptanceCriteria"], ["Notes", "additionalNotes"],
  ]},
  { id: "materials", title: "Business & Existing System Documents", items: [
    ["Company profile", "companyProfile"], ["Business & brand materials", "brandMaterials"],
    ["Current website / application", "existingSystem"], ["Existing SRS & technical documentation", "existingDocumentation"],
    ["Product catalog & sample data", "catalogData"], ["Database structure", "databaseStructure"],
    ["API documentation", "apiDocumentation"], ["Signed agreements", "agreementNotes"],
  ]},
  { id: "contact", title: "Client Contact", items: [
    ["Name", "contactName"], ["Phone", "contactPhone"], ["Email", "contactEmail"],
  ]},
  { id: "followup", title: "Project Feedback & Final Acceptance", items: [
    ["Design feedback", "designFeedback"], ["Change requests", "changeRequests"],
    ["UAT feedback", "uatFeedback"], ["Final acceptance notes", "finalAcceptanceNotes"],
    ["Delivery accepted", "finalAcceptance"], ["Accepted by", "finalAcceptanceName"],
    ["Acceptance date", "finalAcceptanceDate"],
  ]},
];

const filled = (v) => (Array.isArray(v) ? v.length > 0 : Boolean(v));
const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
const formatSize = (b) => {
  if (!b) return "";
  return b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
};
const extOf = (name = "") => (name.includes(".") ? name.split(".").pop().slice(0, 4).toUpperCase() : "FILE");

export const srsStatus = (project) => {
  const req = project?.requirements || {};
  const docs = project?.requirementDocuments || [];
  const hasAny =
    docs.length > 0 || GROUPS.some((g) => g.items.some(([, k]) => filled(req[k])));
  return { req, docs, hasAny, approved: req.approved === "yes" };
};

/* Long free-text values get a full-width row; short ones sit two per row */
const isWide = (key, value) =>
  Array.isArray(value) || key === "functionalRequirements" || String(value).length > 60 || String(value).includes("\n");

/* One-line text used in the small preview on a section card */
const previewText = (key, value) => {
  if (key === "functionalRequirements") return `${value.length} requirement${value.length > 1 ? "s" : ""}`;
  if (Array.isArray(value)) return value.join(", ");
  if (key === "launchDate") return formatDate(value);
  return String(value).replace(/\s+/g, " ");
};

function Value({ field, value }) {
  if (field === "brandColors") {
    return (
      <div className="srs-swatches">
        {value.map((c, i) => (
          <span key={i}>
            <i style={{ background: c }} />
            {c}
          </span>
        ))}
      </div>
    );
  }
  if (field === "functionalRequirements") {
    return (
      <div className="srs-frs">
        {value.map((r, i) => (
          <div key={i} className="srs-fr">
            <span className="srs-fr-id">FR-{String(i + 1).padStart(2, "0")}</span>
            <div className="srs-fr-body">
              <div className="srs-fr-title">
                <strong>{r.title}</strong>
                <span className={`srs-prio srs-prio--${(r.priority || "").split(" ")[0].toLowerCase()}`}>
                  {r.priority}
                </span>
              </div>
              {r.description && <p>{r.description}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="srs-tags">
        {value.map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </div>
    );
  }
  return (
    <span className="srs-text">
      {field === "launchDate" || field === "approvedOn" ? formatDate(value) : value}
    </span>
  );
}

function Fields({ section, req }) {
  return (
    <dl className="srs-fields">
      {section.rows.map(([label, key]) => (
        <div key={key} className={isWide(key, req[key]) ? "srs-field srs-field--wide" : "srs-field"}>
          <dt>{label}</dt>
          <dd><Value field={key} value={req[key]} /></dd>
        </div>
      ))}
    </dl>
  );
}

function DocList({ docs }) {
  return (
    <ul className="srs-docs">
      {docs.map((d) => (
        <li key={d._id || d.url}>
          <span className="srs-ext">{extOf(d.name)}</span>
          <div>
            <strong title={d.name}>{d.name}</strong>
            <span>
              {[formatSize(d.size), `Uploaded ${formatDate(d.uploadedAt)}`].filter(Boolean).join(" · ")}
            </span>
          </div>
          <a className="pd-btn" href={d.url} target="_blank" rel="noreferrer">
            Open <ExternalLink size={13} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/* Full document: every section in order. Used in the "Read full document" popup and for printing. */
function FullDocument({ project, sections, docs, req, payments }) {
  return (
    <div className="srs-fulldoc">
      <h2>Software Requirements Specification</h2>
      <p className="srs-fulldoc-sub">
        {project.name} ({project.projectId}) · {req.updatedAt ? `Updated ${formatDate(req.updatedAt)}` : ""}
        {req.approved === "yes" &&
          ` · Approved by ${req.approvalName || "client"} on ${formatDate(req.approvedOn)}`}
      </p>
      <p>
        {project.srsLockedAt
          ? `Manager agreed: ${project.srsManagerName} on ${formatDate(project.srsManagerApprovedAt)}. Both sides agreed; document and attachments locked.`
          : "Manager agreement pending. Document is not yet locked."}
      </p>
      {sections.map((s) => (
        <div className="srs-fulldoc-section" key={s.id}>
          <h3><span className="srs-num">{s.number}</span> {s.title}</h3>
          <Fields section={s} req={req} />
        </div>
      ))}
      {docs.length > 0 && (
        <div className="srs-fulldoc-section">
          <h3><span className="srs-num"><Paperclip size={13} /></span> Supporting Documents</h3>
          <DocList docs={docs} />
        </div>
      )}
      <div className="srs-fulldoc-section"><h3>Payment Terms & Breakdown</h3><SrsPaymentSummary project={project} /></div>
      {payments && <SrsPaymentHistory project={project} payments={payments} />}
    </div>
  );
}

export default function ProjectSrsView({ project, canApprove = false, onApproved, payments, onRecordPayment, onEditPayment }) {
  const { req, docs, hasAny, approved } = srsStatus(project);
  const [openSection, setOpenSection] = useState(null); // section id | "docs"
  const [showFull, setShowFull] = useState(false);
  const [agree, setAgree] = useState(false);
  const [approving, setApproving] = useState(false);
  const locked = Boolean(project.srsLockedAt);
  useEffect(() => { setAgree(false); }, [project.srsRevision]);
  const approve = async () => {
    if (!agree || approving) return;
    setApproving(true);
    try {
      const res = await API.post(`/erp/${localStorage.getItem("erp_role") === "admin" ? "admin" : "manager"}/projects/${project._id}/srs-approval`, {
        agree: true, revision: project.srsRevision || 0,
      });
      onApproved?.(res.data.project);
      toast.success("Both sides have agreed. The SRS is now locked.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve SRS");
      setAgree(false);
    } finally { setApproving(false); }
  };

  const sections = useMemo(
    () =>
      GROUPS.map((g, index) => ({
        ...g,
        number: index + 1,
        rows: g.items.filter(([, k]) => filled(req[k])),
        total: g.items.length,
      })).filter((g) => g.rows.length > 0),
    [req]
  );

  useEffect(() => {
    const done = () => document.body.classList.remove("srs-printing");
    window.addEventListener("afterprint", done);
    return () => {
      window.removeEventListener("afterprint", done);
      done();
    };
  }, []);

  const handlePrint = () => {
    document.body.classList.add("srs-printing");
    setTimeout(() => window.print(), 100);
  };

  if (!hasAny && !canApprove) {
    return (
      <div className="pd-card pd-empty-state">
        <FileText size={34} />
        <h3>No requirements submitted yet</h3>
        <p>
          The client has not filled in the Software Requirements Specification. Ask them to
          open <b>My Projects → Project Details</b>.
        </p>
      </div>
    );
  }

  const frCount = (req.functionalRequirements || []).length;
  const pageCount = (req.pages || []).length;
  const active = sections.find((s) => s.id === openSection);

  return (
    <div className="srs">
      {/* ── Summary ── */}
      <div className="srs-summary">
        <div className={`srs-approval ${approved ? "srs-approval--ok" : "srs-approval--wait"}`}>
          <span className="srs-approval-icon">
            {approved ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
          </span>
          <div>
            <strong>
              {approved ? `Approved by ${req.approvalName || "client"}` : "Waiting for client approval"}
            </strong>
            <span>
              {approved
                ? `Signed on ${formatDate(req.approvedOn)}`
                : "The client has not confirmed this document yet"}
            </span>
          </div>
        </div>

        <div className="srs-stats">
          <div><ListChecks size={15} /><strong>{frCount}</strong><span>Functional req.</span></div>
          <div><Layers size={15} /><strong>{pageCount}</strong><span>Pages</span></div>
          <div><Paperclip size={15} /><strong>{docs.length}</strong><span>Documents</span></div>
          <div><Clock size={15} /><strong>{formatDate(req.updatedAt)}</strong><span>Last updated</span></div>
        </div>

        <div className="srs-tools">
          <button type="button" className="pd-btn pd-btn--primary" onClick={() => setShowFull(true)}>
            <BookOpen size={15} /> Read full document
          </button>
          <button type="button" className="pd-btn" onClick={handlePrint}>
            <Printer size={15} /> Print / PDF
          </button>
        </div>
      </div>

      {/* ── Section cards ── */}
      <div className="srs-cards">
        {sections.map((s) => {
          const pct = Math.round((s.rows.length / s.total) * 100);
          return (
            <button type="button" className="srs-card" key={s.id} onClick={() => setOpenSection(s.id)}>
              <div className="srs-card-head">
                <span className="srs-num">{s.number}</span>
                <strong>{s.title}</strong>
                <ChevronRight size={16} />
              </div>
              <ul className="srs-card-preview">
                {s.rows.slice(0, 3).map(([label, key]) => (
                  <li key={key}>
                    <span>{label}</span>
                    <em>{previewText(key, req[key])}</em>
                  </li>
                ))}
              </ul>
              <div className="srs-card-foot">
                <div className="srs-bar"><div style={{ width: `${pct}%` }} /></div>
                <span>{s.rows.length}/{s.total} filled</span>
              </div>
            </button>
          );
        })}

        {docs.length > 0 && (
          <button type="button" className="srs-card" onClick={() => setOpenSection("docs")}>
            <div className="srs-card-head">
              <span className="srs-num"><Paperclip size={13} /></span>
              <strong>Supporting Documents</strong>
              <ChevronRight size={16} />
            </div>
            <ul className="srs-card-preview">
              {docs.slice(0, 3).map((d) => (
                <li key={d._id || d.url}>
                  <span>{extOf(d.name)}</span>
                  <em>{d.name}</em>
                </li>
              ))}
            </ul>
            <div className="srs-card-foot">
              <span>{docs.length} file{docs.length > 1 ? "s" : ""}</span>
            </div>
          </button>
        )}
      </div>

      {/* ── Popups ── */}
      {canApprove ? <SrsPaymentTerms project={project} onSaved={onApproved} payments={payments} onRecordPayment={onRecordPayment} onEditPayment={onEditPayment} />
        : <section className="pd-card"><h3>Payment Terms & Breakdown</h3><SrsPaymentSummary project={project} /></section>}
      <div className="pd-card" role="status">
        <strong>{locked ? "Both sides agreed — SRS locked" : "Manager agreement pending"}</strong>
        <p>{locked
          ? `Agreed by ${project.srsManagerName} on ${formatDate(project.srsManagerApprovedAt)}. This document and its attachments are read-only.`
          : "The client approves first. Manager agreement locks the document and its attachments."}</p>
        {canApprove && approved && req.paymentApproved === "yes" && !locked && (
          <>
            <label>
              <input type="checkbox" checked={agree} disabled={approving} onChange={(e) => setAgree(e.target.checked)} />
              I have reviewed the client's SRS, payment approval and attachments. I agree and understand this will lock the document and payment terms.
            </label>
            <button type="button" className="pd-btn pd-btn--primary" disabled={!agree || approving} onClick={approve}>
              {approving ? "Agreeing..." : "Agree & lock SRS"}
            </button>
          </>
        )}
      </div>

      {active && (
        <PdModal
          size="lg"
          title={`${active.number}. ${active.title}`}
          subtitle={`${active.rows.length} of ${active.total} fields filled by the client`}
          onClose={() => setOpenSection(null)}
        >
          <Fields section={active} req={req} />
        </PdModal>
      )}

      {openSection === "docs" && (
        <PdModal
          size="lg"
          title="Supporting Documents"
          subtitle="Files uploaded by the client"
          onClose={() => setOpenSection(null)}
        >
          <DocList docs={docs} />
        </PdModal>
      )}

      {showFull && (
        <PdModal
          size="xl"
          title="Software Requirements Specification"
          subtitle={project.name}
          onClose={() => setShowFull(false)}
          footer={
            <>
              <button type="button" className="pd-btn" onClick={() => setShowFull(false)}>Close</button>
              <button type="button" className="pd-btn pd-btn--primary" onClick={handlePrint}>
                <Printer size={15} /> Print / PDF
              </button>
            </>
          }
        >
          <FullDocument project={project} sections={sections} docs={docs} req={req} payments={payments} />
        </PdModal>
      )}

      {/* Hidden on screen; this is what gets printed */}
      <div className="srs-print-root" aria-hidden="true">
        <FullDocument project={project} sections={sections} docs={docs} req={req} payments={payments} />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft, FolderKanban, Mail, Phone, Building2, Calendar, UserCheck, Hash,
  CreditCard, CheckCircle2, Clock, AlertCircle, Plus, Pencil, MessageSquare,
  LayoutGrid, FileText, Wallet, User, StickyNote,
} from "lucide-react";

import ProjectChatModal from "../../components/ProjectChatModal";
import ProjectSrsView, { srsStatus } from "../../components/ProjectSrsView";
import PdModal from "../../components/PdModal";
import API from "../../services/axiosInstance";
import {
  addProjectPayment,
  getProjectPayments,
  updateManagerProject,
  updateProjectPayment,
  updateProjectPaymentSummary,
} from "../../services/managerService";
import { updateProject as updateAdminProject } from "../../services/adminService";
import "../../styles/ManagerProjectDetailsV2.css";

const PAYMENT_METHODS  = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Net Banking"];
const PAYMENT_TYPES    = ["Advance", "Milestone", "Final", "Maintenance", "Project Payment"];
const PAYMENT_STATUSES = ["paid", "pending", "failed"];
const PROJECT_STATUSES = ["pending", "ongoing", "completed"];

const EMPTY_SUMMARY = {
  totalPayment: 0, paidAmount: 0, pendingAmount: 0, failedAmount: 0, dueAmount: 0, paymentCount: 0,
};

const createPaymentForm = () => ({
  transactionReference: "",
  instalmentId: "",
  amount:      "",
  method:      "Bank Transfer",
  paymentType: "Project Payment",
  status:      "paid",
  paymentDate: new Date().toISOString().slice(0, 10),
  notes:       "",
});

const mapPaymentForEdit = (p) => ({
  transactionReference: p.transactionReference || "",
  instalmentId: p.instalmentId || "",
  amount:      p.amount ?? "",
  method:      p.method || "Bank Transfer",
  paymentType: p.paymentType || "Project Payment",
  status:      p.status || "paid",
  paymentDate: p.paymentDate ? p.paymentDate.slice(0, 10) : "",
  notes:       p.notes || "",
});

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v) || 0);

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

const TABS = [
  { id: "overview",     label: "Overview",     icon: LayoutGrid },
  { id: "requirements", label: "Requirements", icon: FileText },
  { id: "payments",     label: "Payments",     icon: Wallet },
];

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = localStorage.getItem("erp_role") === "admin";
  const projectsPath = isAdmin ? "/admin/projects" : "/manager/projects";
  const tab = TABS.some((t) => t.id === searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  const selectTab = (id) => setSearchParams({ tab: id }, { replace: true });

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  /* popups */
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const [paymentModal, setPaymentModal] = useState(null); // { mode: "add" } | { mode: "edit", id }
  const [paymentForm, setPaymentForm] = useState(createPaymentForm());
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [showTotal, setShowTotal] = useState(false);
  const [totalPayment, setTotalPayment] = useState("");
  const [summarySaving, setSummarySaving] = useState(false);

  const [paymentData, setPaymentData] = useState({ project: null, summary: EMPTY_SUMMARY, payments: [] });

  const applyPaymentResponse = (res) => {
    setPaymentData((prev) => ({
      project:  res?.project || prev.project,
      summary:  res?.summary || prev.summary,
      payments: Array.isArray(res?.payments) ? res.payments : prev.payments,
    }));
  };

  const loadProject = async () => {
    const res = await API.get(`/erp/projects/${projectId}`);
    setProject(res.data?.project || null);
  };

  const loadPayments = async () => {
    const res = await getProjectPayments(projectId);
    setPaymentData({
      project:  res?.project || null,
      summary:  res?.summary || EMPTY_SUMMARY,
      payments: Array.isArray(res?.payments) ? res.payments : [],
    });
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProject(), loadPayments()]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load project");
      setProject(null);
      if (err?.response?.status === 404) navigate(projectsPath, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(); }, [projectId]);

  /* ── Edit project popup ── */
  const openEdit = () => {
    setEdit({
      status:           project.status || "pending",
      progress:         project.progress || 0,
      expectedDelivery: project.expectedDelivery ? project.expectedDelivery.slice(0, 10) : "",
      projectDetails:   project.projectDetails || "",
    });
    setShowEdit(true);
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      await (isAdmin ? updateAdminProject : updateManagerProject)(projectId, {
        status:           edit.status,
        progress:         Number(edit.progress),
        expectedDelivery: edit.expectedDelivery,
        projectDetails:   edit.projectDetails,
      });
      toast.success("Project updated");
      setShowEdit(false);
      await loadProject();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Contract total popup ── */
  const openTotal = () => {
    setTotalPayment(String(paymentData.summary?.totalPayment ?? ""));
    setShowTotal(true);
  };

  const savePaymentSummary = async () => {
    try {
      setSummarySaving(true);
      const res = await updateProjectPaymentSummary(projectId, { totalPayment: Number(totalPayment) || 0 });
      applyPaymentResponse(res);
      setShowTotal(false);
      toast.success("Contract amount updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update contract amount");
    } finally {
      setSummarySaving(false);
    }
  };

  /* ── Payment add / edit popup ── */
  /* Money already received per instalment (matched by id, then by name) */
  const instalmentBalance = (row, index) => {
    const id = row.id || `legacy-${index}`;
    const name = String(row.label || "").trim().toLowerCase();
    const breakdown = project?.srsPaymentTerms?.breakdown || [];
    const paid = (paymentData.payments || [])
      .filter((p) => p.status === "paid" && p._id !== paymentModal?.id)
      .filter((p) => {
        if (p.instalmentId && breakdown.some((r, i) => (r.id || `legacy-${i}`) === p.instalmentId)) return p.instalmentId === id;
        return name && String(p.instalmentLabel || "").trim().toLowerCase() === name;
      })
      .reduce((sum, p) => sum + Math.round(Number(p.amount) * 100), 0) / 100;
    return Math.max(0, Math.round((Number(row.amount) - paid) * 100) / 100);
  };

  const chooseInstalment = (value) => {
    const breakdown = project?.srsPaymentTerms?.breakdown || [];
    const index = breakdown.findIndex((row, i) => (row.id || `legacy-${i}`) === value);
    const next = { ...paymentForm, instalmentId: value };
    if (index !== -1 && paymentModal?.mode !== "edit") {
      const balance = instalmentBalance(breakdown[index], index);
      if (balance > 0) next.amount = String(balance);
    }
    setPaymentForm(next);
  };

  const openAddPayment = () => {
    setPaymentForm(createPaymentForm());
    setPaymentModal({ mode: "add" });
  };

  const openEditPayment = (payment) => {
    setPaymentForm(mapPaymentForEdit(payment));
    setPaymentModal({ mode: "edit", id: payment._id });
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    const body = {
      transactionReference: paymentForm.transactionReference,
      instalmentId: paymentForm.instalmentId,
      amount:      Number(paymentForm.amount) || 0,
      method:      paymentForm.method,
      paymentType: paymentForm.paymentType,
      paymentDate: paymentForm.paymentDate,
      status:      paymentForm.status,
      notes:       paymentForm.notes,
    };
    try {
      setPaymentSaving(true);
      const res =
        paymentModal.mode === "edit"
          ? await updateProjectPayment(paymentModal.id, body)
          : await addProjectPayment({ projectId, ...body });
      applyPaymentResponse(res);
      toast.success(paymentModal.mode === "edit" ? "Payment updated" : "Payment entry added");
      setPaymentModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save payment");
    } finally {
      setPaymentSaving(false);
    }
  };

  /* ── Loading / not found ── */
  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner" />
        <span>Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pd-page">
        <button className="pd-btn" onClick={() => navigate(projectsPath)}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <p className="pd-muted">Project not found or you do not have access.</p>
      </div>
    );
  }

  const summary = paymentData.summary || EMPTY_SUMMARY;
  const payments = paymentData.payments || [];
  const srs = srsStatus(project);
  const status = project.status || "pending";
  const progress = project.progress || 0;
  const clientName = project.clientName || project.client?.name || "Unknown";
  const paidPct = summary.totalPayment > 0
    ? Math.min(100, Math.round((summary.paidAmount / summary.totalPayment) * 100))
    : 0;

  const facts = [
    { icon: User,      label: "Client",            value: clientName },
    { icon: UserCheck, label: "Tech Lead",         value: project.techLeadEmail || "—" },
    { icon: Calendar,  label: "Created",           value: formatDate(project.createdAt) },
    { icon: Calendar,  label: "Expected Delivery", value: project.expectedDelivery ? formatDate(project.expectedDelivery) : "—" },
    { icon: CreditCard,label: "Contract",          value: formatCurrency(summary.totalPayment) },
    { icon: Wallet,    label: "Paid",              value: `${formatCurrency(summary.paidAmount)} (${paidPct}%)` },
  ];

  return (
    <div className="pd-page">
      {/* ── Header ── */}
      <div className="pd-header">
        <button className="pd-icon-btn pd-back" onClick={() => navigate(projectsPath)} aria-label="Back to projects">
          <ArrowLeft size={18} />
        </button>
        <div className="pd-header-icon"><FolderKanban size={22} /></div>
        <div className="pd-title">
          <div className="pd-title-row">
            <h1>{project.name}</h1>
            <span className="pd-id">{project.projectId}</span>
            <span className={`pd-status pd-status--${status}`}>{status}</span>
          </div>
          <p>Client: {clientName} · Manager: {project.managerEmail || "—"}</p>
        </div>
        <div className="pd-header-actions">
          <button className="pd-btn" onClick={openEdit}>
            <Pencil size={15} /> Edit Project
          </button>
          {!isAdmin && (
            <button className="pd-btn pd-btn--primary" onClick={() => setShowChat(true)}>
              <MessageSquare size={15} /> Client Chat
            </button>
          )}
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="pd-progress" title={`${progress}% complete`}>
        <div className="pd-progress-track">
          <div className="pd-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span>{progress}% complete</span>
      </div>

      {/* ── Key facts ── */}
      <div className="pd-facts">
        {facts.map(({ icon: Icon, label, value }) => (
          <div className="pd-fact" key={label}>
            <Icon size={15} />
            <div>
              <span>{label}</span>
              <strong title={value}>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="pd-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`pd-tab ${tab === id ? "active" : ""}`}
            onClick={() => selectTab(id)}
          >
            <Icon size={16} /> {label}
            {id === "requirements" && (
              <span className={`pd-dot ${srs.approved ? "pd-dot--ok" : srs.hasAny ? "pd-dot--wait" : ""}`} />
            )}
            {id === "payments" && <em>{payments.length}</em>}
          </button>
        ))}
      </div>

      {/* ================= OVERVIEW ================= */}
      {tab === "overview" && (
        <div className="pd-grid">
          <div className="pd-card">
            <h4 className="pd-card-title"><User size={16} /> Client</h4>
            <dl className="pd-kv">
              <div><dt>Name</dt><dd>{clientName}</dd></div>
              <div>
                <dt>Email</dt>
                <dd>
                  {(project.clientEmail || project.client?.email) ? (
                    <a href={`mailto:${project.clientEmail || project.client?.email}`}>
                      <Mail size={13} /> {project.clientEmail || project.client?.email}
                    </a>
                  ) : "—"}
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  {project.client?.phone ? (
                    <a href={`tel:${project.client.phone}`}><Phone size={13} /> {project.client.phone}</a>
                  ) : "—"}
                </dd>
              </div>
              <div><dt>Company</dt><dd><Building2 size={13} /> {project.client?.company || "—"}</dd></div>
              <div><dt>Client status</dt><dd>{cap(project.client?.status || "active")}</dd></div>
              <div><dt>Client ID</dt><dd className="pd-mono"><Hash size={13} /> {project.client?._id || "—"}</dd></div>
            </dl>
          </div>

          <div className="pd-card">
            <div className="pd-card-head">
              <h4 className="pd-card-title"><StickyNote size={16} /> Project Notes</h4>
              <button className="pd-link-btn" onClick={openEdit}>Edit</button>
            </div>
            {project.projectDetails ? (
              <p className="pd-notes">{project.projectDetails}</p>
            ) : (
              <p className="pd-muted">No notes yet. Use Edit to add delivery notes, scope details or blockers.</p>
            )}
          </div>

          <div className="pd-card">
            <div className="pd-card-head">
              <h4 className="pd-card-title"><Wallet size={16} /> Payment at a glance</h4>
              <button className="pd-link-btn" onClick={() => selectTab("payments")}>Open</button>
            </div>
            <div className="pd-meter">
              <div className="pd-meter-fill" style={{ width: `${paidPct}%` }} />
            </div>
            <div className="pd-meter-legend">
              <span>Paid <b>{formatCurrency(summary.paidAmount)}</b></span>
              <span>Due <b>{formatCurrency(summary.dueAmount)}</b></span>
              <span>{paidPct}% of {formatCurrency(summary.totalPayment)}</span>
            </div>
          </div>

          <div className="pd-card">
            <div className="pd-card-head">
              <h4 className="pd-card-title"><FileText size={16} /> Requirements (SRS)</h4>
              <button className="pd-link-btn" onClick={() => selectTab("requirements")}>Open</button>
            </div>
            {srs.hasAny ? (
              <p className={srs.approved ? "pd-ok" : "pd-warn"}>
                {srs.approved
                  ? `Approved by ${srs.req.approvalName || "client"} on ${formatDate(srs.req.approvedOn)}`
                  : "Submitted, waiting for client approval"}
                {srs.docs.length > 0 && ` · ${srs.docs.length} document${srs.docs.length > 1 ? "s" : ""}`}
              </p>
            ) : (
              <p className="pd-muted">The client has not submitted requirements yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ================= REQUIREMENTS ================= */}
      {tab === "requirements" && <ProjectSrsView project={project} canApprove payments={payments} onRecordPayment={openAddPayment} onEditPayment={openEditPayment} onApproved={(updated) => {
        setProject(updated);
        loadPayments().catch(() => toast.error("Refresh the payments tab to see the updated total"));
      }} />}

      {/* ================= PAYMENTS ================= */}
      {tab === "payments" && (
        <>
          <div className="pd-pay-tiles">
            {[
              { label: "Total Contract", value: summary.totalPayment, icon: CreditCard, tone: "blue" },
              { label: "Paid by Client", value: summary.paidAmount, icon: CheckCircle2, tone: "green" },
              { label: "Pending", value: summary.pendingAmount, icon: Clock, tone: "yellow" },
              { label: "Yet to be Paid", value: summary.dueAmount, icon: AlertCircle, tone: "red" },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div className={`pd-tile pd-tile--${tone}`} key={label}>
                <span className="pd-tile-icon"><Icon size={17} /></span>
                <div>
                  <span>{label}</span>
                  <strong>{formatCurrency(value)}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="pd-card pd-card--flush">
            <div className="pd-card-head pd-card-head--pad">
              <h4 className="pd-card-title"><CreditCard size={16} /> Payment History ({payments.length})</h4>
              <div className="pd-row-gap">
                <button className="pd-btn" onClick={openTotal}>
                  <Pencil size={14} /> Set Contract Amount
                </button>
                <button className="pd-btn pd-btn--primary" onClick={openAddPayment}>
                  <Plus size={14} /> Add Payment
                </button>
              </div>
            </div>

            <div className="pd-table-wrap">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Type</th><th>Method</th><th>Amount</th>
                    <th>Status</th><th>Invoice</th><th>Notes</th><th />
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="pd-table-empty">
                        No payments yet. Click <b>Add Payment</b> to record the first one.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id}>
                        <td>{formatDate(p.paymentDate)}</td>
                        <td>{p.paymentType}</td>
                        <td>{p.method}</td>
                        <td><b>{formatCurrency(p.amount)}</b></td>
                        <td><span className={`pd-pay pd-pay--${p.status}`}>{p.status}</span></td>
                        <td>{p.invoiceNo || "—"}</td>
                        <td className="pd-cell-notes" title={p.notes || ""}>{p.notes || "—"}</td>
                        <td>
                          <button className="pd-icon-btn" aria-label="Edit payment" onClick={() => openEditPayment(p)}>
                            <Pencil size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= POPUPS ================= */}
      {showEdit && edit && (
        <PdModal
          title="Edit Project"
          subtitle="Update status, progress, delivery date and notes."
          onClose={() => setShowEdit(false)}
          footer={
            <>
              <button className="pd-btn" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="pd-btn pd-btn--primary" onClick={saveChanges} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          }
        >
          <div className="pd-form">
            <label className="pd-field pd-field--wide">
              <span>Progress: {edit.progress}%</span>
              <input
                type="range" min="0" max="100" value={edit.progress}
                onChange={(e) => setEdit({ ...edit, progress: e.target.value })}
              />
            </label>
            <label className="pd-field">
              <span>Status</span>
              <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </label>
            <label className="pd-field">
              <span>Expected delivery</span>
              <input
                type="date" value={edit.expectedDelivery}
                onChange={(e) => setEdit({ ...edit, expectedDelivery: e.target.value })}
              />
            </label>
            <label className="pd-field pd-field--wide">
              <span>Project notes</span>
              <textarea
                rows="5" value={edit.projectDetails}
                onChange={(e) => setEdit({ ...edit, projectDetails: e.target.value })}
                placeholder="Delivery notes, scope details, blockers, or updates..."
              />
            </label>
          </div>
        </PdModal>
      )}

      {paymentModal && (
        <PdModal
          title={paymentModal.mode === "edit" ? "Edit Payment" : "Add Payment"}
          subtitle={paymentModal.mode === "edit" ? "Change the details of this payment entry." : "Record a payment received for this project."}
          onClose={() => setPaymentModal(null)}
        >
          <form className="pd-form" onSubmit={submitPayment}>
            <label className="pd-field pd-field--wide"><span>Payment instalment{(project.srsPaymentTerms?.breakdown || []).length > 0 ? " *" : ""}</span>
              <select
                value={paymentForm.instalmentId}
                required={(project.srsPaymentTerms?.breakdown || []).length > 0}
                onChange={(e) => chooseInstalment(e.target.value)}
              >
                <option value="">{(project.srsPaymentTerms?.breakdown || []).length > 0 ? "Select an instalment" : "General payment (no payment terms set)"}</option>
                {paymentForm.instalmentId && !project.srsPaymentTerms?.breakdown?.some((row, i) => (row.id || `legacy-${i}`) === paymentForm.instalmentId) && <option value={paymentForm.instalmentId}>Previous instalment</option>}
                {(project.srsPaymentTerms?.breakdown || []).map((row, i) => {
                  const due = instalmentBalance(row, i);
                  return <option key={row.id || i} value={row.id || `legacy-${i}`}>{row.label} — {due === 0 ? "fully paid" : `${formatCurrency(due)} due`}</option>;
                })}
              </select>
              {(() => {
                const list = project.srsPaymentTerms?.breakdown || [];
                const i = list.findIndex((row, n) => (row.id || `legacy-${n}`) === paymentForm.instalmentId);
                if (i === -1) return null;
                const due = instalmentBalance(list[i], i);
                const over = Number(paymentForm.amount) > due && due >= 0 && paymentForm.status === "paid";
                return <small className={over ? "pd-hint pd-hint--warn" : "pd-hint"}>
                  {list[i].label}: {formatCurrency(list[i].amount)} agreed, {formatCurrency(due)} still due.
                  {over ? " This amount is more than what is due." : ""}
                </small>;
              })()}
            </label>
            <label className="pd-field"><span>Transaction reference / UTR</span><input value={paymentForm.transactionReference} maxLength={200} onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })} placeholder="Bank reference, UPI transaction ID or cheque number" /></label>
            <label className="pd-field">
              <span>Amount (₹)</span>
              <input
                type="number" min="0.01" step="0.01" required autoFocus placeholder="0"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </label>
            <label className="pd-field">
              <span>Payment date</span>
              <input
                type="date" required value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </label>
            <label className="pd-field">
              <span>Type</span>
              <select value={paymentForm.paymentType} onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}>
                {PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="pd-field">
              <span>Method</span>
              <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="pd-field">
              <span>Status</span>
              <select value={paymentForm.status} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </label>
            <label className="pd-field">
              <span>Notes</span>
              <input
                type="text" placeholder="Optional reference or notes" value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </label>
            <div className="pd-modal-foot pd-field--wide pd-foot-inline">
              <button type="button" className="pd-btn" onClick={() => setPaymentModal(null)}>Cancel</button>
              <button type="submit" className="pd-btn pd-btn--primary" disabled={paymentSaving}>
                {paymentSaving ? "Saving..." : paymentModal.mode === "edit" ? "Save Payment" : "Add Payment"}
              </button>
            </div>
          </form>
        </PdModal>
      )}

      {showTotal && (
        <PdModal
          size="sm"
          title="Contract Amount"
          subtitle="The full agreed payment for this project."
          onClose={() => setShowTotal(false)}
          footer={
            <>
              <button className="pd-btn" onClick={() => setShowTotal(false)}>Cancel</button>
              <button className="pd-btn pd-btn--primary" onClick={savePaymentSummary} disabled={summarySaving}>
                {summarySaving ? "Updating..." : "Update"}
              </button>
            </>
          }
        >
          <label className="pd-field">
            <span>Total project payment (₹)</span>
            <input
              type="number" min="0" autoFocus value={totalPayment} placeholder="Enter full amount"
              onChange={(e) => setTotalPayment(e.target.value)}
            />
          </label>
        </PdModal>
      )}

      {showChat && !isAdmin && (
        <ProjectChatModal
          project={project}
          currentRole="manager"
          recipientEmail={project.clientEmail || project.client?.email || ""}
          recipientLabel={project.clientName || project.client?.name || "Client"}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

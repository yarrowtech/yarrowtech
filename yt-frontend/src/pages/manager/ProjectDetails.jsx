import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft, FolderKanban, User, Mail, Phone, Building2,
  Briefcase, Calendar, Hash, Activity, UserCheck,
  CreditCard, CheckCircle2, Clock, AlertCircle,
  Plus, Pencil, MessageSquare, Save,
} from "lucide-react";

import ProjectChatModal from "../../components/ProjectChatModal";
import API from "../../services/axiosInstance";
import {
  addProjectPayment,
  getProjectPayments,
  updateManagerProject,
  updateProjectPayment,
  updateProjectPaymentSummary,
} from "../../services/managerService";
import "../../styles/ManagerProjectDetails.css";

const PAYMENT_METHODS  = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Net Banking"];
const PAYMENT_TYPES    = ["Advance", "Milestone", "Final", "Maintenance", "Project Payment"];
const PAYMENT_STATUSES = ["paid", "pending", "failed"];

const STATUS_COLORS = {
  pending:   { bg: "rgba(250,204,21,0.15)",  text: "#ca8a04" },
  ongoing:   { bg: "rgba(56,189,248,0.15)",  text: "#0284c7" },
  completed: { bg: "rgba(52,211,153,0.15)",  text: "#059669" },
};

const createPaymentForm = () => ({
  amount:      "",
  method:      "Bank Transfer",
  paymentType: "Project Payment",
  status:      "paid",
  paymentDate: new Date().toISOString().slice(0, 10),
  notes:       "",
});

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v) || 0);

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

const mapPaymentForEdit = (p) => ({
  amount:      p.amount ?? "",
  method:      p.method || "Bank Transfer",
  paymentType: p.paymentType || "Project Payment",
  status:      p.status || "paid",
  paymentDate: p.paymentDate ? p.paymentDate.slice(0, 10) : "",
  notes:       p.notes || "",
});

export default function ProjectDetails() {
  const navigate    = useNavigate();
  const { projectId } = useParams();

  const [project,  setProject]  = useState(null);
  const [edit,     setEdit]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [paymentData, setPaymentData] = useState({
    project: null,
    summary: { totalPayment: 0, paidAmount: 0, pendingAmount: 0, failedAmount: 0, dueAmount: 0, paymentCount: 0 },
    payments: [],
  });
  const [totalPayment,    setTotalPayment]    = useState("");
  const [paymentForm,     setPaymentForm]     = useState(createPaymentForm());
  const [paymentSaving,   setPaymentSaving]   = useState(false);
  const [summarySaving,   setSummarySaving]   = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingPayment,   setEditingPayment]   = useState(null);

  const loadProject = async () => {
    const res  = await API.get(`/erp/projects/${projectId}`);
    const item = res.data?.project;
    setProject(item || null);
    setEdit(item ? {
      status:           item.status || "pending",
      progress:         item.progress || 0,
      expectedDelivery: item.expectedDelivery ? item.expectedDelivery.slice(0, 10) : "",
      projectDetails:   item.projectDetails || "",
    } : null);
  };

  const loadPayments = async () => {
    const res = await getProjectPayments(projectId);
    const next = {
      project:  res?.project || null,
      summary:  res?.summary || { totalPayment: 0, paidAmount: 0, pendingAmount: 0, failedAmount: 0, dueAmount: 0, paymentCount: 0 },
      payments: Array.isArray(res?.payments) ? res.payments : [],
    };
    setPaymentData(next);
    setTotalPayment(String(next.summary.totalPayment ?? ""));
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProject(), loadPayments()]);
    } catch (err) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || "Failed to load project";
      toast.error(message);
      setProject(null);
      setEdit(null);
      if (status === 404) navigate("/manager/projects", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(); }, [projectId]);

  const saveChanges = async () => {
    if (!edit) return;
    try {
      setSaving(true);
      await updateManagerProject(projectId, {
        status:           edit.status,
        progress:         Number(edit.progress),
        expectedDelivery: edit.expectedDelivery,
        projectDetails:   edit.projectDetails,
      });
      toast.success("Project updated");
      await loadProject();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSummary = async () => {
    try {
      setSummarySaving(true);
      const res = await updateProjectPaymentSummary(projectId, { totalPayment: Number(totalPayment) || 0 });
      setPaymentData({
        project:  res?.project || null,
        summary:  res?.summary || paymentData.summary,
        payments: Array.isArray(res?.payments) ? res.payments : paymentData.payments,
      });
      setTotalPayment(String(res?.summary?.totalPayment ?? 0));
      toast.success("Total payment updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update total payment");
    } finally {
      setSummarySaving(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      setPaymentSaving(true);
      const res = await addProjectPayment({
        projectId,
        amount:      Number(paymentForm.amount) || 0,
        method:      paymentForm.method,
        paymentType: paymentForm.paymentType,
        paymentDate: paymentForm.paymentDate,
        status:      paymentForm.status,
        notes:       paymentForm.notes,
      });
      setPaymentData({
        project:  res?.project || paymentData.project,
        summary:  res?.summary || paymentData.summary,
        payments: Array.isArray(res?.payments) ? res.payments : paymentData.payments,
      });
      setTotalPayment(String(res?.summary?.totalPayment ?? totalPayment));
      setPaymentForm(createPaymentForm());
      toast.success("Payment entry added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add payment");
    } finally {
      setPaymentSaving(false);
    }
  };

  const saveEditedPayment = async (paymentId) => {
    if (!editingPayment) return;
    try {
      const res = await updateProjectPayment(paymentId, {
        amount:      Number(editingPayment.amount) || 0,
        method:      editingPayment.method,
        paymentType: editingPayment.paymentType,
        paymentDate: editingPayment.paymentDate,
        status:      editingPayment.status,
        notes:       editingPayment.notes,
      });
      setPaymentData({
        project:  res?.project || paymentData.project,
        summary:  res?.summary || paymentData.summary,
        payments: Array.isArray(res?.payments) ? res.payments : paymentData.payments,
      });
      setTotalPayment(String(res?.summary?.totalPayment ?? totalPayment));
      setEditingPaymentId(null);
      setEditingPayment(null);
      toast.success("Payment updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update payment");
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="mpd-loading">
        <div className="mpd-spinner" />
        <span>Loading project details...</span>
      </div>
    );
  }

  /* ── Not found ── */
  if (!project || !edit) {
    return (
      <div className="mpd-page">
        <button className="mpd-sec-btn" onClick={() => navigate("/manager/projects")}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <p style={{ color: "var(--erp-text-muted)" }}>Project not found or you do not have access.</p>
      </div>
    );
  }

  const summary = paymentData.summary || {};
  const sc      = STATUS_COLORS[project.status] || STATUS_COLORS.pending;

  return (
    <div className="mpd-page">

      {/* ── Header ── */}
      <div className="mpd-header">
        <div className="mpd-header-left">
          <button className="mpd-back-btn" onClick={() => navigate("/manager/projects")}>
            <ArrowLeft size={18} />
          </button>
          <div className="mpd-header-icon">
            <FolderKanban size={24} />
          </div>
          <div className="mpd-title-block">
            <div className="mpd-title-row">
              <h2>{project.name}</h2>
              <span className="mpd-project-id">{project.projectId}</span>
            </div>
            <p className="mpd-subtitle">
              Client: {project.clientName || project.client?.name || "Unknown"} &nbsp;·&nbsp; Manager: {project.managerEmail || "—"}
            </p>
          </div>
        </div>

        <div className="mpd-header-badges">
          <span className="mpd-status-badge" style={{ background: sc.bg, color: sc.text }}>
            {project.status || "pending"}
          </span>
          <span className="mpd-progress-badge">{project.progress || 0}% complete</span>
          <button className="mpd-chat-btn" onClick={() => setShowChat(true)}>
            <MessageSquare size={16} /> Client Chat
          </button>
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div className="mpd-info-grid">

        {/* Project Details */}
        <div className="mpd-card">
          <div className="mpd-card-head">
            <div className="mpd-card-icon"><Briefcase size={18} /></div>
            <h3>Project Details</h3>
          </div>
          <div className="mpd-info-rows">
            {[
              { icon: Hash,        label: "Project ID",        value: project.projectId },
              { icon: Activity,    label: "Status",            value: project.status || "pending" },
              { icon: Clock,       label: "Progress",          value: `${project.progress || 0}%` },
              { icon: CreditCard,  label: "Total Payment",     value: formatCurrency(summary.totalPayment) },
              { icon: Calendar,    label: "Created",           value: formatDate(project.createdAt) },
              { icon: Calendar,    label: "Expected Delivery", value: project.expectedDelivery ? formatDate(project.expectedDelivery) : "—" },
              { icon: UserCheck,   label: "Tech Lead",         value: project.techLeadEmail || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div className="mpd-info-row" key={label}>
                <div className="mpd-row-icon"><Icon size={13} /></div>
                <div className="mpd-row-body">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Details */}
        <div className="mpd-card">
          <div className="mpd-card-head">
            <div className="mpd-card-icon"><User size={18} /></div>
            <h3>Client Details</h3>
          </div>
          <div className="mpd-info-rows">
            {[
              { icon: User,      label: "Name",          value: project.clientName || project.client?.name || "—" },
              { icon: Mail,      label: "Email",         value: project.clientEmail || project.client?.email || "—" },
              { icon: Phone,     label: "Phone",         value: project.client?.phone || "—" },
              { icon: Building2, label: "Company",       value: project.client?.company || "—" },
              { icon: Hash,      label: "Client ID",     value: project.client?.clientId || project.client?._id || "—" },
              { icon: Activity,  label: "Client Status", value: project.client?.status || "active" },
            ].map(({ icon: Icon, label, value }) => (
              <div className="mpd-info-row" key={label}>
                <div className="mpd-row-icon"><Icon size={13} /></div>
                <div className="mpd-row-body">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Manage Project ── */}
      <div className="mpd-card mpd-card--wide">
        <div className="mpd-card-head">
          <div className="mpd-card-icon"><Pencil size={18} /></div>
          <h3>Manage Project</h3>
        </div>

        <div className="mpd-form-section">
          <div className="mpd-form-grid">

            <div className="mpd-field">
              <label>Progress ({edit.progress}%)</label>
              <div className="mpd-progress-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={edit.progress}
                  onChange={(e) => setEdit({ ...edit, progress: e.target.value })}
                />
                <span className="mpd-progress-val">{edit.progress}%</span>
              </div>
            </div>

            <div className="mpd-field">
              <label>Status</label>
              <select
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="mpd-field">
              <label>Expected Delivery</label>
              <input
                type="date"
                value={edit.expectedDelivery}
                onChange={(e) => setEdit({ ...edit, expectedDelivery: e.target.value })}
              />
            </div>

            <div className="mpd-field mpd-field--wide">
              <label>Project Notes</label>
              <textarea
                rows="5"
                value={edit.projectDetails}
                onChange={(e) => setEdit({ ...edit, projectDetails: e.target.value })}
                placeholder="Add delivery notes, scope details, blockers, or updates..."
              />
            </div>
          </div>

          <div className="mpd-actions">
            <button className="mpd-save-btn" onClick={saveChanges} disabled={saving}>
              <Save size={15} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="mpd-sec-btn" onClick={() => navigate("/manager/projects")}>
              <ArrowLeft size={15} /> Back to Projects
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment Management ── */}
      <div className="mpd-card mpd-card--wide">
        <div className="mpd-card-head">
          <div className="mpd-card-icon"><CreditCard size={18} /></div>
          <h3>Payment Management</h3>
        </div>

        {/* Summary cards */}
        <div className="mpd-pay-summary">
          <div className="mpd-pay-box mpd-pay-box--blue">
            <div className="mpd-pay-box-icon" style={{ background: "rgba(96,165,250,0.15)", color: "#60a5fa" }}>
              <CreditCard size={18} />
            </div>
            <div className="mpd-pay-box-body">
              <span>Total Contract</span>
              <strong>{formatCurrency(summary.totalPayment)}</strong>
            </div>
          </div>
          <div className="mpd-pay-box mpd-pay-box--green">
            <div className="mpd-pay-box-icon" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
              <CheckCircle2 size={18} />
            </div>
            <div className="mpd-pay-box-body">
              <span>Paid by Client</span>
              <strong>{formatCurrency(summary.paidAmount)}</strong>
            </div>
          </div>
          <div className="mpd-pay-box mpd-pay-box--yellow">
            <div className="mpd-pay-box-icon" style={{ background: "rgba(250,204,21,0.15)", color: "#facc15" }}>
              <Clock size={18} />
            </div>
            <div className="mpd-pay-box-body">
              <span>Pending</span>
              <strong>{formatCurrency(summary.pendingAmount)}</strong>
            </div>
          </div>
          <div className="mpd-pay-box mpd-pay-box--red">
            <div className="mpd-pay-box-icon" style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}>
              <AlertCircle size={18} />
            </div>
            <div className="mpd-pay-box-body">
              <span>Yet to be Paid</span>
              <strong>{formatCurrency(summary.dueAmount)}</strong>
            </div>
          </div>
        </div>

        {/* Set total payment */}
        <div className="mpd-pay-total-form">
          <div className="mpd-field">
            <label>Total Project Payment (Contract Amount)</label>
            <input
              type="number"
              min="0"
              value={totalPayment}
              onChange={(e) => setTotalPayment(e.target.value)}
              placeholder="Enter full project payment amount"
            />
          </div>
          <button className="mpd-save-btn" type="button" onClick={savePaymentSummary} disabled={summarySaving}>
            <Save size={15} />
            {summarySaving ? "Updating..." : "Update Total"}
          </button>
        </div>

        {/* Add payment entry */}
        <form className="mpd-pay-entry-form" onSubmit={submitPayment}>
          <div className="mpd-pay-entry-head">
            <Plus size={16} /> Add Payment Entry
          </div>
          <div className="mpd-pay-grid">
            <div className="mpd-field">
              <label>Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
                placeholder="0"
              />
            </div>
            <div className="mpd-field">
              <label>Payment Date</label>
              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="mpd-field">
              <label>Payment Type</label>
              <select
                value={paymentForm.paymentType}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
              >
                {PAYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="mpd-field">
              <label>Payment Method</label>
              <select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              >
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="mpd-field">
              <label>Status</label>
              <select
                value={paymentForm.status}
                onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="mpd-field">
              <label>Notes</label>
              <input
                type="text"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Optional reference or notes"
              />
            </div>
          </div>
          <div className="mpd-actions">
            <button className="mpd-save-btn" type="submit" disabled={paymentSaving}>
              <Plus size={15} />
              {paymentSaving ? "Adding..." : "Add Payment Entry"}
            </button>
          </div>
        </form>

        {/* Payment history table */}
        <div>
          <div className="mpd-section-label">
            <CreditCard size={14} /> Payment History ({paymentData.payments.length})
          </div>
        </div>
        <div className="mpd-table-wrap">
          <table className="mpd-pay-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="mpd-table-empty">No payment entries added yet.</td>
                </tr>
              ) : (
                paymentData.payments.map((payment) => {
                  const isEditing = editingPaymentId === payment._id;
                  const cur       = isEditing ? editingPayment : mapPaymentForEdit(payment);

                  return (
                    <tr key={payment._id}>
                      <td>
                        {isEditing ? (
                          <input type="date" value={cur.paymentDate}
                            onChange={(e) => setEditingPayment({ ...cur, paymentDate: e.target.value })} />
                        ) : formatDate(payment.paymentDate)}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={cur.paymentType}
                            onChange={(e) => setEditingPayment({ ...cur, paymentType: e.target.value })}>
                            {PAYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : payment.paymentType}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={cur.method}
                            onChange={(e) => setEditingPayment({ ...cur, method: e.target.value })}>
                            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        ) : payment.method}
                      </td>
                      <td>
                        {isEditing ? (
                          <input type="number" min="0" value={cur.amount}
                            onChange={(e) => setEditingPayment({ ...cur, amount: e.target.value })} />
                        ) : formatCurrency(payment.amount)}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={cur.status}
                            onChange={(e) => setEditingPayment({ ...cur, status: e.target.value })}>
                            {PAYMENT_STATUSES.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`mpd-pay-badge mpd-pay-badge--${payment.status}`}>
                            {payment.status}
                          </span>
                        )}
                      </td>
                      <td>{payment.invoiceNo || "—"}</td>
                      <td>
                        {isEditing ? (
                          <input type="text" value={cur.notes}
                            onChange={(e) => setEditingPayment({ ...cur, notes: e.target.value })} />
                        ) : (payment.notes || "—")}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="mpd-table-actions">
                            <button className="mpd-table-btn mpd-table-btn--save" type="button"
                              onClick={() => saveEditedPayment(payment._id)}>
                              Save
                            </button>
                            <button className="mpd-table-btn" type="button"
                              onClick={() => { setEditingPaymentId(null); setEditingPayment(null); }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button className="mpd-table-btn" type="button"
                            onClick={() => { setEditingPaymentId(payment._id); setEditingPayment(mapPaymentForEdit(payment)); }}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Chat Modal ── */}
      {showChat && (
        <ProjectChatModal
          project={project}
          currentRole="manager"
          recipientEmail={project.clientEmail || project.client?.email || ""}
          recipientLabel={project.clientName  || project.client?.name  || "Client"}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

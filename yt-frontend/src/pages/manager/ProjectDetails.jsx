import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

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

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Cheque",
  "Card",
  "Net Banking",
];

const PAYMENT_TYPES = [
  "Advance",
  "Milestone",
  "Final",
  "Maintenance",
  "Project Payment",
];

const PAYMENT_STATUSES = ["paid", "pending", "failed"];

const createPaymentForm = () => ({
  amount: "",
  method: "Bank Transfer",
  paymentType: "Project Payment",
  status: "paid",
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: "",
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "-";

const mapPaymentForEdit = (payment) => ({
  amount: payment.amount ?? "",
  method: payment.method || "Bank Transfer",
  paymentType: payment.paymentType || "Project Payment",
  status: payment.status || "paid",
  paymentDate: payment.paymentDate ? payment.paymentDate.slice(0, 10) : "",
  notes: payment.notes || "",
});

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [paymentData, setPaymentData] = useState({
    project: null,
    summary: {
      totalPayment: 0,
      paidAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
      dueAmount: 0,
      paymentCount: 0,
    },
    payments: [],
  });
  const [totalPayment, setTotalPayment] = useState("");
  const [paymentForm, setPaymentForm] = useState(createPaymentForm());
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [summarySaving, setSummarySaving] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  const loadProject = async () => {
    const res = await API.get(`/erp/projects/${projectId}`);
    const item = res.data?.project;

    setProject(item || null);
    setEdit(
      item
        ? {
            status: item.status || "pending",
            progress: item.progress || 0,
            expectedDelivery: item.expectedDelivery
              ? item.expectedDelivery.slice(0, 10)
              : "",
            projectDetails: item.projectDetails || "",
          }
        : null
    );
  };

  const loadPayments = async () => {
    const res = await getProjectPayments(projectId);
    const nextData = {
      project: res?.project || null,
      summary: res?.summary || {
        totalPayment: 0,
        paidAmount: 0,
        pendingAmount: 0,
        failedAmount: 0,
        dueAmount: 0,
        paymentCount: 0,
      },
      payments: Array.isArray(res?.payments) ? res.payments : [],
    };

    setPaymentData(nextData);
    setTotalPayment(String(nextData.summary.totalPayment ?? ""));
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProject(), loadPayments()]);
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message || "Failed to load project";

      toast.error(message);
      setProject(null);
      setEdit(null);

      if (status === 404) {
        navigate("/manager/projects", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [projectId]);

  const saveChanges = async () => {
    if (!edit) return;

    try {
      setSaving(true);
      await updateManagerProject(projectId, {
        status: edit.status,
        progress: Number(edit.progress),
        expectedDelivery: edit.expectedDelivery,
        projectDetails: edit.projectDetails,
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
      const res = await updateProjectPaymentSummary(projectId, {
        totalPayment: Number(totalPayment) || 0,
      });
      setPaymentData({
        project: res?.project || null,
        summary: res?.summary || paymentData.summary,
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
        amount: Number(paymentForm.amount) || 0,
        method: paymentForm.method,
        paymentType: paymentForm.paymentType,
        paymentDate: paymentForm.paymentDate,
        status: paymentForm.status,
        notes: paymentForm.notes,
      });

      setPaymentData({
        project: res?.project || paymentData.project,
        summary: res?.summary || paymentData.summary,
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
        amount: Number(editingPayment.amount) || 0,
        method: editingPayment.method,
        paymentType: editingPayment.paymentType,
        paymentDate: editingPayment.paymentDate,
        status: editingPayment.status,
        notes: editingPayment.notes,
      });

      setPaymentData({
        project: res?.project || paymentData.project,
        summary: res?.summary || paymentData.summary,
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

  if (loading) {
    return <p className="muted">Loading project details...</p>;
  }

  if (!project || !edit) {
    return (
      <div className="manager-project-detail-page">
        <button
          className="back-link-btn"
          onClick={() => navigate("/manager/projects")}
        >
          Back to Projects
        </button>
        <p className="muted">Project not found or you do not have access.</p>
      </div>
    );
  }

  const summary = paymentData.summary || {};

  return (
    <div className="manager-project-detail-page">
      <div className="detail-topbar">
        <div>
          <button
            className="back-link-btn"
            onClick={() => navigate("/manager/projects")}
          >
            Back to Projects
          </button>
          <h2 className="page-title">{project.name}</h2>
          <p className="muted">
            Project ID: {project.projectId} | Client:{" "}
            {project.clientName || project.client?.name || "Unknown Client"}
          </p>
        </div>

        <div className="detail-top-summary">
          <span className={`status ${project.status || "pending"}`}>
            {project.status || "pending"}
          </span>
          <span className="detail-progress-pill">{project.progress || 0}%</span>
        </div>
      </div>

      <div className="project-detail-grid">
        <section className="project-detail-card">
          <h3>Project Details</h3>
          <div className="info-list">
            <p><strong>Name:</strong> {project.name}</p>
            <p><strong>Project ID:</strong> {project.projectId}</p>
            <p><strong>Status:</strong> {project.status || "pending"}</p>
            <p><strong>Progress:</strong> {project.progress || 0}%</p>
            <p><strong>Total Payment:</strong> {formatCurrency(summary.totalPayment)}</p>
            <p>
              <strong>Created:</strong> {project.createdAt ? formatDate(project.createdAt) : "-"}
            </p>
            <p>
              <strong>Expected Delivery:</strong>{" "}
              {project.expectedDelivery ? formatDate(project.expectedDelivery) : "-"}
            </p>
            <p><strong>Tech Lead:</strong> {project.techLeadEmail || "-"}</p>
            <p><strong>Manager:</strong> {project.managerEmail || "-"}</p>
          </div>
        </section>

        <section className="project-detail-card">
          <h3>Client Details</h3>
          <div className="info-list">
            <p><strong>Name:</strong> {project.clientName || project.client?.name || "-"}</p>
            <p><strong>Email:</strong> {project.clientEmail || project.client?.email || "-"}</p>
            <p><strong>Client Status:</strong> {project.client?.status || "active"}</p>
            <p><strong>Client ID:</strong> {project.client?.clientId || project.client?._id || "-"}</p>
            <p><strong>Company:</strong> {project.client?.company || "-"}</p>
            <p><strong>Phone:</strong> {project.client?.phone || "-"}</p>
          </div>
        </section>

        <section className="project-detail-card project-detail-card-wide">
          <h3>Manage Project</h3>

          <div className="edit-grid">
            <div className="form-block">
              <label>Progress ({edit.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={edit.progress}
                onChange={(e) => setEdit({ ...edit, progress: e.target.value })}
              />
            </div>

            <div className="form-block">
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

            <div className="form-block">
              <label>Expected Delivery</label>
              <input
                type="date"
                value={edit.expectedDelivery}
                onChange={(e) =>
                  setEdit({ ...edit, expectedDelivery: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-block">
            <label>Project Notes</label>
            <textarea
              rows="6"
              value={edit.projectDetails}
              onChange={(e) => setEdit({ ...edit, projectDetails: e.target.value })}
              placeholder="Add delivery notes, scope details, blockers, or updates"
            />
          </div>

          <div className="detail-actions">
            <button className="save-btn" onClick={saveChanges} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="cancel-btn" onClick={() => setShowChat(true)}>
              Open Client Chat
            </button>
            <button className="cancel-btn" onClick={() => navigate("/manager/projects")}>
              Back
            </button>
          </div>
        </section>

        <section className="project-detail-card project-detail-card-wide">
          <div className="payment-section-head">
            <div>
              <h3>Payment Management</h3>
              <p className="muted">Manage contract amount, payment entries, and due balance.</p>
            </div>
          </div>

          <div className="payment-summary-grid">
            <div className="payment-summary-box">
              <span>Total Payment</span>
              <strong>{formatCurrency(summary.totalPayment)}</strong>
            </div>
            <div className="payment-summary-box">
              <span>Paid by Client</span>
              <strong>{formatCurrency(summary.paidAmount)}</strong>
            </div>
            <div className="payment-summary-box">
              <span>Pending</span>
              <strong>{formatCurrency(summary.pendingAmount)}</strong>
            </div>
            <div className="payment-summary-box due-box">
              <span>Yet to be Paid</span>
              <strong>{formatCurrency(summary.dueAmount)}</strong>
            </div>
          </div>

          <div className="payment-total-form">
            <div className="form-block">
              <label>Total Project Payment</label>
              <input
                type="number"
                min="0"
                value={totalPayment}
                onChange={(e) => setTotalPayment(e.target.value)}
                placeholder="Enter full project payment amount"
              />
            </div>
            <button
              className="save-btn"
              type="button"
              onClick={savePaymentSummary}
              disabled={summarySaving}
            >
              {summarySaving ? "Updating..." : "Update Total Payment"}
            </button>
          </div>

          <form className="payment-entry-form" onSubmit={submitPayment}>
            <div className="edit-grid payment-grid">
              <div className="form-block">
                <label>Amount</label>
                <input
                  type="number"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-block">
                <label>Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-block">
                <label>Payment Type</label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paymentType: e.target.value })
                  }
                >
                  {PAYMENT_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="form-block">
                <label>Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, method: e.target.value })
                  }
                >
                  {PAYMENT_METHODS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="form-block">
                <label>Status</label>
                <select
                  value={paymentForm.status}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, status: e.target.value })
                  }
                >
                  {PAYMENT_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-block form-block-wide">
                <label>Notes</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  placeholder="Optional notes or reference details"
                />
              </div>
            </div>

            <div className="detail-actions">
              <button className="save-btn" type="submit" disabled={paymentSaving}>
                {paymentSaving ? "Saving..." : "Add Payment Entry"}
              </button>
            </div>
          </form>

          <div className="payment-table-wrap">
            <table className="payment-table">
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
                    <td colSpan="8" className="empty-table-cell">
                      No payment entries added yet.
                    </td>
                  </tr>
                ) : (
                  paymentData.payments.map((payment) => {
                    const isEditing = editingPaymentId === payment._id;
                    const current = isEditing ? editingPayment : mapPaymentForEdit(payment);

                    return (
                      <tr key={payment._id}>
                        <td>
                          {isEditing ? (
                            <input
                              type="date"
                              value={current.paymentDate}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...current,
                                  paymentDate: e.target.value,
                                })
                              }
                            />
                          ) : (
                            formatDate(payment.paymentDate)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={current.paymentType}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...current,
                                  paymentType: e.target.value,
                                })
                              }
                            >
                              {PAYMENT_TYPES.map((item) => (
                                <option key={item} value={item}>{item}</option>
                              ))}
                            </select>
                          ) : (
                            payment.paymentType
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={current.method}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...current,
                                  method: e.target.value,
                                })
                              }
                            >
                              {PAYMENT_METHODS.map((item) => (
                                <option key={item} value={item}>{item}</option>
                              ))}
                            </select>
                          ) : (
                            payment.method
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={current.amount}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...current,
                                  amount: e.target.value,
                                })
                              }
                            />
                          ) : (
                            formatCurrency(payment.amount)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={current.status}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...current,
                                  status: e.target.value,
                                })
                              }
                            >
                              {PAYMENT_STATUSES.map((item) => (
                                <option key={item} value={item}>
                                  {item.charAt(0).toUpperCase() + item.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`payment-status-badge ${payment.status}`}>
                              {payment.status}
                            </span>
                          )}
                        </td>
                        <td>{payment.invoiceNo || "-"}</td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={current.notes}
                              onChange={(e) =>
                                setEditingPayment({
                                  ...current,
                                  notes: e.target.value,
                                })
                              }
                            />
                          ) : (
                            payment.notes || "-"
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="inline-actions">
                              <button
                                className="save-btn small-btn"
                                type="button"
                                onClick={() => saveEditedPayment(payment._id)}
                              >
                                Save
                              </button>
                              <button
                                className="cancel-btn small-btn"
                                type="button"
                                onClick={() => {
                                  setEditingPaymentId(null);
                                  setEditingPayment(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="cancel-btn small-btn"
                              type="button"
                              onClick={() => {
                                setEditingPaymentId(payment._id);
                                setEditingPayment(mapPaymentForEdit(payment));
                              }}
                            >
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
        </section>
      </div>

      {showChat && (
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

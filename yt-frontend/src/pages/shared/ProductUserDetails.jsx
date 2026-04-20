import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import ProductUserChatModal from "../../components/ProductUserChatModal";
import "../../styles/ManagerProjectDetails.css";
import "../../styles/ProductUserManagement.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "-";

export default function ProductUserDetails({
  backPath,
  currentRole,
  loadDetails,
  updatePaymentSummary,
  addPayment,
  allowChat = true,
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summarySaving, setSummarySaving] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [form, setForm] = useState({
    amount: "",
    method: "Bank Transfer",
    status: "paid",
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const next = await loadDetails(id);
      setDetails(next);
      setTotalAmount(String(next?.paymentSummary?.totalAmount ?? next?.productUser?.totalAmount ?? ""));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load details");
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const next = await addPayment(id, {
        amount: Number(form.amount) || 0,
        method: form.method,
        status: form.status,
        paymentDate: form.paymentDate,
        notes: form.notes,
      });
      setDetails(next);
      setForm({
        amount: "",
        method: "Bank Transfer",
        status: "paid",
        paymentDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      toast.success("Payment entry added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add payment");
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSummary = async () => {
    if (!updatePaymentSummary) return;

    try {
      setSummarySaving(true);
      const next = await updatePaymentSummary(id, {
        totalAmount: Number(totalAmount) || 0,
      });
      setDetails(next);
      setTotalAmount(String(next?.paymentSummary?.totalAmount ?? 0));
      toast.success("Total amount updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update total amount");
    } finally {
      setSummarySaving(false);
    }
  };

  if (loading) {
    return <p className="muted">Loading product user details...</p>;
  }

  if (!details?.productUser) {
    return (
      <div className="product-user-page">
        <button className="back-link-btn" onClick={() => navigate(backPath)}>
          Back
        </button>
        <p className="muted">Product user not found.</p>
      </div>
    );
  }

  const item = details.productUser;
  const summary = details.paymentSummary || {};
  const history = Array.isArray(details.paymentHistory) ? details.paymentHistory : [];

  return (
    <div className="product-user-page">
      <div className="detail-topbar">
        <div>
          <button className="back-link-btn" onClick={() => navigate(backPath)}>
            Back
          </button>
          <h2 className="page-title">{item.name || item.email}</h2>
          <p className="muted">{item.productName || "-"} | {item.email}</p>
        </div>
        {allowChat && (
          <div className="detail-actions">
            <button className="cancel-btn" onClick={() => setShowChat(true)}>
              Open Chat
            </button>
          </div>
        )}
      </div>

      <div className="project-detail-grid">
        <section className="project-detail-card">
          <h3>User Details</h3>
          <div className="info-list">
            <p><strong>Name:</strong> {item.name || "-"}</p>
            <p><strong>Email:</strong> {item.email}</p>
            <p><strong>Mobile:</strong> {item.mobileNumber || "-"}</p>
            <p><strong>Address:</strong> {item.address || "-"}</p>
            <p><strong>Status:</strong> {item.status || "active"}</p>
            <p><strong>Assigned On:</strong> {formatDate(item.assignedAt || item.createdAt)}</p>
          </div>
        </section>

        <section className="project-detail-card">
          <h3>Assignment Details</h3>
          <div className="info-list">
            <p><strong>Product:</strong> {item.productName || "-"}</p>
            <p><strong>Manager:</strong> {item.manager?.name || item.managerEmail || "-"}</p>
            <p><strong>Manager Email:</strong> {item.manager?.email || item.managerEmail || "-"}</p>
            <p><strong>Role:</strong> {item.role}</p>
            <p><strong>Total Amount:</strong> {formatCurrency(summary.totalAmount)}</p>
          </div>
        </section>

        <section className="project-detail-card project-detail-card-wide">
          <h3>Payment Summary</h3>
          <div className="payment-summary-grid">
            <div className="payment-summary-box">
              <span>Total Amount</span>
              <strong>{formatCurrency(summary.totalAmount)}</strong>
            </div>
            <div className="payment-summary-box">
              <span>Paid</span>
              <strong>{formatCurrency(summary.paid)}</strong>
            </div>
            <div className="payment-summary-box">
              <span>Pending</span>
              <strong>{formatCurrency(summary.pending)}</strong>
            </div>
            <div className="payment-summary-box due-box">
              <span>Yet to be Paid</span>
              <strong>{formatCurrency(summary.dueAmount)}</strong>
            </div>
          </div>

          {updatePaymentSummary && (
            <div className="payment-total-form">
              <div className="form-block">
                <label>Total Amount</label>
                <input
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="Enter total amount"
                />
              </div>
              <button
                className="save-btn"
                type="button"
                onClick={savePaymentSummary}
                disabled={summarySaving}
              >
                {summarySaving ? "Updating..." : "Update Total Amount"}
              </button>
            </div>
          )}

          <form className="payment-entry-form" onSubmit={submitPayment}>
            <div className="edit-grid payment-grid">
              <div className="form-block">
                <label>Amount</label>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-block">
                <label>Method</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                >
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Card</option>
                </select>
              </div>
              <div className="form-block">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="form-block">
                <label>Date</label>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-block form-block-wide">
                <label>Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="detail-actions">
              <button className="save-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Payment"}
              </button>
            </div>
          </form>

          <div className="payment-table-wrap">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table-cell">No payment history found.</td>
                  </tr>
                ) : (
                  history.map((payment) => (
                    <tr key={payment._id}>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>{payment.method || "-"}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>
                        <span className={`payment-status-badge ${payment.status || "pending"}`}>
                          {payment.status || "pending"}
                        </span>
                      </td>
                      <td>{payment.invoiceNo || "-"}</td>
                      <td>{payment.notes || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {allowChat && showChat && (
        <ProductUserChatModal
          productUserId={item._id}
          currentRole={currentRole}
          recipientEmail={item.email}
          recipientLabel={item.name || item.email}
          title="Product User Chat"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft, Package, User, Mail, Phone, MapPin,
  Activity, Calendar, UserCheck,
  CreditCard, CheckCircle2, Clock, AlertCircle,
  MessageSquare,
} from "lucide-react";

import ProductUserChatModal from "../../components/ProductUserChatModal";
import "../../styles/ManagerProjectDetails.css";
import "../../styles/ProductUserManagement.css";

const STATUS_COLORS = {
  active:   { bg: "rgba(52,211,153,0.15)", text: "#34d399" },
  inactive: { bg: "rgba(100,116,139,0.15)", text: "#94a3b8" },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

export default function ProductUserDetails({
  backPath,
  currentRole,
  loadDetails,
  allowChat = true,
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setDetails(await loadDetails(id));
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

  if (loading) {
    return (
      <div className="mpd-loading">
        <div className="mpd-spinner" />
        <span>Loading product user details...</span>
      </div>
    );
  }

  if (!details?.productUser) {
    return (
      <div className="mpd-page">
        <button className="mpd-sec-btn" onClick={() => navigate(backPath)}>
          <ArrowLeft size={16} /> Back to Product Users
        </button>
        <p style={{ color: "var(--erp-text-muted)" }}>Product user not found.</p>
      </div>
    );
  }

  const item = details.productUser;
  const summary = details.paymentSummary || {};
  const history = Array.isArray(details.paymentHistory) ? details.paymentHistory : [];
  const sc = STATUS_COLORS[item.status] || STATUS_COLORS.active;

  return (
    <div className="mpd-page">

      {/* ── Header ── */}
      <div className="mpd-header">
        <div className="mpd-header-left">
          <button className="mpd-back-btn" onClick={() => navigate(backPath)}>
            <ArrowLeft size={18} />
          </button>
          <div className="mpd-header-icon">
            <Package size={24} />
          </div>
          <div className="mpd-title-block">
            <div className="mpd-title-row">
              <h2>{item.name || item.email}</h2>
            </div>
            <p className="mpd-subtitle">
              {item.productName || "-"} &nbsp;·&nbsp; {item.email}
            </p>
          </div>
        </div>

        <div className="mpd-header-badges">
          <span className="mpd-status-badge" style={{ background: sc.bg, color: sc.text }}>
            {item.status || "active"}
          </span>
          {allowChat && (
            <button className="mpd-chat-btn" onClick={() => setShowChat(true)}>
              <MessageSquare size={16} /> Open Chat
            </button>
          )}
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div className="mpd-info-grid">

        {/* User Details */}
        <div className="mpd-card mpd-card--wide">
          <div className="mpd-card-head">
            <div className="mpd-card-icon"><User size={18} /></div>
            <h3>User Details</h3>
          </div>
          <div className="mpd-info-rows">
            {[
              { icon: User,      label: "Name",        value: item.name || "-" },
              { icon: Mail,      label: "Email",       value: item.email },
              { icon: Phone,     label: "Mobile",      value: item.mobileNumber || "-" },
              { icon: MapPin,    label: "Address",     value: item.address || "-" },
              { icon: Package,   label: "Product",     value: item.productName || "-" },
              { icon: UserCheck, label: "Manager",     value: item.manager?.name || item.managerEmail || "-" },
              { icon: Activity,  label: "Status",      value: item.status || "active" },
              { icon: Calendar,  label: "Assigned On", value: formatDate(item.assignedAt || item.createdAt) },
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

      {/* ── Payment Summary ── */}
      <div className="mpd-card mpd-card--wide">
        <div className="mpd-card-head">
          <div className="mpd-card-icon"><CreditCard size={18} /></div>
          <h3>Payment Summary</h3>
        </div>

        <div className="mpd-pay-summary">
          <div className="mpd-pay-box mpd-pay-box--blue">
            <div className="mpd-pay-box-icon" style={{ background: "rgba(96,165,250,0.15)", color: "#60a5fa" }}>
              <CreditCard size={18} />
            </div>
            <div className="mpd-pay-box-body">
              <span>Total Amount</span>
              <strong>{formatCurrency(summary.totalAmount)}</strong>
            </div>
          </div>
          <div className="mpd-pay-box mpd-pay-box--green">
            <div className="mpd-pay-box-icon" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
              <CheckCircle2 size={18} />
            </div>
            <div className="mpd-pay-box-body">
              <span>Paid</span>
              <strong>{formatCurrency(summary.paid)}</strong>
            </div>
          </div>
          <div className="mpd-pay-box mpd-pay-box--yellow">
            <div className="mpd-pay-box-icon" style={{ background: "rgba(250,204,21,0.15)", color: "#facc15" }}>
              <Clock size={18} />
            </div>
            <div className="mpd-pay-box-body">
              <span>Pending</span>
              <strong>{formatCurrency(summary.pending)}</strong>
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

        {/* Payment history table */}
        <div>
          <div className="mpd-section-label">
            <CreditCard size={14} /> Payment History ({history.length})
          </div>
        </div>
        <div className="mpd-table-wrap">
          <table className="mpd-pay-table">
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
                  <td colSpan="6" className="mpd-table-empty">No payment history found.</td>
                </tr>
              ) : (
                history.map((payment) => (
                  <tr key={payment._id}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>{payment.method || "-"}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>
                      <span className={`mpd-pay-badge mpd-pay-badge--${payment.status || "pending"}`}>
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

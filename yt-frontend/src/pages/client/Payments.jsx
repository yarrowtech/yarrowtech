import { useEffect, useState } from "react";
import {
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  FileText,
} from "lucide-react";

import "../../styles/ClientPayments.css";
import { clientService } from "../../services/clientService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const STATUS_MAP = {
  paid:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: <CheckCircle size={13} /> },
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <Clock size={13} /> },
  failed:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: <XCircle size={13} /> },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      className="cp-status-badge"
      style={{ color: s.color, background: s.bg, borderColor: s.color + "30" }}
    >
      {s.icon}
      {status || "pending"}
    </span>
  );
}

export default function ClientPayments() {
  const [loading, setLoading] = useState(true);
  const [projectPayments, setProjectPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPayment: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    dueAmount: 0,
  });

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const res = await clientService.payments();
        setProjectPayments(Array.isArray(res?.projectPayments) ? res.projectPayments : []);
        setSummary(res?.summary || {});
      } catch {
        setProjectPayments([]);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const total = Number(summary.totalPayment) || 0;
  const paid  = Number(summary.paidAmount)   || 0;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  const statCards = [
    {
      label: "Total Payment",
      value: formatCurrency(summary.totalPayment),
      icon: <IndianRupee size={20} />,
      accent: "#ffcb05",
      bg: "rgba(255,203,5,0.08)",
    },
    {
      label: "Paid by Client",
      value: formatCurrency(summary.paidAmount),
      icon: <CheckCircle size={20} />,
      accent: "#22c55e",
      bg: "rgba(34,197,94,0.08)",
    },
    {
      label: "Pending",
      value: formatCurrency(summary.pendingAmount),
      icon: <Clock size={20} />,
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
    {
      label: "Yet to be Paid",
      value: formatCurrency(summary.dueAmount),
      icon: <XCircle size={20} />,
      accent: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
    },
  ];

  return (
    <div className="cp-page">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-header-icon">
          <CreditCard size={26} />
        </div>
        <div>
          <h2>Payments</h2>
          <p>Track project-wise payments, paid amount, and due balance.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="cp-stats-grid">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="cp-stat-card"
            style={{ "--accent": card.accent, "--bg": card.bg }}
          >
            <div className="cp-stat-icon">{card.icon}</div>
            <div className="cp-stat-body">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="cp-overall-progress">
        <div className="cp-progress-header">
          <span>Overall Payment Completion</span>
          <span className="cp-progress-pct">{paidPct}%</span>
        </div>
        <div className="cp-progress-bar">
          <div className="cp-progress-fill" style={{ width: `${paidPct}%` }} />
        </div>
      </div>

      {/* Project Payment Cards */}
      {loading ? (
        <p className="cp-empty">Loading payment details...</p>
      ) : projectPayments.length === 0 ? (
        <div className="cp-empty-block">
          <FileText size={40} />
          <p>No payment records available yet.</p>
        </div>
      ) : (
        <div className="cp-project-list">
          {projectPayments.map((item) => {
            const projTotal = Number(item.summary?.totalPayment) || 0;
            const projPaid  = Number(item.summary?.paidAmount)   || 0;
            const projPct   = projTotal > 0 ? Math.round((projPaid / projTotal) * 100) : 0;

            return (
              <section key={item.project?._id} className="cp-project-card">
                {/* Project Header */}
                <div className="cp-project-head">
                  <div className="cp-project-head-left">
                    <h3>{item.project?.name || "Project"}</h3>
                    <span className="cp-project-id">
                      ID: {item.project?.projectId || "-"}
                    </span>
                  </div>

                  <div className="cp-project-chips">
                    <span className="cp-chip total">
                      Total: {formatCurrency(item.summary?.totalPayment)}
                    </span>
                    <span className="cp-chip paid">
                      Paid: {formatCurrency(item.summary?.paidAmount)}
                    </span>
                    <span className="cp-chip due">
                      Due: {formatCurrency(item.summary?.dueAmount)}
                    </span>
                  </div>
                </div>

                {/* Per-project progress bar */}
                <div className="cp-proj-progress">
                  <div className="cp-progress-bar">
                    <div className="cp-progress-fill" style={{ width: `${projPct}%` }} />
                  </div>
                  <span className="cp-proj-pct">{projPct}% paid</span>
                </div>

                {/* Payment Table */}
                <div className="cp-table-wrap">
                  <table className="cp-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Invoice</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.payments?.length ? (
                        item.payments.map((payment) => (
                          <tr key={payment._id}>
                            <td>{formatDate(payment.paymentDate)}</td>
                            <td>{payment.paymentType || "-"}</td>
                            <td>{payment.method || "-"}</td>
                            <td className="cp-amount">{formatCurrency(payment.amount)}</td>
                            <td>
                              <StatusBadge status={payment.status} />
                            </td>
                            <td>{payment.invoiceNo || "-"}</td>
                            <td className="cp-notes">{payment.notes || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="cp-empty-cell">
                            No payment entries for this project yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Wallet, CheckCircle, Clock, IndianRupee } from "lucide-react";

import { productUserService } from "../../services/productUserService";
import "../../styles/ProductUserPortal.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function ProductUserDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setData(await productUserService.dashboard());
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="muted">Loading dashboard...</p>;

  const stats = data?.stats || {};
  const paymentSummary = data?.paymentSummary || {};

  const total = Number(paymentSummary.totalAmount) || 0;
  const paid = Number(paymentSummary.paid) || 0;
  const pending = Number(paymentSummary.pending) || 0;
  const due = Number(paymentSummary.dueAmount) || 0;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  const pieData = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
    { name: "Due", value: due },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      label: "Total Amount",
      value: formatCurrency(stats.totalPayments),
      icon: <IndianRupee size={22} />,
      accent: "#ffcb05",
      bg: "rgba(255,203,5,0.08)",
    },
    {
      label: "Paid Amount",
      value: formatCurrency(stats.paidPayments),
      icon: <CheckCircle size={22} />,
      accent: "#22c55e",
      bg: "rgba(34,197,94,0.08)",
    },
    {
      label: "Yet to be Paid",
      value: formatCurrency(stats.dueAmount),
      icon: <Clock size={22} />,
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
  ];

  return (
    <div className="pu-dash-page">
      {/* Header */}
      <div className="pu-dash-header">
        <div className="pu-dash-header-icon">
          <Wallet size={28} />
        </div>
        <div>
          <h2>Payment Dashboard</h2>
          <p>Track your total amount, paid amount, and due balance at a glance.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="pu-dash-stats">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="pu-dash-stat-card"
            style={{ "--accent": card.accent, "--bg": card.bg }}
          >
            <div className="pu-dash-stat-icon">{card.icon}</div>
            <div className="pu-dash-stat-body">
              <span className="pu-dash-stat-label">{card.label}</span>
              <strong className="pu-dash-stat-value">{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="pu-dash-bottom">
        {/* Payment Breakdown Chart */}
        <div className="pu-dash-card">
          <h3>Payment Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ background: "#071a2d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                />
                <Legend
                  formatter={(val) => <span style={{ color: "#cbd5e1" }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="pu-dash-empty">No payment data available yet.</p>
          )}
        </div>

        {/* Payment Summary + Progress */}
        <div className="pu-dash-card">
          <h3>Payment Summary</h3>
          <div className="pu-dash-summary-rows">
            <div className="pu-dash-summary-row">
              <span>Total Amount</span>
              <strong>{formatCurrency(paymentSummary.totalAmount)}</strong>
            </div>
            <div className="pu-dash-summary-row">
              <span>Paid</span>
              <strong style={{ color: "#22c55e" }}>{formatCurrency(paymentSummary.paid)}</strong>
            </div>
            <div className="pu-dash-summary-row">
              <span>Pending</span>
              <strong style={{ color: "#f59e0b" }}>{formatCurrency(paymentSummary.pending)}</strong>
            </div>
            <div className="pu-dash-summary-row">
              <span>Yet to be Paid</span>
              <strong style={{ color: "#ef4444" }}>{formatCurrency(paymentSummary.dueAmount)}</strong>
            </div>
          </div>

          <div className="pu-dash-progress-section">
            <div className="pu-dash-progress-header">
              <span>Payment Completion</span>
              <span className="pu-dash-pct">{paidPct}%</span>
            </div>
            <div className="pu-dash-progress-bar">
              <div
                className="pu-dash-progress-fill"
                style={{ width: `${paidPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

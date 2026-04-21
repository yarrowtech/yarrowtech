import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  IndianRupee,
  CheckCircle,
  Clock,
} from "lucide-react";

import { productUserService } from "../../services/productUserService";
import "../../styles/ProductUserPortal.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function InfoRow({ icon, label, value }) {
  return (
    <div className="pu-proj-info-row">
      <div className="pu-proj-info-icon">{icon}</div>
      <div className="pu-proj-info-body">
        <span className="pu-proj-info-label">{label}</span>
        <span className="pu-proj-info-value">{value || "-"}</span>
      </div>
    </div>
  );
}

function CardHeader({ icon, title }) {
  return (
    <div className="pu-proj-card-header">
      <div className="pu-proj-card-icon">{icon}</div>
      <h3>{title}</h3>
    </div>
  );
}

export default function ProductUserProjects() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setData(await productUserService.project());
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="muted">Loading project details...</p>;

  const item = data?.productUser || {};
  const summary = data?.paymentSummary || {};
  const total = Number(summary.totalAmount) || 0;
  const paid = Number(summary.paid) || 0;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <div className="pu-proj-page">
      {/* Header */}
      <div className="pu-dash-header" style={{ marginBottom: 28 }}>
        <div className="pu-dash-header-icon">
          <Package size={28} />
        </div>
        <div>
          <h2>Project Details</h2>
          <p>Your assigned product information and account details.</p>
        </div>
      </div>

      <div className="pu-proj-grid">
        {/* Assigned Product */}
        <div className="pu-proj-card">
          <CardHeader icon={<Briefcase size={18} />} title="Assigned Product" />

          {item.productName && (
            <div className="pu-proj-product-badge">
              <Package size={15} />
              {item.productName}
            </div>
          )}

          <div className="pu-proj-info-list">
            <InfoRow
              icon={<User size={15} />}
              label="Manager"
              value={item.manager?.name || item.managerEmail || "-"}
            />
            <InfoRow
              icon={<Mail size={15} />}
              label="Manager Email"
              value={item.manager?.email || item.managerEmail || "-"}
            />
            <InfoRow
              icon={<Calendar size={15} />}
              label="Assigned Date"
              value={
                item.assignedAt
                  ? new Date(item.assignedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"
              }
            />
          </div>
        </div>

        {/* Account Details */}
        <div className="pu-proj-card">
          <CardHeader icon={<User size={18} />} title="Account Details" />
          <div className="pu-proj-info-list">
            <InfoRow icon={<User size={15} />} label="Name" value={item.name} />
            <InfoRow icon={<Mail size={15} />} label="Email" value={item.email} />
            <InfoRow icon={<Phone size={15} />} label="Mobile" value={item.mobileNumber} />
            <InfoRow icon={<MapPin size={15} />} label="Address" value={item.address} />
          </div>
        </div>

        {/* Payment Overview */}
        <div className="pu-proj-card">
          <CardHeader icon={<IndianRupee size={18} />} title="Payment Overview" />

          <div className="pu-proj-payment-rows">
            <div className="pu-proj-payment-row">
              <span>Total Amount</span>
              <strong>{formatCurrency(summary.totalAmount)}</strong>
            </div>
            <div className="pu-proj-payment-row paid">
              <span>
                <CheckCircle size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                Paid
              </span>
              <strong>{formatCurrency(summary.paid)}</strong>
            </div>
            <div className="pu-proj-payment-row pending">
              <span>
                <Clock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                Pending
              </span>
              <strong>{formatCurrency(summary.pending)}</strong>
            </div>
            <div className="pu-proj-payment-row due">
              <span>Yet to be Paid</span>
              <strong>{formatCurrency(summary.dueAmount)}</strong>
            </div>
          </div>

          <div className="pu-dash-progress-section" style={{ marginTop: 20 }}>
            <div className="pu-dash-progress-header">
              <span>Payment Completion</span>
              <span className="pu-dash-pct">{paidPct}%</span>
            </div>
            <div className="pu-dash-progress-bar">
              <div className="pu-dash-progress-fill" style={{ width: `${paidPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

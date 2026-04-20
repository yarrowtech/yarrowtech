import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { productUserService } from "../../services/productUserService";
import "../../styles/ProductUserPortal.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

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

  return (
    <div className="product-portal-page">
      <div className="product-portal-head">
        <h2>Payment Dashboard</h2>
        <p>View your total amount, paid amount, pending amount, and due balance.</p>
      </div>

      <div className="product-portal-stats">
        <div className="product-portal-stat">
          <span>Total Amount</span>
          <strong>{formatCurrency(stats.totalPayments)}</strong>
        </div>
        <div className="product-portal-stat">
          <span>Paid Amount</span>
          <strong>{formatCurrency(stats.paidPayments)}</strong>
        </div>
        <div className="product-portal-stat">
          <span>Yet to be Paid</span>
          <strong>{formatCurrency(stats.dueAmount)}</strong>
        </div>
      </div>

      <section className="product-portal-card">
        <h3>Payment Summary</h3>
        <p><strong>Total Amount:</strong> {formatCurrency(paymentSummary.totalAmount)}</p>
        <p><strong>Paid:</strong> {formatCurrency(paymentSummary.paid)}</p>
        <p><strong>Pending:</strong> {formatCurrency(paymentSummary.pending)}</p>
        <p><strong>Yet to be Paid:</strong> {formatCurrency(paymentSummary.dueAmount)}</p>
      </section>
    </div>
  );
}

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

  return (
    <div className="product-portal-page">
      <div className="product-portal-head">
        <h2>Project Details</h2>
        <p>All assigned product information and your account details in one place.</p>
      </div>

      <div className="product-portal-grid">
        <section className="product-portal-card">
          <h3>Assigned Product</h3>
          <p><strong>Product Name:</strong> {item.productName || "-"}</p>
          <p><strong>Manager:</strong> {item.manager?.name || item.managerEmail || "-"}</p>
          <p><strong>Manager Email:</strong> {item.manager?.email || item.managerEmail || "-"}</p>
          <p><strong>Assigned Date:</strong> {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : "-"}</p>
        </section>

        <section className="product-portal-card">
          <h3>Account Details</h3>
          <p><strong>Name:</strong> {item.name || "-"}</p>
          <p><strong>Email:</strong> {item.email || "-"}</p>
          <p><strong>Mobile:</strong> {item.mobileNumber || "-"}</p>
          <p><strong>Address:</strong> {item.address || "-"}</p>
        </section>

        <section className="product-portal-card">
          <h3>Payment Overview</h3>
          <p><strong>Total Amount:</strong> {formatCurrency(summary.totalAmount)}</p>
          <p><strong>Paid:</strong> {formatCurrency(summary.paid)}</p>
          <p><strong>Pending:</strong> {formatCurrency(summary.pending)}</p>
          <p><strong>Yet to be Paid:</strong> {formatCurrency(summary.dueAmount)}</p>
        </section>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { productUserService } from "../../services/productUserService";
import "../../styles/ProductUserPortal.css";
import "../../styles/ProductUserManagement.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "-";

export default function ProductUserPayments() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await productUserService.payments();
        setSummary(res?.paymentSummary || {});
        setHistory(Array.isArray(res?.paymentHistory) ? res.paymentHistory : []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="product-portal-page">
      <div className="product-portal-head">
        <h2>Payment History</h2>
        <p>See your complete payment record for the assigned product account.</p>
      </div>

      <div className="product-portal-stats">
        <div className="product-portal-stat">
          <span>Total Amount</span>
          <strong>{formatCurrency(summary.totalAmount)}</strong>
        </div>
        <div className="product-portal-stat">
          <span>Paid</span>
          <strong>{formatCurrency(summary.paid)}</strong>
        </div>
        <div className="product-portal-stat">
          <span>Pending</span>
          <strong>{formatCurrency(summary.pending)}</strong>
        </div>
        <div className="product-portal-stat">
          <span>Yet to be Paid</span>
          <strong>{formatCurrency(summary.dueAmount)}</strong>
        </div>
      </div>

      <div className="product-user-table-wrap">
        <table className="product-user-table">
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
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-table-cell">Loading payment history...</td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table-cell">No payment history available.</td>
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
    </div>
  );
}

import React, { useEffect, useState } from "react";
import "../../styles/ClientPayments.css";
import { clientService } from "../../services/clientService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "-";

export default function ClientPayments() {
  const [loading, setLoading] = useState(true);
  const [projectPayments, setProjectPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPayment: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    dueAmount: 0,
    paymentCount: 0,
  });

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const res = await clientService.payments();
        setProjectPayments(Array.isArray(res?.projectPayments) ? res.projectPayments : []);
        setSummary(
          res?.summary || {
            totalPayment: 0,
            paidAmount: 0,
            pendingAmount: 0,
            failedAmount: 0,
            dueAmount: 0,
            paymentCount: 0,
          }
        );
      } catch (err) {
        setProjectPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <div className="client-payments-container">
      <div className="client-header">
        <h2>Payments</h2>
        <p className="subtitle">Track project-wise payments, paid amount, and due balance.</p>
      </div>

      <div className="client-payment-summary-grid">
        <div className="client-payment-summary-card">
          <span>Total Payment</span>
          <strong>{formatCurrency(summary.totalPayment)}</strong>
        </div>
        <div className="client-payment-summary-card">
          <span>Paid by Client</span>
          <strong>{formatCurrency(summary.paidAmount)}</strong>
        </div>
        <div className="client-payment-summary-card">
          <span>Pending</span>
          <strong>{formatCurrency(summary.pendingAmount)}</strong>
        </div>
        <div className="client-payment-summary-card highlight">
          <span>Yet to be Paid</span>
          <strong>{formatCurrency(summary.dueAmount)}</strong>
        </div>
      </div>

      {loading ? (
        <div className="client-payments-table-wrapper">
          <p className="client-empty-state">Loading payment details...</p>
        </div>
      ) : projectPayments.length === 0 ? (
        <div className="client-payments-table-wrapper">
          <p className="client-empty-state">No payment records available yet.</p>
        </div>
      ) : (
        <div className="client-payment-project-list">
          {projectPayments.map((item) => (
            <section key={item.project?._id} className="client-payment-project-card">
              <div className="client-payment-project-head">
                <div>
                  <h3>{item.project?.name || "Project"}</h3>
                  <p>
                    Project ID: {item.project?.projectId || "-"} | Total:{" "}
                    {formatCurrency(item.summary?.totalPayment)}
                  </p>
                </div>
                <div className="client-payment-mini-stats">
                  <span>Paid: {formatCurrency(item.summary?.paidAmount)}</span>
                  <span>Due: {formatCurrency(item.summary?.dueAmount)}</span>
                </div>
              </div>

              <div className="client-payments-table-wrapper">
                <table className="client-payments-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payment Type</th>
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
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>
                            <span
                              className={`client-payment-status client-payment-${payment.status || "pending"}`}
                            >
                              {payment.status || "pending"}
                            </span>
                          </td>
                          <td>{payment.invoiceNo || "-"}</td>
                          <td>{payment.notes || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="client-empty-table-cell">
                          No payment entries for this project yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

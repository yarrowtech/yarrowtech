import React from "react";
import "../../styles/ClientPayments.css";

export default function ClientPayments() {
  // SAMPLE DATA (replace later with API data)
  const payments = [
    {
      id: 1,
      date: "2025-03-01",
      amount: "₹12,000",
      method: "UPI",
      status: "success",
    },
    {
      id: 2,
      date: "2025-02-20",
      amount: "₹8,500",
      method: "Net Banking",
      status: "pending",
    },
    {
      id: 3,
      date: "2025-01-28",
      amount: "₹20,000",
      method: "Card",
      status: "failed",
    },
  ];

  return (
    <div className="client-payments-container">
      {/* Header */}
      <div className="client-header">
        <h2>Payments</h2>
        <p className="subtitle">Track all your payment activity</p>
      </div>

      {/* Table */}
      <div className="client-payments-table-wrapper">
        <table className="client-payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.date}</td>
                <td>{p.amount}</td>
                <td>{p.method}</td>

                <td>
                  <span
                    className={`client-payment-status client-payment-${p.status}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

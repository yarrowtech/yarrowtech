import React from "react";
import "../../styles/ClientProjectHistory.css";

export default function ClientProjectHistory() {
  // SAMPLE DATA — replace with backend/API later
  const history = [
    {
      id: 1,
      project: "Yarrowtech Website",
      activity: "UI Design Updated",
      date: "2025-03-01",
      status: "completed",
    },
    {
      id: 2,
      project: "CRM Dashboard",
      activity: "New API Endpoints Added",
      date: "2025-02-22",
      status: "ongoing",
    },
    {
      id: 3,
      project: "Billing System",
      activity: "Payment gateway integration pending",
      date: "2025-02-10",
      status: "pending",
    },
  ];

  return (
    <div className="client-history-container">
      {/* Header */}
      <div className="client-header">
        <h2>Project History</h2>
        <p className="subtitle">View your project activity timeline</p>
      </div>

      {/* Table */}
      <div className="client-history-table-wrapper">
        <table className="client-history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Activity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.project}</td>
                <td>{item.activity}</td>
                <td>{item.date}</td>

                <td>
                  <span
                    className={`client-history-status client-history-${item.status}`}
                  >
                    {item.status}
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

import React, { useEffect, useState } from "react";
import "../../styles/RequestDemoAdmin.css";
import { Search, Eye, X } from "lucide-react";
import {
  getDemoRequests,
  exportLeadsExcel,
  exportLeadsPDF,
} from "../../services/adminService";

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "blue" },
  { value: "contacted", label: "Contacted", color: "yellow" },
  { value: "in-progress", label: "In Progress", color: "purple" },
  { value: "closed", label: "Closed", color: "green" },
];

export default function RequestDemoAdmin() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getDemoRequests();
      const list = Array.isArray(data?.requests) ? data.requests : [];
      setRequests(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed to load demo requests:", err);
      setRequests([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(requests);
      return;
    }

    const value = search.toLowerCase();
    setFiltered(
      requests.filter(
        (lead) =>
          lead.fullName?.toLowerCase().includes(value) ||
          lead.email?.toLowerCase().includes(value) ||
          lead.companyName?.toLowerCase().includes(value) ||
          lead.projectDescription?.toLowerCase().includes(value)
      )
    );
  }, [search, requests]);

  const renderStatusBadge = (status) => {
    const current = STATUS_OPTIONS.find((item) => item.value === status);

    return (
      <span className={`status-badge ${current?.color || "gray"}`}>
        {current?.label || "Unknown"}
      </span>
    );
  };

  return (
    <div className="admin-requests-container">
      <div className="admin-header">
        <h2>CRM - Demo Requests</h2>
        <p className="subtitle">
          View all incoming demo requests from the website
        </p>
      </div>

      <div className="rd-action-bar">
        <div className="rd-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, company or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rd-actions">
          <button className="export-btn excel" onClick={exportLeadsExcel}>
            Export Excel
          </button>
          <button className="export-btn pdf" onClick={exportLeadsPDF}>
            Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rd-loading">Loading leads...</div>
      ) : (
        <div className="rd-table-wrapper">
          <table className="rd-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Received</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="rd-no-records">
                    No demo requests found
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <span className="rd-primary-text">{lead.fullName}</span>
                    </td>
                    <td>
                      <span className="rd-secondary-text">{lead.email}</span>
                    </td>
                    <td>{lead.companyName || "—"}</td>
                    <td>
                      <div className="rd-date-cell">
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <small>
                          {new Date(lead.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </td>
                    <td>{renderStatusBadge(lead.status)}</td>
                    <td>
                      <button
                        type="button"
                        className="rd-view-btn"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedLead && (
        <div
          className="rd-modal-backdrop"
          onClick={() => setSelectedLead(null)}
        >
          <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rd-modal-header">
              <div>
                <p className="rd-modal-label">Lead Details</p>
                <h3>{selectedLead.fullName}</h3>
              </div>

              <button
                type="button"
                className="rd-modal-close"
                onClick={() => setSelectedLead(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rd-modal-grid">
              <div className="rd-meta-card">
                <span>Email</span>
                <strong>{selectedLead.email}</strong>
              </div>
              <div className="rd-meta-card">
                <span>Company</span>
                <strong>{selectedLead.companyName || "—"}</strong>
              </div>
              <div className="rd-meta-card">
                <span>Service</span>
                <strong>{selectedLead.serviceInterested || "—"}</strong>
              </div>
              <div className="rd-meta-card">
                <span>Received</span>
                <strong>{new Date(selectedLead.createdAt).toLocaleString()}</strong>
              </div>
              <div className="rd-meta-card">
                <span>Status</span>
                <strong>{renderStatusBadge(selectedLead.status)}</strong>
              </div>
            </div>

            <div className="rd-message-panel">
              <p className="rd-message-label">Project Description</p>
              <div className="rd-message-body">
                {selectedLead.projectDescription || "No message provided."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

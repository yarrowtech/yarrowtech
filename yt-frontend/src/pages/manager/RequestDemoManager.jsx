import React, { useEffect, useState } from "react";
import "../../styles/RequestDemoAdmin.css";
import { Search, Eye, X } from "lucide-react";
import {
  getManagerDemoRequests,
  updateManagerLeadStatus,
} from "../../services/managerService";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in-progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

const STATUS_BADGES = [
  { value: "new", label: "New", color: "blue" },
  { value: "contacted", label: "Contacted", color: "yellow" },
  { value: "in-progress", label: "In Progress", color: "purple" },
  { value: "closed", label: "Closed", color: "green" },
];

export default function RequestDemoManager() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const list = await getManagerDemoRequests();
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
    let data = [...requests];

    if (statusFilter !== "all") {
      data = data.filter((lead) => lead.status === statusFilter);
    }

    if (search.trim()) {
      const value = search.toLowerCase();
      data = data.filter(
        (lead) =>
          lead.fullName?.toLowerCase().includes(value) ||
          lead.email?.toLowerCase().includes(value) ||
          lead.companyName?.toLowerCase().includes(value) ||
          lead.projectDescription?.toLowerCase().includes(value)
      );
    }

    setFiltered(data);
  }, [search, statusFilter, requests]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateManagerLeadStatus(leadId, newStatus);
      setRequests((prev) =>
        prev.map((lead) =>
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      setSelectedLead((prev) =>
        prev && prev._id === leadId ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error("Failed to update lead status:", err);
      alert("Failed to update lead status");
    }
  };

  const renderStatusBadge = (status) => {
    const current = STATUS_BADGES.find((item) => item.value === status);

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
          Manage incoming demo leads and update their progress
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

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
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
            </div>

            <div className="rd-message-panel">
              <p className="rd-message-label">Project Description</p>
              <div className="rd-message-body">
                {selectedLead.projectDescription || "No message provided."}
              </div>
            </div>

            <div className="rd-status-panel">
              <p className="rd-message-label">Status</p>
              <select
                className="rd-status-select"
                value={selectedLead.status}
                onChange={(e) =>
                  handleStatusChange(selectedLead._id, e.target.value)
                }
              >
                {STATUS_OPTIONS.filter((status) => status.value !== "all").map(
                  (status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

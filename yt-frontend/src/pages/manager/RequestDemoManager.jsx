import { useEffect, useState } from "react";
import "../../styles/RequestDemoAdmin.css";
import "../../styles/RequestDemoManager.css";
import { toast } from "react-hot-toast";
import {
  Search, Eye, X, Users, Star, TrendingUp, CheckCircle,
  Mail, Building2, Calendar, Tag, FileText,
} from "lucide-react";
import {
  getManagerDemoRequests,
  updateManagerLeadStatus,
} from "../../services/managerService";

const STATUS_OPTIONS = [
  { value: "new",         label: "New",         color: "blue"   },
  { value: "contacted",   label: "Contacted",   color: "yellow" },
  { value: "in-progress", label: "In Progress", color: "purple" },
  { value: "closed",      label: "Closed",      color: "green"  },
];

export default function RequestDemoManager() {
  const [requests,     setRequests]     = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [updating,     setUpdating]     = useState(false);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const list = await getManagerDemoRequests();
      setRequests(Array.isArray(list) ? list : []);
      setFiltered(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load demo requests:", err);
      setRequests([]);
      setFiltered([]);
      toast.error("Failed to load CRM leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let list = requests;
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      list = list.filter((r) => new Date(r.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      list = list.filter((r) => new Date(r.createdAt) <= to);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.companyName?.toLowerCase().includes(q) ||
          r.projectDescription?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, dateFrom, dateTo, requests]);

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdating(true);
    try {
      await updateManagerLeadStatus(leadId, newStatus);
      setRequests((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
      );
      setSelectedLead((prev) =>
        prev?._id === leadId ? { ...prev, status: newStatus } : prev
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getCount = (status) =>
    status === "all" ? requests.length : requests.filter((r) => r.status === status).length;

  const renderBadge = (status) => {
    const s = STATUS_OPTIONS.find((o) => o.value === status);
    return <span className={`rd-badge rd-badge--${s?.color || "gray"}`}>{s?.label || "Unknown"}</span>;
  };

  const stats = [
    { label: "Total Leads",  value: requests.length,         icon: Users,        color: "#60a5fa" },
    { label: "New",          value: getCount("new"),         icon: Star,         color: "#3b82f6" },
    { label: "In Progress",  value: getCount("in-progress"), icon: TrendingUp,   color: "#a855f7" },
    { label: "Closed",       value: getCount("closed"),      icon: CheckCircle,  color: "#22c55e" },
  ];

  return (
    <div className="rda-page">

      {/* ── Header ── */}
      <div className="rda-header">
        <div className="rda-header-icon">
          <Users size={24} />
        </div>
        <div>
          <h2>CRM — Demo Requests</h2>
          <p>Manage incoming demo leads and update their progress</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="rda-stats">
        {stats.map((s) => (
          <div className="rda-stat-card" key={s.label}>
            <div className="rda-stat-icon" style={{ color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="rda-stat-body">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="rda-toolbar">
        <div className="rda-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rda-filters">
          {/* Date range */}
          <div className="rda-date-range">
            <Calendar size={15} />
            <input
              type="date"
              className="rda-date-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
            />
            <span className="rda-date-sep">—</span>
            <input
              type="date"
              className="rda-date-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
            />
            {(dateFrom || dateTo) && (
              <button
                className="rda-date-clear"
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                title="Clear dates"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            className="rda-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="rda-loading">
          <div className="rda-spinner" />
          <span>Loading leads...</span>
        </div>
      ) : (
        <div className="rda-table-wrap">
          <table className="rda-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Service</th>
                <th>Received</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="rda-empty">
                    <FileText size={36} />
                    <p>No demo requests found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div className="rda-name-cell">
                        <div className="rda-avatar">
                          {lead.fullName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="rda-name">{lead.fullName}</span>
                      </div>
                    </td>
                    <td><span className="rda-email">{lead.email}</span></td>
                    <td>{lead.companyName || "—"}</td>
                    <td>{lead.serviceInterested || "—"}</td>
                    <td>
                      <div className="rda-date-cell">
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <small>{new Date(lead.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                      </div>
                    </td>
                    <td>
                      {/* Inline quick-status changer */}
                      <select
                        className={`rdm-status-select rdm-status--${STATUS_OPTIONS.find(o => o.value === lead.status)?.color || "gray"}`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="rda-view-btn" onClick={() => setSelectedLead(lead)}>
                        <Eye size={15} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedLead && (
        <div className="rda-modal-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="rda-modal" onClick={(e) => e.stopPropagation()}>

            <div className="rda-modal-head">
              <div className="rda-modal-avatar">
                {selectedLead.fullName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="rda-modal-title">
                <p className="rda-modal-label">Lead Details</p>
                <h3>{selectedLead.fullName}</h3>
                {renderBadge(selectedLead.status)}
              </div>
              <button className="rda-modal-close" onClick={() => setSelectedLead(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="rda-modal-grid">
              <div className="rda-info-card">
                <div className="rda-info-icon"><Mail size={15} /></div>
                <div>
                  <span>Email</span>
                  <strong>{selectedLead.email}</strong>
                </div>
              </div>
              <div className="rda-info-card">
                <div className="rda-info-icon"><Building2 size={15} /></div>
                <div>
                  <span>Company</span>
                  <strong>{selectedLead.companyName || "—"}</strong>
                </div>
              </div>
              <div className="rda-info-card">
                <div className="rda-info-icon"><Tag size={15} /></div>
                <div>
                  <span>Service Interested</span>
                  <strong>{selectedLead.serviceInterested || "—"}</strong>
                </div>
              </div>
              <div className="rda-info-card">
                <div className="rda-info-icon"><Calendar size={15} /></div>
                <div>
                  <span>Received</span>
                  <strong>{new Date(selectedLead.createdAt).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="rda-message-panel">
              <p className="rda-message-label"><FileText size={14} /> Project Description</p>
              <div className="rda-message-body">
                {selectedLead.projectDescription || "No description provided."}
              </div>
            </div>

            {/* ── Status update ── */}
            <div className="rdm-status-panel">
              <p className="rda-modal-label">Update Status</p>
              <div className="rdm-status-buttons">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    disabled={updating}
                    className={`rdm-status-btn rdm-status-btn--${o.color}${selectedLead.status === o.value ? " active" : ""}`}
                    onClick={() => handleStatusChange(selectedLead._id, o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

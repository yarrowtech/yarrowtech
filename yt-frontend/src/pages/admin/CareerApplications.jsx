import React, { useEffect, useMemo, useState } from "react";
import "../../styles/CareerApplications.css";
import { getCareerApplications, downloadCareerResume } from "../../services/adminService";
import {
  Search, Eye, Download, X, Briefcase, FileText, CalendarDays, Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function CareerApplications() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (id, filename) => {
    setDownloading(id);
    try {
      await downloadCareerResume(id, filename);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download resume. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await getCareerApplications();
      const list = Array.isArray(data?.careers) ? data.careers : [];
      setApplications(list);
    } catch (err) {
      console.error("Error loading career applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return applications;
    const value = searchTerm.toLowerCase();
    return applications.filter(
      (item) =>
        item.name?.toLowerCase().includes(value) ||
        item.email?.toLowerCase().includes(value) ||
        item.message?.toLowerCase().includes(value) ||
        item.resumeName?.toLowerCase().includes(value)
    );
  }, [searchTerm, applications]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const today = applications.filter((a) => isSameDay(new Date(a.createdAt), now)).length;
    const thisWeek = applications.filter((a) => new Date(a.createdAt) >= weekAgo).length;

    return [
      { label: "Total Applications", value: applications.length, icon: Briefcase,    color: "#60a5fa" },
      { label: "Today",              value: today,               icon: CalendarDays, color: "#facc15" },
      { label: "This Week",          value: thisWeek,             icon: Users,        color: "#34d399" },
    ];
  }, [applications]);

  return (
    <div className="cra-page">

      {/* ── Header ── */}
      <div className="cra-header">
        <div className="cra-header-icon">
          <Briefcase size={24} />
        </div>
        <div>
          <h2>Career Applications</h2>
          <p>View all submitted career forms and resumes</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="cra-stats">
        {stats.map((s) => (
          <div className="cra-stat-card" key={s.label}>
            <div className="cra-stat-icon" style={{ color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="cra-stat-body">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="cra-toolbar">
        <div className="cra-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, message or resume..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="cra-count-chip">Total: {filtered.length}</div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="cra-skeleton-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="cra-skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="cra-table-wrap">
          <table className="cra-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Received</th>
                <th>Resume</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="cra-empty">
                    <FileText size={36} />
                    <p>No career applications found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="cra-name-cell">
                        <div className="cra-avatar">
                          {item.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="cra-name">{item.name}</span>
                      </div>
                    </td>
                    <td><span className="cra-email">{item.email}</span></td>
                    <td>
                      <div className="cra-date-cell">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <small>
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cra-download-btn"
                        disabled={downloading === item._id}
                        onClick={() => handleDownload(item._id, item.resumeName)}
                      >
                        <Download size={15} />
                        <span>{downloading === item._id ? "Downloading..." : (item.resumeName || "Resume")}</span>
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cra-view-btn"
                        onClick={() => setSelectedApplication(item)}
                      >
                        <Eye size={15} /> View Details
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
      {selectedApplication && (
        <div className="cra-modal-backdrop" onClick={() => setSelectedApplication(null)}>
          <div className="cra-modal" onClick={(e) => e.stopPropagation()}>

            <div className="cra-modal-head">
              <div className="cra-modal-avatar">
                {selectedApplication.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="cra-modal-title">
                <p className="cra-modal-label">Application Details</p>
                <h3>{selectedApplication.name}</h3>
              </div>
              <button
                type="button"
                className="cra-modal-close"
                onClick={() => setSelectedApplication(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cra-modal-grid">
              <div className="cra-info-card">
                <div className="cra-info-icon"><Users size={15} /></div>
                <div>
                  <span>Email</span>
                  <strong>{selectedApplication.email}</strong>
                </div>
              </div>
              <div className="cra-info-card">
                <div className="cra-info-icon"><CalendarDays size={15} /></div>
                <div>
                  <span>Received</span>
                  <strong>{new Date(selectedApplication.createdAt).toLocaleString()}</strong>
                </div>
              </div>
              <div className="cra-info-card cra-info-card--full">
                <div className="cra-info-icon"><FileText size={15} /></div>
                <div>
                  <span>Resume</span>
                  <button
                    type="button"
                    className="cra-resume-link"
                    disabled={downloading === selectedApplication._id}
                    onClick={() => handleDownload(selectedApplication._id, selectedApplication.resumeName)}
                  >
                    <Download size={15} />
                    <span>
                      {downloading === selectedApplication._id
                        ? "Downloading..."
                        : (selectedApplication.resumeName || "Download Resume")}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="cra-message-panel">
              <p className="cra-message-label"><FileText size={14} /> Message</p>
              <div className="cra-message-body">
                {selectedApplication.message || "No message provided."}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

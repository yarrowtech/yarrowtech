import { useEffect, useState } from "react";
import "../../styles/CareerApplications.css";
import { getCareerApplications, downloadCareerResume } from "../../services/adminService";
import { Search, Eye, Download, X } from "lucide-react";

export default function CareerApplications() {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
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
      setFiltered(list);
    } catch (err) {
      console.error("Error loading career applications:", err);
      setApplications([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(applications);
      return;
    }

    const value = searchTerm.toLowerCase();
    setFiltered(
      applications.filter(
        (item) =>
          item.name?.toLowerCase().includes(value) ||
          item.email?.toLowerCase().includes(value) ||
          item.message?.toLowerCase().includes(value) ||
          item.resumeName?.toLowerCase().includes(value)
      )
    );
  }, [searchTerm, applications]);

  return (
    <div className="career-applications-container">
      <div className="admin-header">
        <h2>Career Applications</h2>
        <p className="subtitle">
          View all submitted career forms and resumes
        </p>
      </div>

      <div className="career-toolbar">
        <div className="career-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, message or resume..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="career-count-chip">Total: {filtered.length}</div>
      </div>

      {loading ? (
        <div className="career-loading">Loading applications...</div>
      ) : (
        <div className="career-table-wrapper">
          <table className="career-table">
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
                  <td colSpan="5" className="career-no-records">
                    No career applications found
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span className="career-primary-text">{item.name}</span>
                    </td>
                    <td>
                      <span className="career-secondary-text">{item.email}</span>
                    </td>
                    <td>
                      <div className="career-date-cell">
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
                        className="career-download-btn"
                        disabled={downloading === item._id}
                        onClick={() => handleDownload(item._id, item.resumeName)}
                      >
                        <Download size={16} />
                        {downloading === item._id ? "Downloading..." : (item.resumeName || "Resume")}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="career-view-btn"
                        onClick={() => setSelectedApplication(item)}
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

      {selectedApplication && (
        <div
          className="career-modal-backdrop"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="career-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="career-modal-header">
              <div>
                <p className="career-modal-label">Application Details</p>
                <h3>{selectedApplication.name}</h3>
              </div>

              <button
                type="button"
                className="career-modal-close"
                onClick={() => setSelectedApplication(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="career-modal-grid">
              <div className="career-meta-card">
                <span>Email</span>
                <strong>{selectedApplication.email}</strong>
              </div>
              <div className="career-meta-card">
                <span>Received</span>
                <strong>
                  {new Date(selectedApplication.createdAt).toLocaleString()}
                </strong>
              </div>
              <div className="career-meta-card career-meta-card-full">
                <span>Resume</span>
                <button
                  type="button"
                  className="career-resume-link"
                  disabled={downloading === selectedApplication._id}
                  onClick={() => handleDownload(selectedApplication._id, selectedApplication.resumeName)}
                >
                  <Download size={16} />
                  {downloading === selectedApplication._id ? "Downloading..." : (selectedApplication.resumeName || "Download Resume")}
                </button>
              </div>
            </div>

            <div className="career-message-panel">
              <p className="career-message-label">Message</p>
              <div className="career-message-body">
                {selectedApplication.message || "No message provided."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

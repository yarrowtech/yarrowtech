import React, { useEffect, useState } from "react";
import "../../styles/ClientMyProject.css";
import API from "../../services/axiosInstance";
import { toast } from "react-hot-toast";
import ProjectChatModal from "../../components/ProjectChatModal";

export default function ClientMyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatProject, setActiveChatProject] = useState(null);
  const [infoProject, setInfoProject] = useState(null);
  const [detailsProject, setDetailsProject] = useState(null);

  /* ================= LOAD PROJECTS ================= */
  const loadProjects = async () => {
    try {
      setLoading(true);

      // ✅ REAL BACKEND CALL
      const res = await API.get("/erp/client/projects");

      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* ================= FORMAT HELPERS ================= */
  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

  /* ================= UI STATES ================= */
  if (loading) {
    return <p className="muted">Loading projects...</p>;
  }

  if (!projects.length) {
    return (
      <div className="client-projects-container">
        <div className="client-header">
          <h2>My Projects</h2>
          <p className="subtitle">No projects assigned yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-projects-container">
      {/* HEADER */}
      <div className="client-header">
        <h2>My Projects</h2>
        <p className="subtitle">Track all your project details here</p>
      </div>

      {/* TABLE */}
      <div className="client-projects-table-wrapper">
        <table className="client-projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Chat</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p, index) => (
              <tr key={p._id || index}>
                <td>{index + 1}</td>
                <td>{p.name}</td>

                {/* PROGRESS */}
                <td>
                  <div className="client-progress-bar">
                    <div
                      className="client-progress-fill"
                      style={{ width: `${p.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="client-progress-text">
                    {p.progress || 0}%
                  </span>
                </td>

                {/* STATUS */}
                <td>
                  <span
                    className={`client-status client-status-${p.status || "pending"}`}
                  >
                    {p.status || "pending"}
                  </span>
                </td>

                <td>
                  <button
                    className="client-chat-btn"
                    onClick={() => setActiveChatProject(p)}
                  >
                    Chat
                  </button>
                </td>

                {/* ACTIONS */}
                <td>
                  <div className="client-actions-cell">
                    <button
                      className="client-info-btn"
                      onClick={() => setInfoProject(p)}
                    >
                      Project Info
                    </button>
                    <button
                      className="client-details-btn"
                      onClick={() => setDetailsProject(p)}
                    >
                      Project Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PROJECT INFO MODAL — all information about the project */}
      {infoProject && (
        <div
          className="client-info-modal-backdrop"
          onClick={() => setInfoProject(null)}
        >
          <div
            className="client-info-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="client-info-modal-head">
              <h3>Project Info</h3>
              <button
                className="client-info-close-btn"
                onClick={() => setInfoProject(null)}
              >
                Close
              </button>
            </div>

            <div className="client-info-grid">
              <div className="client-info-item">
                <span>Project ID</span>
                <p>{infoProject.projectId || infoProject._id || "—"}</p>
              </div>
              <div className="client-info-item">
                <span>Project Name</span>
                <p>{infoProject.name || "—"}</p>
              </div>
              <div className="client-info-item">
                <span>Status</span>
                <p>{infoProject.status || "pending"}</p>
              </div>
              <div className="client-info-item">
                <span>Progress</span>
                <p>{infoProject.progress || 0}%</p>
              </div>
              <div className="client-info-item">
                <span>Start Date</span>
                <p>{formatDate(infoProject.createdAt)}</p>
              </div>
              <div className="client-info-item">
                <span>Expected Delivery</span>
                <p>{formatDate(infoProject.expectedDelivery)}</p>
              </div>
              <div className="client-info-item">
                <span>Total Payment</span>
                <p>
                  {infoProject.totalPayment !== undefined &&
                  infoProject.totalPayment !== null
                    ? infoProject.totalPayment
                    : "—"}
                </p>
              </div>
              <div className="client-info-item">
                <span>Manager</span>
                <p>{infoProject.managerEmail || "—"}</p>
              </div>
              <div className="client-info-item">
                <span>Tech Lead</span>
                <p>{infoProject.techLeadEmail || "—"}</p>
              </div>
              <div className="client-info-item">
                <span>Client</span>
                <p>{infoProject.clientName || infoProject.clientEmail || "—"}</p>
              </div>
              <div className="client-info-item client-info-item-wide">
                <span>Project Details</span>
                <p>{infoProject.projectDetails || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT DETAILS — placeholder blank page for now */}
      {detailsProject && (
        <div className="client-details-page">
          <button
            className="client-details-close-btn"
            onClick={() => setDetailsProject(null)}
          >
            Close
          </button>
        </div>
      )}

      {activeChatProject && (
        <ProjectChatModal
          project={activeChatProject}
          currentRole="client"
          recipientEmail={activeChatProject.managerEmail || ""}
          recipientLabel="Manager"
          onClose={() => setActiveChatProject(null)}
        />
      )}
    </div>
  );
}

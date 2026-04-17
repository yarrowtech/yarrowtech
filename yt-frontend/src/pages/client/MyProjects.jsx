import React, { useEffect, useState } from "react";
import "../../styles/ClientMyProject.css";
import API from "../../services/axiosInstance";
import { toast } from "react-hot-toast";
import ProjectChatModal from "../../components/ProjectChatModal";

export default function ClientMyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatProject, setActiveChatProject] = useState(null);

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
              <th>Manager</th>
              <th>Start Date</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Chat</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p, index) => (
              <tr key={p._id || index}>
                <td>{index + 1}</td>
                <td>{p.name}</td>
                <td>{p.managerEmail || "—"}</td>
                <td>
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : "—"}
                </td>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import API from "../../services/axiosInstance";
import "../../styles/ManagerProjects.css";

export default function ManagerProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/erp/projects/manager");
      setProjects(Array.isArray(res.data?.projects) ? res.data.projects : []);
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

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((project) =>
      [
        project.projectId,
        project.name,
        project.clientName,
        project.clientEmail,
        project.techLeadEmail,
        project.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [projects, search]);

  if (loading) {
    return <p className="muted">Loading projects...</p>;
  }

  return (
    <div className="manager-projects-page">
      <h2 className="page-title">Manage Client Projects</h2>
      <p className="muted manager-projects-subtitle">
        Click any project to open a full details page.
      </p>

      <div className="manager-project-search">
        <input
          type="text"
          placeholder="Search by project, client, email, tech lead, or status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {projects.length === 0 && (
        <p className="muted">
          No client projects found. Create a client to start managing projects.
        </p>
      )}

      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <p className="muted">No projects matched your search.</p>
      )}

      {filteredProjects.map((project) => (
        <div key={project._id} className="project-card">
          <div className="project-header">
            <div>
              <h3>{project.name}</h3>
              <p className="muted">
                {project.clientEmail || "Client email not available"}
              </p>
              <p className="project-id-text">Project ID: {project.projectId}</p>
            </div>

            <div className="summary">
              <span className={`status ${project.status || "pending"}`}>
                {project.status || "pending"}
              </span>
              <span>{project.progress || 0}%</span>
              <button
                className="view-project-btn"
                onClick={() => navigate(`/manager/projects/${project._id}`)}
              >
                Open Project
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

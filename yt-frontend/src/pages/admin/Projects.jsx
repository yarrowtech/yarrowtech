import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminProject.css";
import {
  FolderKanban, Search, Check, X, Pencil,
  Clock, Activity, CheckCircle2, Layers,
} from "lucide-react";
import { getAllProjects, updateProject } from "../../services/adminService";

const STATUS_OPTIONS = ["pending", "ongoing", "completed"];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inline editing
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await getAllProjects();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.projects)
        ? res.projects
        : [];
      setProjects(list);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = projects;

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((p) => (p.name || "").toLowerCase().includes(s));
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => (p.status || "").toLowerCase() === statusFilter);
    }

    return result;
  }, [search, statusFilter, projects]);

  const stats = useMemo(() => {
    const countByStatus = (status) =>
      projects.filter((p) => (p.status || "").toLowerCase() === status).length;

    return [
      { label: "Total Projects", value: projects.length,          icon: Layers,       color: "#60a5fa" },
      { label: "Pending",        value: countByStatus("pending"),   icon: Clock,        color: "#facc15" },
      { label: "Ongoing",        value: countByStatus("ongoing"),   icon: Activity,     color: "#38bdf8" },
      { label: "Completed",      value: countByStatus("completed"), icon: CheckCircle2, color: "#34d399" },
    ];
  }, [projects]);

  const startEdit = (project) => {
    setEditingId(project._id);
    setEditData({
      name: project.name || "",
      status: project.status || "pending",
      progress: project.progress ?? 0,
      expectedDelivery: project.expectedDelivery ? project.expectedDelivery.slice(0, 10) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      await updateProject(id, { ...editData, progress: Number(editData.progress) || 0 });
      await loadProjects();
      cancelEdit();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ap-page">

      {/* ── Header ── */}
      <div className="ap-header">
        <div className="ap-header-icon">
          <FolderKanban size={24} />
        </div>
        <div>
          <h2>Projects Overview</h2>
          <p>Monitor all client projects and progress</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ap-stats">
        {stats.map((s) => (
          <div className="ap-stat-card" key={s.label}>
            <div className="ap-stat-icon" style={{ color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="ap-stat-body">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="ap-toolbar">
        <div className="ap-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search project by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="ap-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="ap-loading">
          <div className="ap-spinner" />
          <span>Loading projects...</span>
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Delivery</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="ap-empty">
                    <FolderKanban size={36} />
                    <p>No projects found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((proj) => {
                  const isEditing = editingId === proj._id;
                  return (
                    <tr key={proj._id}>
                      <td><span className="ap-project-id">{proj.projectId || "—"}</span></td>

                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          />
                        ) : (
                          <span className="ap-project-name">{proj.name || "—"}</span>
                        )}
                      </td>

                      <td>
                        <span className="ap-client-name">
                          {proj.client?.name || proj.clientName || "—"}
                        </span>
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`ap-badge ap-badge--${(proj.status || "pending").toLowerCase()}`}>
                            {proj.status || "pending"}
                          </span>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editData.progress}
                            onChange={(e) => setEditData({ ...editData, progress: e.target.value })}
                          />
                        ) : (
                          <div className="ap-progress-cell">
                            <div className="ap-progress-track">
                              <div className="ap-progress-fill" style={{ width: `${proj.progress || 0}%` }} />
                            </div>
                            <span className="ap-progress-val">{proj.progress || 0}%</span>
                          </div>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editData.expectedDelivery}
                            onChange={(e) => setEditData({ ...editData, expectedDelivery: e.target.value })}
                          />
                        ) : (
                          formatDate(proj.expectedDelivery)
                        )}
                      </td>

                      <td>
                        <div className="ap-actions">
                          {isEditing ? (
                            <>
                              <button
                                className="ap-icon-btn ap-icon-btn--save"
                                disabled={saving}
                                onClick={() => saveEdit(proj._id)}
                                title="Save"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                className="ap-icon-btn ap-icon-btn--cancel"
                                onClick={cancelEdit}
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="ap-icon-btn"
                              onClick={() => startEdit(proj)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import "../../styles/TechprojectUpdates.css";
import API from "../../services/axiosInstance";
import { toast } from "react-hot-toast";

export default function ProjectUpdates() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    status: "",
    progress: "",
    note: "",
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const res = await API.get("/erp/techlead/assigned");
      setProjects(res.data?.projects || []);
    } catch {
      toast.error("Failed to load project updates");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setForm({
      status: project.status,
      progress: project.progress || 0,
      note: "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ status: "", progress: "", note: "" });
  };

  const saveUpdate = async (projectId) => {
    try {
      await API.put(`/erp/techlead/project/${projectId}`, {
        status: form.status,
        progress: Number(form.progress),
        note: form.note,
      });

      toast.success("Project updated successfully");
      cancelEdit();
      loadUpdates();
    } catch {
      toast.error("Failed to update project");
    }
  };

  return (
    <div className="project-updates">
      <div className="page-title">Project Updates</div>

      {loading ? (
        <p className="muted">Loading updates...</p>
      ) : projects.length === 0 ? (
        <p className="muted">No assigned projects</p>
      ) : (
        <div className="update-list">
          {projects.map((p) => (
            <div className="update-card" key={p._id}>
              <div className="card-header">
                <h3>{p.name}</h3>
                <span className={`status-badge ${p.status}`}>
                  {p.status}
                </span>
              </div>

              {editingId === p._id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.progress}
                      onChange={(e) =>
                        setForm({ ...form, progress: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Update Note</label>
                    <textarea
                      placeholder="Optional update note..."
                      value={form.note}
                      onChange={(e) =>
                        setForm({ ...form, note: e.target.value })
                      }
                    />
                  </div>

                  <div className="action-row">
                    <button
                      className="primary-btn"
                      onClick={() => saveUpdate(p._id)}
                    >
                      Save Update
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="progress-row">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${p.progress || 0}%` }}
                      />
                    </div>
                    <span>{p.progress || 0}%</span>
                  </div>

                  <div className="muted">
                    Last Updated:{" "}
                    {new Date(
                      p.updatedAt || p.createdAt
                    ).toLocaleDateString()}
                  </div>

                  <button
                    className="edit-btn"
                    onClick={() => startEdit(p)}
                  >
                    Update Project
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

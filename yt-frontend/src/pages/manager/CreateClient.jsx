import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

import "../../styles/ManagerCreateClient.css";
import {
  createClientAndProject,
  deleteClient,
  getDeletedClientHistory,
  getManagerProjects,
  getTechLeads,
  resetClientPassword,
} from "../../services/managerService";

export default function CreateClient() {
  const [projects, setProjects] = useState([]);
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [techLeads, setTechLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("clients");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetClientId, setResetClientId] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetForm, setResetForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    clientName: "",
    clientEmail: "",
    techLeadEmail: "",
    expectedDelivery: "",
  });

  useEffect(() => {
    loadProjects();
    loadDeletedHistory();
    loadTechLeads();
  }, []);

  const loadProjects = async () => {
    try {
      const list = await getManagerProjects();
      setProjects(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load projects");
    }
  };

  const loadTechLeads = async () => {
    try {
      const list = await getTechLeads();
      setTechLeads(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load tech leads");
    }
  };

  const loadDeletedHistory = async () => {
    try {
      const list = await getDeletedClientHistory();
      setDeletedHistory(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load deleted client history");
    }
  };

  const clientList = useMemo(() => {
    const clientMap = new Map();

    projects.forEach((project) => {
      const clientId = project.client?._id || project.clientEmail;
      if (!clientId) return;

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          clientId: project.client?._id || "",
          clientName: project.clientName || project.client?.name || "Client",
          clientEmail: project.clientEmail || project.client?.email || "",
          clientStatus: project.client?.status || "active",
          projects: [],
        });
      }

      clientMap.get(clientId).projects.push({
        _id: project._id,
        name: project.name,
        projectId: project.projectId,
      });
    });

    return Array.from(clientMap.values());
  }, [projects]);

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();

    return clientList.filter((client) => {
      const matchSearch =
        client.clientName?.toLowerCase().includes(q) ||
        client.clientEmail?.toLowerCase().includes(q) ||
        client.projects.some(
          (project) =>
            project.name?.toLowerCase().includes(q) ||
            project.projectId?.toLowerCase().includes(q)
        );

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && client.clientStatus !== "inactive") ||
        (statusFilter === "inactive" && client.clientStatus === "inactive");

      return matchSearch && matchStatus;
    });
  }, [clientList, search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.techLeadEmail) {
      toast.error("Please select Tech Lead");
      return;
    }

    setLoading(true);
    try {
      await createClientAndProject(formData);
      toast.success("Client & Project created");
      setFormData({
        projectId: "",
        name: "",
        clientName: "",
        clientEmail: "",
        techLeadEmail: "",
        expectedDelivery: "",
      });
      setShowCreateModal(false);
      loadProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!clientId) return;

    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await deleteClient(clientId);
      toast.success("Client deleted");
      loadProjects();
      loadDeletedHistory();
    } catch {
      toast.error("Delete failed");
    }
  };

  const openResetPasswordModal = (clientId) => {
    if (!clientId) return;

    setResetClientId(clientId);
    setResetForm({
      newPassword: "",
      confirmPassword: "",
    });
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowResetModal(true);
  };

  const closeResetPasswordModal = () => {
    setShowResetModal(false);
    setResetClientId("");
    setResetForm({
      newPassword: "",
      confirmPassword: "",
    });
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetClientId) return;

    if (!resetForm.newPassword || !resetForm.confirmPassword) {
      toast.error("Both password fields are required");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResetLoading(true);
    try {
      await resetClientPassword(resetClientId, resetForm.newPassword);
      toast.success("Password reset successfully");
      closeResetPasswordModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="manager-create-page">
      <div className="manager-create-topbar">
        <div>
          <h2 className="manager-create-title">Create Clients</h2>
          <p className="manager-create-subtitle">
            Manage your client list and open the form only when you need it.
          </p>
        </div>

        <button
          className="open-create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          Create Client
        </button>
      </div>

      <div className="admin-filters">
        <input
          className="search-input"
          placeholder="Search client / email / project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="manager-client-tabs">
        <button
          className={`manager-client-tab ${activeTab === "clients" ? "active" : ""}`}
          onClick={() => setActiveTab("clients")}
        >
          Client List
        </button>
        <button
          className={`manager-client-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {activeTab === "clients" && (
        <div className="client-list">
          {filteredClients.map((client) => (
            <div key={client.id} className="client-list-item">
              <div className="client-primary">
                <h4>{client.clientName}</h4>
                <p>{client.clientEmail}</p>
              </div>

              <div className="client-secondary">
                <span className={`status-badge ${client.clientStatus || "active"}`}>
                  {client.clientStatus || "active"}
                </span>
              </div>

              <div className="client-meta">
                <div>
                  <strong>Total Projects:</strong> {client.projects.length}
                </div>
                <div>
                  <strong>Latest Project:</strong>{" "}
                  {client.projects[0]?.name || "-"}
                </div>
              </div>

              {client.projects.length > 0 && (
                <div className="client-project-tags">
                  {client.projects.slice(0, 3).map((project) => (
                    <span key={project._id} className="client-project-tag">
                      {project.projectId}
                    </span>
                  ))}
                  {client.projects.length > 3 && (
                    <span className="client-project-tag">
                      +{client.projects.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="card-actions">
                <button
                  className="reset-btn"
                  onClick={() => openResetPasswordModal(client.clientId)}
                >
                  Reset Password
                </button>

                <button
                  className="toggle-btn"
                  onClick={() => handleDeleteClient(client.clientId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="client-list">
          {deletedHistory.length === 0 && (
            <p className="muted">No deleted client history found yet.</p>
          )}

          {deletedHistory.map((item) => (
            <div key={item._id} className="client-list-item history-list-item">
              <div className="client-primary">
                <h4>{item.name}</h4>
                <p>{item.email}</p>
              </div>

              <div className="client-secondary">
                <span className="status-badge inactive">deleted</span>
              </div>

              <div className="client-meta">
                <div>
                  <strong>Deleted On:</strong>{" "}
                  {item.deletedAt
                    ? new Date(item.deletedAt).toLocaleDateString()
                    : "-"}
                </div>
                <div>
                  <strong>Total Projects:</strong> {item.projects?.length || 0}
                </div>
              </div>

              <div className="client-meta">
                <div>
                  <strong>Phone:</strong> {item.phone || "-"}
                </div>
                <div>
                  <strong>Company:</strong> {item.company || "-"}
                </div>
              </div>

              <div className="client-project-tags">
                {(item.projects || []).slice(0, 3).map((project, index) => (
                  <span key={`${item._id}-${index}`} className="client-project-tag">
                    {project.projectId || project.name || "Project"}
                  </span>
                ))}
                {(item.projects || []).length > 3 && (
                  <span className="client-project-tag">
                    +{item.projects.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div
          className="create-modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="form-card create-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-header">
              <div>
                <h3>Create Client</h3>
                <p>Add a client and assign the project details in one step.</p>
              </div>

              <button
                type="button"
                className="create-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  placeholder="Project ID"
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Project Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Client Name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Client Email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  required
                />

                <select
                  value={formData.techLeadEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, techLeadEmail: e.target.value })
                  }
                  required
                >
                  <option value="">Select Tech Lead</option>
                  {techLeads.map((t) => (
                    <option key={t.email} value={t.email}>
                      {t.name || "Tech Lead"} ({t.email})
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedDelivery: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button className="submit-btn" disabled={loading}>
                {loading ? "Creating..." : "Create Client"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showResetModal && (
        <div
          className="reset-modal-overlay"
          onClick={closeResetPasswordModal}
        >
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Client Password</h3>
            <p>Set a new password for this client account.</p>

            <form className="reset-modal-form" onSubmit={handleResetPassword}>
              <div className="reset-password-field">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={resetForm.newPassword}
                  onChange={(e) =>
                    setResetForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="reset-password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={resetForm.confirmPassword}
                  onChange={(e) =>
                    setResetForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="reset-modal-actions">
                <button
                  type="button"
                  className="reset-cancel-btn"
                  onClick={closeResetPasswordModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="reset-save-btn"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

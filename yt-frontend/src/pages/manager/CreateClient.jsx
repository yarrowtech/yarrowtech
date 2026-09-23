import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, User, Briefcase, X } from "lucide-react";
import { toast } from "react-hot-toast";

import ConfirmDialog from "../../components/ConfirmDialog";
import "../../styles/ManagerCreateClient.css";
import {
  createClientAndProject,
  deleteClient,
  getDeletedClientHistory,
  getManagerProjects,
  getTechLeads,
  resetClientPassword,
} from "../../services/managerService";

const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function CreateClient() {
  const navigate = useNavigate();
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const emptyFormData = {
    name: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    clientAddress: {
      building: "",
      street: "",
      landmark: "",
      city: "",
      state: "",
      pinCode: "",
    },
    techLeadEmail: "",
    expectedDelivery: getTodayDate(),
    totalPayment: "",
    projectDetails: "",
  };
  const [formData, setFormData] = useState(emptyFormData);

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
      const address = formData.clientAddress;
      await createClientAndProject({
        ...formData,
        clientAddress: [
          address.building,
          address.street,
          address.landmark,
          address.city,
          address.state,
          address.pinCode,
        ].map((part) => part.trim()).filter(Boolean).join(", "),
      });
      toast.success("Client & Project created");
      setFormData(emptyFormData);
      setShowCreateModal(false);
      loadProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteClient(deleteTarget.clientId);
      toast.success("Client deleted");
      loadProjects();
      loadDeletedHistory();
      setDeleteTarget(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
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
          onClick={() => {
            setFormData((current) => ({
              ...current,
              expectedDelivery: current.expectedDelivery || getTodayDate(),
            }));
            setShowCreateModal(true);
          }}
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
                  type="button"
                  className="client-details-btn"
                  onClick={() => navigate(`/manager/projects/${client.projects[0]._id}`)}
                  disabled={!client.projects[0]?._id}
                >
                  Details
                </button>
                <button
                  className="reset-btn"
                  onClick={() => openResetPasswordModal(client.clientId)}
                >
                  Reset Password
                </button>

                <button
                  className="toggle-btn"
                  onClick={() =>
                    setDeleteTarget({ clientId: client.clientId, clientName: client.clientName })
                  }
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
                aria-label="Close create client form"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="form-section-head">
                  <User size={16} />
                  <h4>Client Details</h4>
                </div>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Client Name</span>
                    <input
                      placeholder="e.g. Rohit Verma"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Client Email</span>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={formData.clientEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, clientEmail: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Phone Number</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      pattern="[0-9]{10}"
                      minLength={10}
                      maxLength={10}
                      title="Enter a 10-digit phone number"
                      placeholder="10-digit phone number"
                      value={formData.clientPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientPhone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                        })
                      }
                    />
                  </label>

                  <label className="form-field">
                    <span>Company</span>
                    <input
                      placeholder="e.g. ABC Foods Pvt Ltd"
                      value={formData.clientCompany}
                      onChange={(e) =>
                        setFormData({ ...formData, clientCompany: e.target.value })
                      }
                    />
                  </label>

                  <fieldset className="client-address-fields form-field-wide">
                    <legend>Address</legend>
                    <div className="form-grid">
                      {[
                        { key: "building", label: "House / Flat / Building", placeholder: "e.g. Flat 12, Sunrise Apartments", autoComplete: "address-line1" },
                        { key: "street", label: "Street / Area", placeholder: "e.g. MG Road, Indiranagar", autoComplete: "address-line2" },
                        { key: "landmark", label: "Landmark (optional)", placeholder: "e.g. Near City Park", autoComplete: "address-line3" },
                        { key: "city", label: "City / Town", placeholder: "e.g. Bengaluru", autoComplete: "address-level2" },
                        { key: "state", label: "State / Union Territory", placeholder: "e.g. Karnataka", autoComplete: "address-level1" },
                      ].map((field) => (
                        <label className="form-field" key={field.key}>
                          <span>{field.label}</span>
                          <input
                            autoComplete={field.autoComplete}
                            placeholder={field.placeholder}
                            value={formData.clientAddress[field.key]}
                            onChange={(e) => setFormData((current) => ({
                              ...current,
                              clientAddress: { ...current.clientAddress, [field.key]: e.target.value },
                            }))}
                          />
                        </label>
                      ))}
                      <label className="form-field">
                        <span>PIN Code</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="e.g. 560001"
                          pattern="[1-9][0-9]{5}"
                          minLength={6}
                          maxLength={6}
                          title="Enter a 6-digit PIN code starting with 1?9"
                          value={formData.clientAddress.pinCode}
                          onChange={(e) => setFormData((current) => ({
                            ...current,
                            clientAddress: {
                              ...current.clientAddress,
                              pinCode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                            },
                          }))}
                        />
                      </label>
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-head">
                  <Briefcase size={16} />
                  <h4>Project Details</h4>
                </div>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Project ID</span>
                    <input
                      value="Assigned automatically on creation"
                      readOnly
                    />
                  </label>

                  <label className="form-field">
                    <span>Project Name</span>
                    <input
                      placeholder="e.g. Restaurant Landing Page"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Tech Lead</span>
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
                  </label>

                  <label className="form-field">
                    <span>Expected Delivery</span>
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
                  </label>

                  <label className="form-field">
                    <span>Budget (₹)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional — total project payment"
                      value={formData.totalPayment}
                      onChange={(e) =>
                        setFormData({ ...formData, totalPayment: e.target.value })
                      }
                    />
                  </label>

                  <label className="form-field form-field-wide">
                    <span>Project Notes</span>
                    <textarea
                      rows="3"
                      placeholder="Scope, requirements, or anything the tech lead should know"
                      value={formData.projectDetails}
                      onChange={(e) =>
                        setFormData({ ...formData, projectDetails: e.target.value })
                      }
                    />
                  </label>
                </div>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this client?"
        message={
          deleteTarget?.clientName
            ? `${deleteTarget.clientName} and their project history will be moved to the deleted-client history. This can't be undone.`
            : "This client and their project history will be moved to the deleted-client history. This can't be undone."
        }
        confirmLabel="Delete Client"
        danger
        loading={deleting}
        onConfirm={confirmDeleteClient}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

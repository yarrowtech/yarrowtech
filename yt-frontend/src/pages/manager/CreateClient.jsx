import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import {
  Eye, EyeOff, User, Briefcase, X,
  Plus, Search, Users, UserCheck, FolderOpen, History, KeyRound, Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import ConfirmDialog from "../../components/ConfirmDialog";
import "../../styles/ManagerCreateClient.css";
import "../../styles/ManagerClientUsers.css";
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

export default function CreateClient({ embedded = false }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [techLeads, setTechLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("clients");
  const [showCreateModal, setShowCreateModal] = useState(false);
  // When set, the modal adds a project to this existing client instead of creating one.
  const [addProjectClient, setAddProjectClient] = useState(null);
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
      if (addProjectClient) {
        const res = await createClientAndProject({
          clientId: addProjectClient.clientId,
          name: formData.name,
          techLeadEmail: formData.techLeadEmail,
          expectedDelivery: formData.expectedDelivery,
          totalPayment: formData.totalPayment,
          projectDetails: formData.projectDetails,
        });
        toast.success(res?.message || "Project added");
        closeCreateModal();
        loadProjects();
        return;
      }

      const address = formData.clientAddress;
      const res = await createClientAndProject({
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
      toast.success(res?.message || "Client & Project created");
      closeCreateModal();
      loadProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (client = null) => {
    setAddProjectClient(client);
    setFormData({ ...emptyFormData, expectedDelivery: getTodayDate() });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setAddProjectClient(null);
    setFormData(emptyFormData);
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
    <div className={`manager-create-page ${embedded ? "manager-create-page--embedded" : ""}`}>
      <div className="cu-head">
        <div>
          <h2>{embedded ? "Client Users" : "Create Clients"}</h2>
          <p>
            {embedded
              ? "Create clients, manage their projects and reset passwords."
              : "Manage your client list and open the form only when you need it."}
          </p>
        </div>

        <button type="button" className="cu-create-btn" onClick={() => openCreateModal()}>
          <Plus size={16} /> Create Client
        </button>
      </div>

      <div className="cu-stats">
        <div className="cu-stat">
          <span className="cu-stat-icon cu-stat-icon--blue"><Users size={18} /></span>
          <div>
            <strong>{clientList.length}</strong>
            <span>Total clients</span>
          </div>
        </div>
        <div className="cu-stat">
          <span className="cu-stat-icon cu-stat-icon--green"><UserCheck size={18} /></span>
          <div>
            <strong>{clientList.filter((c) => c.clientStatus !== "inactive").length}</strong>
            <span>Active clients</span>
          </div>
        </div>
        <div className="cu-stat">
          <span className="cu-stat-icon cu-stat-icon--orange"><FolderOpen size={18} /></span>
          <div>
            <strong>{projects.length}</strong>
            <span>Total projects</span>
          </div>
        </div>
      </div>

      <div className="cu-toolbar">
        <div className="cu-search">
          <Search size={16} />
          <input
            placeholder="Search by client, email or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="cu-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="cu-segment" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "clients"}
            className={activeTab === "clients" ? "active" : ""}
            onClick={() => setActiveTab("clients")}
          >
            Client List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            <History size={14} /> History
          </button>
        </div>
      </div>

      {activeTab === "clients" && (
        <div className="cu-table">
          <div className="cu-row cu-row--head">
            <span>Client</span>
            <span>Status</span>
            <span>Projects</span>
            <span className="cu-col-actions">Actions</span>
          </div>

          {filteredClients.length === 0 && (
            <div className="cu-empty">
              <Users size={30} />
              <p>{clientList.length === 0 ? "No clients yet." : "No clients match your search."}</p>
              {clientList.length === 0 && (
                <button type="button" className="cu-create-btn" onClick={() => openCreateModal()}>
                  <Plus size={16} /> Create your first client
                </button>
              )}
            </div>
          )}

          {filteredClients.map((client) => (
            <div key={client.id} className="cu-row">
              <div className="cu-client">
                <span className="cu-avatar">
                  {(client.clientName || "C").trim().charAt(0).toUpperCase()}
                </span>
                <div className="cu-client-text">
                  <strong>{client.clientName}</strong>
                  <span>{client.clientEmail}</span>
                </div>
              </div>

              <div>
                <span className={`cu-badge cu-badge--${client.clientStatus === "inactive" ? "inactive" : "active"}`}>
                  {client.clientStatus || "active"}
                </span>
              </div>

              <div className="cu-projects">
                <div className="cu-projects-line">
                  <strong>{client.projects.length}</strong>{" "}
                  {client.projects.length === 1 ? "project" : "projects"}
                  {client.projects[0]?.name && (
                    <span className="cu-latest" title={client.projects[0].name}>
                      · latest: {client.projects[0].name}
                    </span>
                  )}
                </div>
                {client.projects.length > 0 && (
                  <div className="cu-chips">
                    {client.projects.slice(0, 3).map((project) => (
                      <button
                        type="button"
                        key={project._id}
                        className="cu-chip"
                        title={project.name}
                        onClick={() => navigate(`/manager/projects/${project._id}`)}
                      >
                        {project.projectId}
                      </button>
                    ))}
                    {client.projects.length > 3 && (
                      <span className="cu-chip cu-chip--static">
                        +{client.projects.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="cu-actions">
                <button
                  type="button"
                  className="cu-btn"
                  onClick={() => navigate(`/manager/projects/${client.projects[0]._id}`)}
                  disabled={!client.projects[0]?._id}
                >
                  Details
                </button>
                <button
                  type="button"
                  className="cu-btn cu-btn--primary"
                  onClick={() => openCreateModal(client)}
                  disabled={!client.clientId}
                >
                  <Plus size={14} /> Project
                </button>
                <button
                  type="button"
                  className="cu-icon-btn"
                  title="Reset password"
                  aria-label="Reset password"
                  onClick={() => openResetPasswordModal(client.clientId)}
                >
                  <KeyRound size={16} />
                </button>
                <button
                  type="button"
                  className="cu-icon-btn cu-icon-btn--danger"
                  title="Delete client"
                  aria-label="Delete client"
                  onClick={() =>
                    setDeleteTarget({ clientId: client.clientId, clientName: client.clientName })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="cu-table">
          <div className="cu-row cu-row--head">
            <span>Client</span>
            <span>Status</span>
            <span>Details</span>
            <span className="cu-col-actions">Projects</span>
          </div>

          {deletedHistory.length === 0 && (
            <div className="cu-empty">
              <History size={30} />
              <p>No deleted client history found yet.</p>
            </div>
          )}

          {deletedHistory.map((item) => (
            <div key={item._id} className="cu-row">
              <div className="cu-client">
                <span className="cu-avatar cu-avatar--muted">
                  {(item.name || "C").trim().charAt(0).toUpperCase()}
                </span>
                <div className="cu-client-text">
                  <strong>{item.name}</strong>
                  <span>{item.email}</span>
                </div>
              </div>

              <div>
                <span className="cu-badge cu-badge--inactive">deleted</span>
              </div>

              <div className="cu-projects">
                <div className="cu-projects-line">
                  Deleted{" "}
                  <strong>
                    {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : "-"}
                  </strong>
                </div>
                <div className="cu-latest-block">
                  {item.company || "No company"} · {item.phone || "No phone"}
                </div>
              </div>

              <div className="cu-chips cu-actions">
                {(item.projects || []).slice(0, 3).map((project, index) => (
                  <span key={`${item._id}-${index}`} className="cu-chip cu-chip--static">
                    {project.projectId || project.name || "Project"}
                  </span>
                ))}
                {(item.projects || []).length > 3 && (
                  <span className="cu-chip cu-chip--static">
                    +{item.projects.length - 3} more
                  </span>
                )}
                {(item.projects || []).length === 0 && <span className="cu-latest">None</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div
          className="create-modal-overlay"
          onClick={closeCreateModal}
        >
          <div className="form-card create-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-header">
              <div>
                <h3>{addProjectClient ? "Add Project" : "Create Client"}</h3>
                <p>
                  {addProjectClient
                    ? "Create another project under this client's existing account."
                    : "Add a client and assign the project details in one step."}
                </p>
              </div>

              <button
                type="button"
                className="create-modal-close"
                onClick={closeCreateModal}
                aria-label="Close form"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {addProjectClient ? (
                <div className="form-section">
                  <div className="form-section-head">
                    <User size={16} />
                    <h4>Client</h4>
                  </div>
                  <div className="add-project-client-summary">
                    <strong>{addProjectClient.clientName}</strong>
                    <span>{addProjectClient.clientEmail}</span>
                    <span className="muted">
                      {addProjectClient.projects.length} existing project
                      {addProjectClient.projects.length === 1 ? "" : "s"} · no new login is created
                    </span>
                  </div>
                </div>
              ) : (
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
              )}

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
                {loading
                  ? "Creating..."
                  : addProjectClient
                    ? "Add Project"
                    : "Create Client"}
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

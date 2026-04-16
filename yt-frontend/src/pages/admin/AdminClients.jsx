import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getAdminClientDetails,
  createClientProject,
} from "../../services/adminService";

export default function AdminClient() {
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [projectForm, setProjectForm] = useState({
    name: "",
    paymentAmount: "",
    expectedDeliveryDate: "",
  });

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await getAdminClientDetails(id);
      setClient(data.client);
      setProjects(data.projects);
    } catch {
      toast.error("Failed to load client details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  /* ================= CREATE PROJECT ================= */
  const handleCreateProject = async () => {
    if (!projectForm.name) {
      toast.error("Project name required");
      return;
    }

    try {
      await createClientProject(id, projectForm);
      toast.success("Project created");
      setProjectForm({
        name: "",
        paymentAmount: "",
        expectedDeliveryDate: "",
      });
      loadDetails();
    } catch {
      toast.error("Failed to create project");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!client) return <p>No client found</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2>Client Details</h2>

      {/* CLIENT INFO */}
      <div style={{ marginBottom: 20 }}>
        <p><b>Name:</b> {client.name}</p>
        <p><b>Email:</b> {client.email}</p>
        <p><b>Status:</b> {client.status}</p>
      </div>

      <hr />

      {/* CREATE PROJECT */}
      <h3>Create Project</h3>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Project name"
          value={projectForm.name}
          onChange={(e) =>
            setProjectForm({ ...projectForm, name: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Payment amount"
          value={projectForm.paymentAmount}
          onChange={(e) =>
            setProjectForm({ ...projectForm, paymentAmount: e.target.value })
          }
        />

        <input
          type="date"
          value={projectForm.expectedDeliveryDate}
          onChange={(e) =>
            setProjectForm({
              ...projectForm,
              expectedDeliveryDate: e.target.value,
            })
          }
        />

        <button onClick={handleCreateProject}>Create</button>
      </div>

      <hr />

      {/* PROJECT LIST */}
      <h3>Projects</h3>

      {projects.length === 0 ? (
        <p>No projects yet</p>
      ) : (
        projects.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginBottom: 10,
            }}
          >
            <p><b>{p.name}</b></p>
            <p>Status: {p.status}</p>
            <p>Payment: {p.paymentStatus} ({p.paymentAmount})</p>
            <p>
              Delivery:{" "}
              {p.expectedDeliveryDate
                ? new Date(p.expectedDeliveryDate).toDateString()
                : "-"}
            </p>
            <p>Manager: {p.managerId?.name || "-"}</p>
            <p>Tech Lead: {p.techLeadId?.name || "-"}</p>
          </div>
        ))
      )}
    </div>
  );
}

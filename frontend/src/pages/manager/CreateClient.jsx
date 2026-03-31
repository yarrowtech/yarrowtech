
// import React, { useEffect, useMemo, useState } from "react";
// import "../../styles/ManagerCreateClient.css";
// import { toast } from "react-hot-toast";
// import { Eye, EyeOff } from "lucide-react";

// import {
//   createClientAndProject,
//   getManagerProjects,
//   getTechLeads,
// } from "../../services/managerService";

// export default function CreateClient() {
//   const [projects, setProjects] = useState([]);
//   const [techLeads, setTechLeads] = useState([]);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     projectId: "",
//     name: "",
//     clientName: "",
//     clientEmail: "",
//     password: "",
//     techLeadEmail: "",
//     expectedDelivery: "",
//   });

//   /* ================= LOAD DATA ================= */
//   useEffect(() => {
//     loadProjects();
//     loadTechLeads();
//   }, []);

//   const loadProjects = async () => {
//     try {
//       const list = await getManagerProjects();
//       setProjects(Array.isArray(list) ? list : []);
//     } catch {
//       toast.error("Failed to load projects");
//     }
//   };

//   const loadTechLeads = async () => {
//     try {
//       const list = await getTechLeads();
//       setTechLeads(Array.isArray(list) ? list : []);
//     } catch {
//       toast.error("Failed to load tech leads");
//     }
//   };

//   /* ================= FILTER ================= */
//   const filteredClients = useMemo(() => {
//     const q = search.toLowerCase();

//     return projects.filter((p) => {
//       const matchSearch =
//         p.clientName?.toLowerCase().includes(q) ||
//         p.clientEmail?.toLowerCase().includes(q) ||
//         p.name?.toLowerCase().includes(q) ||
//         p.projectId?.toLowerCase().includes(q);

//       const matchStatus =
//         statusFilter === "all" ||
//         (statusFilter === "active" && p.clientStatus !== "inactive") ||
//         (statusFilter === "inactive" && p.clientStatus === "inactive");

//       return matchSearch && matchStatus;
//     });
//   }, [projects, search, statusFilter]);

//   /* ================= PASSWORD ================= */
//   const generatePassword = () => {
//     const pwd =
//       Math.random().toString(36).slice(-8) +
//       Math.random().toString(36).toUpperCase().slice(-4);

//     setFormData((p) => ({ ...p, password: pwd }));
//     toast.success("Password generated");
//   };

//   /* ================= CREATE ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.techLeadEmail) {
//       toast.error("Please select Tech Lead");
//       return;
//     }

//     setLoading(true);
//     try {
//       await createClientAndProject(formData);
//       toast.success("Client & Project created");

//       setFormData({
//         projectId: "",
//         name: "",
//         clientName: "",
//         clientEmail: "",
//         password: "",
//         techLeadEmail: "",
//         expectedDelivery: "",
//       });

//       loadProjects();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Create failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="manager-create-page">
//       {/* ================= FILTER BAR ================= */}
//       <div className="admin-filters">
//         <input
//           className="search-input"
//           placeholder="Search client / email / project..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <select
//           className="status-filter"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="all">All Status</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//       </div>

//       {/* ================= CLIENT LIST CARD ================= */}
//       <div className="client-card-grid">
//         {filteredClients.map((p) => (
//           <div key={p._id} className="client-card">
//             <h4>{p.clientName}</h4>
//             <p>{p.clientEmail}</p>

//             <span className={`status-badge ${p.clientStatus || "active"}`}>
//               {p.clientStatus || "active"}
//             </span>

//             <div className="card-meta">
//               <div>
//                 <strong>Project:</strong> {p.name}
//               </div>
//               <div>
//                 <strong>ID:</strong> {p.projectId}
//               </div>
//             </div>

//             <div className="card-actions">
//               <button className="reset-btn">Reset Password</button>
//               <button className="toggle-btn">
//                 {p.clientStatus === "inactive" ? "Activate" : "Deactivate"}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ================= CREATE FORM ================= */}
//       <section className="create-form-section">
//         <div className="form-card">
//           <h3>Create Client</h3>

//           <form onSubmit={handleSubmit}>
//             <div className="form-grid">
//               <input
//                 placeholder="Project ID"
//                 value={formData.projectId}
//                 onChange={(e) =>
//                   setFormData({ ...formData, projectId: e.target.value })
//                 }
//                 required
//               />

//               <input
//                 placeholder="Project Name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 required
//               />

//               <input
//                 placeholder="Client Name"
//                 value={formData.clientName}
//                 onChange={(e) =>
//                   setFormData({ ...formData, clientName: e.target.value })
//                 }
//                 required
//               />

//               <input
//                 type="email"
//                 placeholder="Client Email"
//                 value={formData.clientEmail}
//                 onChange={(e) =>
//                   setFormData({ ...formData, clientEmail: e.target.value })
//                 }
//                 required
//               />

//               <select
//                 value={formData.techLeadEmail}
//                 onChange={(e) =>
//                   setFormData({ ...formData, techLeadEmail: e.target.value })
//                 }
//                 required
//               >
//                 <option value="">Select Tech Lead</option>
//                 {techLeads.map((t) => (
//                   <option key={t.email} value={t.email}>
//                     {t.name || "Tech Lead"} ({t.email})
//                   </option>
//                 ))}
//               </select>

//               <input
//                 type="date"
//                 value={formData.expectedDelivery}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     expectedDelivery: e.target.value,
//                   })
//                 }
//                 required
//               />

//               <div className="password-row">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <EyeOff /> : <Eye />}
//                 </button>
//                 <button type="button" onClick={generatePassword}>
//                   Generate
//                 </button>
//               </div>
//             </div>

//             <button className="submit-btn" disabled={loading}>
//               {loading ? "Creating..." : "Create Client"}
//             </button>
//           </form>
//         </div>
//       </section>
//     </div>
//   );
// }










import React, { useEffect, useMemo, useState } from "react";
import "../../styles/ManagerCreateClient.css";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import {
  createClientAndProject,
  getManagerProjects,
  getTechLeads,
  deleteClient,              // ✅ added
  resetClientPassword,       // ✅ added
} from "../../services/managerService";

export default function CreateClient() {
  const [projects, setProjects] = useState([]);
  const [techLeads, setTechLeads] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    clientName: "",
    clientEmail: "",
    password: "",
    techLeadEmail: "",
    expectedDelivery: "",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadProjects();
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

  /* ================= FILTER ================= */
  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();

    return projects.filter((p) => {
      const matchSearch =
        p.clientName?.toLowerCase().includes(q) ||
        p.clientEmail?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.projectId?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.clientStatus !== "inactive") ||
        (statusFilter === "inactive" && p.clientStatus === "inactive");

      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  /* ================= PASSWORD ================= */
  const generatePassword = () => {
    const pwd =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).toUpperCase().slice(-4);

    setFormData((p) => ({ ...p, password: pwd }));
    toast.success("Password generated");
  };

  /* ================= CREATE ================= */
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
        password: "",
        techLeadEmail: "",
        expectedDelivery: "",
      });

      loadProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE CLIENT ================= */
  const handleDeleteClient = async (clientId) => {
    if (!clientId) return;

    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await deleteClient(clientId);
      toast.success("Client deleted");
      loadProjects();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async (clientId) => {
    if (!clientId) return;

    if (!window.confirm("Reset client password?")) return;

    try {
      await resetClientPassword(clientId);
      toast.success("Password reset & sent to email");
    } catch {
      toast.error("Reset failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="manager-create-page">
      {/* ================= FILTER BAR ================= */}
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

      {/* ================= CLIENT LIST ================= */}
      <div className="client-card-grid">
        {filteredClients.map((p) => (
          <div key={p._id} className="client-card">
            <h4>{p.clientName}</h4>
            <p>{p.clientEmail}</p>

            <span className={`status-badge ${p.clientStatus || "active"}`}>
              {p.clientStatus || "active"}
            </span>

            <div className="card-meta">
              <div>
                <strong>Project:</strong> {p.name}
              </div>
              <div>
                <strong>ID:</strong> {p.projectId}
              </div>
            </div>

            <div className="card-actions">
              <button
                className="reset-btn"
                onClick={() => handleResetPassword(p.client?._id)}
              >
                Reset Password
              </button>

              <button
                className="toggle-btn"
                onClick={() => handleDeleteClient(p.client?._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CREATE FORM ================= */}
      <section className="create-form-section">
        <div className="form-card">
          <h3>Create Client</h3>

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

              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
                <button type="button" onClick={generatePassword}>
                  Generate
                </button>
              </div>
            </div>

            <button className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Client"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
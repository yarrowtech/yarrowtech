// // import React, { useEffect, useState } from "react";
// // import "../../styles/AdminProject.css";
// // import { Edit, Trash2, Eye } from "lucide-react";

// // // Temporary local data (mock projects)
// // const mockProjects = [
// //   {
// //     _id: "1",
// //     projectId: "PRJ001",
// //     title: "Food & Beverage ERP System",
// //     clientName: "ABC Foods Pvt Ltd",
// //     managerName: "Anshika Sharma",
// //     status: "Ongoing",
// //     progress: 70,
// //     expectedDeliveryDate: "2025-12-01",
// //   },
// //   {
// //     _id: "2",
// //     projectId: "PRJ002",
// //     title: "Restaurant POS Web App",
// //     clientName: "Cafe 24x7",
// //     managerName: "Rohit Singh",
// //     status: "Completed",
// //     progress: 100,
// //     expectedDeliveryDate: "2025-08-25",
// //   },
// //   {
// //     _id: "3",
// //     projectId: "PRJ003",
// //     title: "Hotel Booking Portal",
// //     clientName: "BlueMoon Hotels",
// //     managerName: "Niharika Jain",
// //     status: "Pending",
// //     progress: 20,
// //     expectedDeliveryDate: "2026-02-15",
// //   },
// // ];

// // export default function Projects() {
// //   const [projects, setProjects] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     setTimeout(() => {
// //       setProjects(mockProjects);
// //       setLoading(false);
// //     }, 500); // faster load
// //   }, []);

// //   return (
// //     <div className="admin-projects-container">
// //       <div className="admin-header">
// //         <h2>Projects Overview</h2>
// //         <p className="subtitle">Monitor all client projects and progress</p>
// //       </div>

// //       {/* Skeleton Loader */}
// //       {loading ? (
// //         <div className="skeleton-table-wrapper">
// //           {[1, 2, 3, 4, 5].map((i) => (
// //             <div key={i} className="skeleton-row"></div>
// //           ))}
// //         </div>
// //       ) : (
// //         <div className="projects-table-wrapper">
// //           <table className="projects-table">
// //             <thead>
// //               <tr>
// //                 <th>ID</th>
// //                 <th>Project Name</th>
// //                 <th>Client</th>
// //                 <th>Status</th>
// //                 <th>Progress</th>
// //                 <th>Assigned Manager</th>
// //                 <th>Expected Delivery</th>
// //                 <th>Actions</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {projects.map((proj) => (
// //                 <tr key={proj._id}>
// //                   <td>{proj.projectId}</td>
// //                   <td>{proj.title}</td>
// //                   <td>{proj.clientName}</td>

// //                   <td
// //                     className={`status 
// //                       ${proj.status === "Completed"
// //                         ? "status-completed"
// //                         : proj.status === "Ongoing"
// //                         ? "status-ongoing"
// //                         : "status-pending"
// //                       }`}
// //                   >
// //                     {proj.status}
// //                   </td>

// //                   <td>
// //                     <div className="progress-bar">
// //                       <div
// //                         className="progress-fill"
// //                         style={{ width: `${proj.progress}%` }}
// //                       ></div>
// //                     </div>
// //                     <span className="progress-text">{proj.progress}%</span>
// //                   </td>

// //                   <td>{proj.managerName}</td>
// //                   <td>{proj.expectedDeliveryDate}</td>

// //                   <td className="actions">
// //                     <button className="view-btn">
// //                       <Eye size={18} />
// //                     </button>
// //                     <button className="edit-btn">
// //                       <Edit size={18} />
// //                     </button>
// //                     <button
// //                       className="delete-btn"
// //                       onClick={() => alert(`Deleted ${proj.title}`)}
// //                     >
// //                       <Trash2 size={18} />
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }









// import React, { useEffect, useState } from "react";
// import "../../styles/AdminProject.css";
// import { Edit, Search, Check, X } from "lucide-react";
// import { getAllProjects, updateProject } from "../../services/adminService";

// export default function Projects() {
//   const [projects, setProjects] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   // Inline Editing
//   const [editingId, setEditingId] = useState(null);
//   const [editData, setEditData] = useState({});

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const loadProjects = async () => {
//     try {
//       const res = await getAllProjects();
//       const list = Array.isArray(res)
//         ? res
//         : Array.isArray(res?.projects)
//         ? res.projects
//         : [];

//       setProjects(list);
//       setFiltered(list);
//     } catch (err) {
//       console.error("❌ Failed to load projects:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // SAFE Search + Filter logic
//   useEffect(() => {
//     let result = [...projects];

//     // Search filter
//     if (search.trim() !== "") {
//       const s = search.toLowerCase();
//       result = result.filter((p) =>
//         (p.projectName || "").toLowerCase().includes(s)
//       );
//     }

//     // Status filter
//     if (statusFilter !== "all") {
//       result = result.filter(
//         (p) => (p.status || "").toLowerCase() === statusFilter
//       );
//     }

//     setFiltered(result);
//   }, [search, statusFilter, projects]);

//   // Start editing
//   const startEdit = (project) => {
//     setEditingId(project._id);
//     setEditData({
//       projectName: project.projectName || "",
//       status: project.status || "pending",
//       progress: project.progress || 0,
//       expectedDelivery: project.expectedDelivery || "",
//     });
//   };

//   // Save edit
//   const saveEdit = async (id) => {
//     try {
//       await updateProject(id, editData);
//       await loadProjects();
//       setEditingId(null);
//     } catch (err) {
//       console.error("Update failed:", err);
//     }
//   };

//   return (
//     <div className="admin-projects-container">
//       <div className="admin-header">
//         <h2>Projects Overview</h2>
//         <p className="subtitle">Monitor all client projects and progress</p>
//       </div>

//       {/* FILTER BAR */}
//       <div className="project-filter-bar">
//         <div className="search-box">
//           <Search size={18} />
//           <input
//             type="text"
//             placeholder="Search project by name..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <select
//           className="filter-select"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="all">All Status</option>
//           <option value="completed">Completed</option>
//           <option value="ongoing">Ongoing</option>
//           <option value="pending">Pending</option>
//         </select>
//       </div>

//       {/* TABLE */}
//       {loading ? (
//         <div className="skeleton-table-wrapper">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="skeleton-row"></div>
//           ))}
//         </div>
//       ) : (
//         <div className="projects-table-wrapper">
//           <table className="projects-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Project</th>
//                 <th>Status</th>
//                 <th>Progress</th>
//                 <th>Delivery</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="no-records">
//                     No projects found.
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((proj) => (
//                   <tr key={proj._id}>
//                     <td>{proj.projectId || "—"}</td>

//                     {/* Project Name */}
//                     <td>
//                       {editingId === proj._id ? (
//                         <input
//                           type="text"
//                           value={editData.projectName}
//                           onChange={(e) =>
//                             setEditData({
//                               ...editData,
//                               projectName: e.target.value,
//                             })
//                           }
//                         />
//                       ) : (
//                         proj.projectName || "—"
//                       )}
//                     </td>

//                     {/* Status */}
//                     <td>
//                       {editingId === proj._id ? (
//                         <select
//                           value={editData.status}
//                           onChange={(e) =>
//                             setEditData({ ...editData, status: e.target.value })
//                           }
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="ongoing">Ongoing</option>
//                           <option value="completed">Completed</option>
//                         </select>
//                       ) : (
//                         <span
//                           className={`status-badge status-${(
//                             proj.status || ""
//                           ).toLowerCase()}`}
//                         >
//                           {proj.status || "N/A"}
//                         </span>
//                       )}
//                     </td>

//                     {/* Progress */}
//                     <td>
//                       {editingId === proj._id ? (
//                         <input
//                           type="number"
//                           min="0"
//                           max="100"
//                           value={editData.progress}
//                           onChange={(e) =>
//                             setEditData({
//                               ...editData,
//                               progress: e.target.value,
//                             })
//                           }
//                         />
//                       ) : (
//                         `${proj.progress || 0}%`
//                       )}
//                     </td>

//                     {/* Delivery */}
//                     <td>
//                       {editingId === proj._id ? (
//                         <input
//                           type="date"
//                           value={editData.expectedDelivery}
//                           onChange={(e) =>
//                             setEditData({
//                               ...editData,
//                               expectedDelivery: e.target.value,
//                             })
//                           }
//                         />
//                       ) : (
//                         proj.expectedDelivery || "N/A"
//                       )}
//                     </td>

//                     {/* ACTIONS */}
//                     <td>
//                       {editingId === proj._id ? (
//                         <>
//                           <button
//                             className="save-btn"
//                             onClick={() => saveEdit(proj._id)}
//                           >
//                             <Check size={18} />
//                           </button>
//                           <button
//                             className="cancel-btn"
//                             onClick={() => setEditingId(null)}
//                           >
//                             <X size={18} />
//                           </button>
//                         </>
//                       ) : (
//                         <button
//                           className="edit-btn"
//                           onClick={() => startEdit(proj)}
//                         >
//                           <Edit size={18} />
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import "../../styles/AdminProject.css";
import { Edit, Search, Check, X } from "lucide-react";
import { getAllProjects, updateProject } from "../../services/adminService";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inline Editing
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
      setFiltered(list);
    } catch (err) {
      console.error("❌ Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search + Filter
  useEffect(() => {
    let result = [...projects];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((p) =>
        (p.projectName || "").toLowerCase().includes(s)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (p) => (p.status || "").toLowerCase() === statusFilter
      );
    }

    setFiltered(result);
  }, [search, statusFilter, projects]);

  // Start editing
  const startEdit = (project) => {
    setEditingId(project._id);
    setEditData({
      projectName: project.projectName || "",
      status: project.status || "pending",
      progress: project.progress || 0,
      expectedDelivery: project.expectedDelivery || "",
    });
  };

  // Save edit (SAFE)
  const saveEdit = async (id) => {
    try {
      setSaving(true);

      const payload = {
        ...editData,
        progress: Number(editData.progress), // ✅ force number
      };

      await updateProject(id, payload);
      await loadProjects();

      setEditingId(null);
      setEditData({});
    } catch (err) {
      console.error("❌ Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="admin-projects-container">
      <div className="admin-header">
        <h2>Projects Overview</h2>
        <p className="subtitle">Monitor all client projects and progress</p>
      </div>

      {/* FILTER BAR */}
      <div className="project-filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search project by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="ongoing">Ongoing</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="skeleton-table-wrapper">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row"></div>
          ))}
        </div>
      ) : (
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Delivery</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-records">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filtered.map((proj) => (
                  <tr key={proj._id}>
                    <td>{proj.projectId || "—"}</td>

                    {/* Project Name */}
                    <td>
                      {editingId === proj._id ? (
                        <input
                          type="text"
                          value={editData.projectName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              projectName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        proj.projectName || "—"
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      {editingId === proj._id ? (
                        <select
                          value={editData.status}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span
                          className={`status-badge status-${(
                            proj.status || ""
                          ).toLowerCase()}`}
                        >
                          {proj.status || "N/A"}
                        </span>
                      )}
                    </td>

                    {/* Progress */}
                    <td>
                      {editingId === proj._id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editData.progress}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              progress: e.target.value,
                            })
                          }
                        />
                      ) : (
                        `${proj.progress || 0}%`
                      )}
                    </td>

                    {/* Delivery */}
                    <td>
                      {editingId === proj._id ? (
                        <input
                          type="date"
                          value={editData.expectedDelivery}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              expectedDelivery: e.target.value,
                            })
                          }
                        />
                      ) : (
                        proj.expectedDelivery || "N/A"
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td>
                      {editingId === proj._id ? (
                        <>
                          <button
                            className="save-btn"
                            disabled={saving}
                            onClick={() => saveEdit(proj._id)}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={cancelEdit}
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(proj)}
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

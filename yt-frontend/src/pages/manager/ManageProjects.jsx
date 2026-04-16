// import React, { useEffect, useState } from "react";
// import "../../styles/ManagerProjects.css";
// import { toast } from "react-hot-toast";
// import {
//   getManagerProjects,
//   updateManagerProject,
// } from "../../services/managerService";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");

// export default function ManageProjects() {
//   const [projects, setProjects] = useState([]);
//   const [openId, setOpenId] = useState(null);

//   const [edit, setEdit] = useState(null);
//   const [chatInput, setChatInput] = useState({});

//   /* ================= LOAD PROJECTS ================= */
//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const loadProjects = async () => {
//     try {
//       const list = await getManagerProjects();
//       setProjects(list || []);
//     } catch {
//       toast.error("Failed to load projects");
//     }
//   };

//   /* ================= OPEN / CLOSE PROJECT ================= */
//   const toggleProject = (project) => {
//     if (openId === project._id) {
//       setOpenId(null);
//       setEdit(null);
//       return;
//     }

//     setOpenId(project._id);
//     setEdit({
//       _id: project._id,
//       progress: project.progress || 0,
//       status: project.status || "pending",
//       expectedDelivery: project.expectedDelivery?.slice(0, 10) || "",
//     });
//   };

//   /* ================= SAVE PROJECT ================= */
//   const saveProject = async () => {
//     try {
//       await updateManagerProject(edit._id, {
//         progress: Number(edit.progress),
//         status: edit.status,
//         expectedDelivery: edit.expectedDelivery,
//       });

//       socket.emit("project-update", {
//         projectId: edit._id,
//         ...edit,
//       });

//       toast.success("Project updated");
//       setOpenId(null);
//       setEdit(null);
//       loadProjects();
//     } catch {
//       toast.error("Update failed");
//     }
//   };

//   /* ================= CHAT ================= */
//   const sendMessage = (project) => {
//     const msg = chatInput[project._id];
//     if (!msg) return;

//     socket.emit("send-message", {
//       projectId: project._id,
//       toEmail: project.clientEmail,
//       fromRole: "manager",
//       text: msg,
//     });

//     setChatInput((c) => ({ ...c, [project._id]: "" }));
//     toast.success("Message sent");
//   };

//   /* ================= RENDER ================= */
//   return (
//     <div className="manager-projects-page">
//       <h2 className="page-title">Manage Projects</h2>

//       {projects.map((p) => (
//         <div key={p._id} className="project-card">

//           {/* ===== PROJECT HEADER ===== */}
//           <div className="project-header">
//             <div>
//               <h3>{p.name}</h3>
//               <p className="muted">{p.clientEmail}</p>
//             </div>

//             <div className="summary">
//               <span className={`status ${p.status}`}>
//                 {p.status}
//               </span>
//               <span>{p.progress || 0}%</span>
//               <button onClick={() => toggleProject(p)}>
//                 {openId === p._id ? "▲" : "▼"}
//               </button>
//             </div>
//           </div>

//           {/* ===== ERP PANEL ===== */}
//           {openId === p._id && edit && (
//             <div className="erp-panel">

//               {/* PROGRESS */}
//               <div className="erp-section">
//                 <label>Progress ({edit.progress}%)</label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="100"
//                   value={edit.progress}
//                   onChange={(e) =>
//                     setEdit({ ...edit, progress: e.target.value })
//                   }
//                 />
//               </div>

//               {/* STATUS */}
//               <div className="erp-section">
//                 <label>Status</label>
//                 <select
//                   value={edit.status}
//                   onChange={(e) =>
//                     setEdit({ ...edit, status: e.target.value })
//                   }
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="ongoing">Ongoing</option>
//                   <option value="completed">Completed</option>
//                 </select>
//               </div>

//               {/* DELIVERY */}
//               <div className="erp-section">
//                 <label>Expected Delivery</label>
//                 <input
//                   type="date"
//                   value={edit.expectedDelivery}
//                   onChange={(e) =>
//                     setEdit({
//                       ...edit,
//                       expectedDelivery: e.target.value,
//                     })
//                   }
//                 />
//               </div>

//               {/* PAYMENTS (ERP SLOT) */}
//               <div className="erp-section payments-box">
//                 <h4>Payments</h4>
//                 <p className="muted">Invoices, totals & history</p>
//                 <button
//                   className="secondary-btn"
//                   onClick={() =>
//                     toast("Payments module coming next 💳")
//                   }
//                 >
//                   Open Payments
//                 </button>
//               </div>

//               {/* CHAT */}
//               <div className="erp-section chat-box">
//                 <h4>Client Chat</h4>

//                 <input
//                   placeholder="Message client..."
//                   value={chatInput[p._id] || ""}
//                   onChange={(e) =>
//                     setChatInput({
//                       ...chatInput,
//                       [p._id]: e.target.value,
//                     })
//                   }
//                 />

//                 <button onClick={() => sendMessage(p)}>
//                   Send
//                 </button>
//               </div>

//               {/* SAVE */}
//               <div className="erp-actions">
//                 <button className="save-btn" onClick={saveProject}>
//                   Save Changes
//                 </button>
//               </div>

//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }








import React, { useEffect, useState } from "react";
import "../../styles/ManagerProjects.css";
import { toast } from "react-hot-toast";
import API from "../../services/axiosInstance";

/* =====================================================
   MANAGER PROJECTS – FINAL VERSION
===================================================== */
export default function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PROJECTS ================= */
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

  /* ================= TOGGLE DETAILS ================= */
  const toggleDetails = (project) => {
    if (activeId === project._id) {
      setActiveId(null);
      setEdit(null);
      return;
    }

    setActiveId(project._id);
    setEdit({
      _id: project._id,
      status: project.status,
      progress: project.progress || 0,
      expectedDelivery: project.expectedDelivery
        ? project.expectedDelivery.slice(0, 10)
        : "",
    });
  };

  /* ================= UPDATE PROJECT ================= */
  const saveChanges = async () => {
    try {
      await API.put(`/erp/projects/${edit._id}`, {
        status: edit.status,
        progress: Number(edit.progress),
        expectedDelivery: edit.expectedDelivery,
      });

      toast.success("Project updated");
      setActiveId(null);
      setEdit(null);
      loadProjects();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  /* ================= EXPORT PDF ================= */
  const exportPDF = (project) => {
    toast.success(`PDF export started for ${project.projectId}`);
    // backend/pdf route can be attached here later
  };

  /* ================= UI ================= */
  if (loading) {
    return <p className="muted">Loading projects...</p>;
  }

  return (
    <div className="manager-projects-page">
      <h2 className="page-title">Manage Client Projects</h2>

      {projects.length === 0 && (
        <p className="muted">
          No client projects found. Create a client to start managing projects.
        </p>
      )}

      {projects.map((project) => (
        <div key={project._id} className="project-card">
          {/* ================= HEADER ================= */}
          <div className="project-header">
            <div>
              <h3>{project.name}</h3>
              <p className="muted">
                {project.clientEmail || "Client email not available"}
              </p>
            </div>

            <div className="summary">
              <span className={`status ${project.status}`}>
                {project.status}
              </span>
              <span>{project.progress || 0}%</span>
              <button onClick={() => toggleDetails(project)}>
                {activeId === project._id ? "▲" : "▼"}
              </button>
            </div>
          </div>

          {/* ================= DETAILS ================= */}
          {activeId === project._id && edit && (
            <div className="project-details">

              {/* PROJECT INFO */}
              <section className="detail-section">
                <h4>Project Info</h4>
                <p><strong>ID:</strong> {project.projectId}</p>
                <p><strong>Name:</strong> {project.name}</p>
                <p><strong>Tech Lead:</strong> {project.techLeadEmail}</p>
              </section>

              {/* CLIENT INFO */}
              <section className="detail-section">
                <h4>Client Info</h4>
                <p><strong>Name:</strong> {project.clientName}</p>
                <p><strong>Email:</strong> {project.clientEmail}</p>
              </section>

              {/* PROGRESS UPDATE */}
              <section className="detail-section">
                <h4>Progress Update</h4>

                <label>Progress ({edit.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={edit.progress}
                  onChange={(e) =>
                    setEdit({ ...edit, progress: e.target.value })
                  }
                />

                <label>Status</label>
                <select
                  value={edit.status}
                  onChange={(e) =>
                    setEdit({ ...edit, status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>

                <label>Expected Delivery</label>
                <input
                  type="date"
                  value={edit.expectedDelivery}
                  onChange={(e) =>
                    setEdit({ ...edit, expectedDelivery: e.target.value })
                  }
                />
              </section>

              {/* PAYMENTS */}
              <section className="detail-section">
                <h4>Payments</h4>
                <p className="muted">Payment module coming soon</p>
              </section>

              {/* CHAT */}
              <section className="detail-section">
                <h4>Chat</h4>
                <p className="muted">Chat with client (integration pending)</p>
              </section>

              {/* ACTIONS */}
              <div className="detail-actions">
                <button className="save-btn" onClick={saveChanges}>
                  Save Changes
                </button>

                <button
                  className="pdf-btn"
                  onClick={() => exportPDF(project)}
                >
                  Export PDF
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => {
                    setActiveId(null);
                    setEdit(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

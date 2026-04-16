// import React, { useEffect, useState } from "react";
// import "../../styles/RequestDemoManager.css";
// import {
//   Search,
//   Mail,
//   Building2,
//   CalendarDays,
//   FileText,
// } from "lucide-react";

// import {
//   getManagerDemoRequests,
//   updateManagerLeadStatus,
// } from "../../services/managerService";

// /* ================= STATUS CONFIG ================= */
// const STATUS_OPTIONS = [
//   { value: "all", label: "All Status" },
//   { value: "new", label: "New" },
//   { value: "contacted", label: "Contacted" },
//   { value: "in-progress", label: "In Progress" },
//   { value: "closed", label: "Closed" },
// ];

// export default function RequestDemoManager() {
//   const [requests, setRequests] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [loading, setLoading] = useState(true);

//   /* ================= LOAD LEADS ================= */
//   useEffect(() => {
//     loadRequests();
//   }, []);

//   const loadRequests = async () => {
//     try {
//       const list = await getManagerDemoRequests();
//       setRequests(list);
//       setFiltered(list);
//     } catch (err) {
//       console.error("❌ Failed to load demo requests:", err);
//       setRequests([]);
//       setFiltered([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= SEARCH + FILTER ================= */
//   useEffect(() => {
//     let data = [...requests];

//     // Status filter
//     if (statusFilter !== "all") {
//       data = data.filter((r) => r.status === statusFilter);
//     }

//     // Search filter
//     if (search.trim()) {
//       const s = search.toLowerCase();
//       data = data.filter(
//         (r) =>
//           r.fullName?.toLowerCase().includes(s) ||
//           r.email?.toLowerCase().includes(s) ||
//           r.companyName?.toLowerCase().includes(s) ||
//           r.projectDescription?.toLowerCase().includes(s)
//       );
//     }

//     setFiltered(data);
//   }, [search, statusFilter, requests]);

//   /* ================= UPDATE STATUS ================= */
//   const handleStatusChange = async (leadId, newStatus) => {
//     try {
//       await updateManagerLeadStatus(leadId, newStatus);
//       setRequests((prev) =>
//         prev.map((r) =>
//           r._id === leadId ? { ...r, status: newStatus } : r
//         )
//       );
//     } catch (err) {
//       console.error("❌ Failed to update status:", err);
//       alert("Failed to update lead status");
//     }
//   };

//   /* ================= STATUS BADGE ================= */
//   const renderStatusBadge = (status) => (
//     <span className={`status-badge ${status}`}>
//       {status.replace("-", " ")}
//     </span>
//   );

//   return (
//     <div className="admin-requests-container">
//       {/* HEADER */}
//       <div className="admin-header">
//         <h2>CRM – Demo Requests</h2>
//         <p className="subtitle">
//           Manage incoming demo leads and update their progress
//         </p>
//       </div>

//       {/* ACTION BAR */}
//       <div className="rd-action-bar">
//         <div className="rd-search-box">
//           <Search size={18} />
//           <input
//             type="text"
//             placeholder="Search leads..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         {/* STATUS FILTER */}
//         <select
//           className="status-filter"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           {STATUS_OPTIONS.map((s) => (
//             <option key={s.value} value={s.value}>
//               {s.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* TABLE */}
//       {loading ? (
//         <div className="rd-loading">Loading leads...</div>
//       ) : (
//         <div className="rd-table-wrapper">
//           <table className="rd-table">
//             <thead>
//               <tr>
//                 <th>Lead</th>
//                 <th>Company</th>
//                 <th>Service</th>
//                 <th>Status</th>
//                 <th>Message</th>
//                 <th>Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="rd-no-records">
//                     No demo requests found
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((lead) => (
//                   <tr key={lead._id}>
//                     <td>
//                       <p className="lead-name">{lead.fullName}</p>
//                       <span className="lead-email">
//                         <Mail size={13} /> {lead.email}
//                       </span>
//                     </td>

//                     <td>
//                       <Building2 size={14} />{" "}
//                       {lead.companyName || "—"}
//                     </td>

//                     <td>{lead.serviceInterested}</td>

//                     <td>
//                       {renderStatusBadge(lead.status)}
//                       <select
//                         className="status-select"
//                         value={lead.status}
//                         onChange={(e) =>
//                           handleStatusChange(
//                             lead._id,
//                             e.target.value
//                           )
//                         }
//                       >
//                         {STATUS_OPTIONS.filter(
//                           (s) => s.value !== "all"
//                         ).map((s) => (
//                           <option key={s.value} value={s.value}>
//                             {s.label}
//                           </option>
//                         ))}
//                       </select>
//                     </td>

//                     <td className="rd-message">
//                       <FileText size={14} />{" "}
//                       {lead.projectDescription}
//                     </td>

//                     <td>
//                       <CalendarDays size={14} />{" "}
//                       {new Date(lead.createdAt).toLocaleDateString()}
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
import "../../styles/RequestDemoManager.css";
import {
  Search,
  Mail,
  Building2,
  CalendarDays,
  FileText,
} from "lucide-react";

import {
  getManagerDemoRequests,
  updateManagerLeadStatus,
} from "../../services/managerService";

/* ================= STATUS CONFIG ================= */
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in-progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

export default function RequestDemoManager() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  /* ✅ Drawer state */
  const [selectedLead, setSelectedLead] = useState(null);

  /* ================= LOAD LEADS ================= */
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const list = await getManagerDemoRequests();
      setRequests(list);
      setFiltered(list);
    } catch (err) {
      console.error("❌ Failed to load demo requests:", err);
      setRequests([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH + FILTER ================= */
  useEffect(() => {
    let data = [...requests];

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.companyName?.toLowerCase().includes(s) ||
          r.projectDescription?.toLowerCase().includes(s)
      );
    }

    setFiltered(data);
  }, [search, statusFilter, requests]);

  /* ================= UPDATE STATUS ================= */
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateManagerLeadStatus(leadId, newStatus);
      setRequests((prev) =>
        prev.map((r) =>
          r._id === leadId ? { ...r, status: newStatus } : r
        )
      );
      if (selectedLead?._id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      alert("Failed to update lead status");
    }
  };

  /* ================= STATUS BADGE ================= */
  const renderStatusBadge = (status) => (
    <span className={`status-badge ${status}`}>
      {status.replace("-", " ")}
    </span>
  );

  return (
    <div className="admin-requests-container">
      {/* HEADER */}
      <div className="admin-header">
        <h2>CRM – Demo Requests</h2>
        <p className="subtitle">
          Manage incoming demo leads and update their progress
        </p>
      </div>

      {/* ACTION BAR */}
      <div className="rd-action-bar">
        <div className="rd-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="rd-loading">Loading leads...</div>
      ) : (
        <div className="rd-table-wrapper">
          <table className="rd-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company</th>
                <th>Service</th>
                <th>Status</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="rd-no-records">
                    No demo requests found
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead._id}
                    className="rd-row-clickable"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td>
                      <p className="lead-name">{lead.fullName}</p>
                      <span className="lead-email">
                        <Mail size={13} /> {lead.email}
                      </span>
                    </td>

                    <td>
                      <Building2 size={14} />{" "}
                      {lead.companyName || "—"}
                    </td>

                    <td>{lead.serviceInterested}</td>

                    <td>
                      {renderStatusBadge(lead.status)}
                    </td>

                    <td className="rd-message">
                      <FileText size={14} />{" "}
                      {lead.projectDescription}
                    </td>

                    <td>
                      <CalendarDays size={14} />{" "}
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= SLIDE DRAWER ================= */}
      {selectedLead && (
        <div
          className="rd-drawer-overlay"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="rd-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Lead Details</h3>

            <div className="drawer-section">
              <label>Name</label>
              <p>{selectedLead.fullName}</p>
            </div>

            <div className="drawer-section">
              <label>Email</label>
              <p>{selectedLead.email}</p>
            </div>

            <div className="drawer-section">
              <label>Company</label>
              <p>{selectedLead.companyName || "—"}</p>
            </div>

            <div className="drawer-section">
              <label>Service</label>
              <p>{selectedLead.serviceInterested}</p>
            </div>

            <div className="drawer-section">
              <label>Message</label>
              <p>{selectedLead.projectDescription}</p>
            </div>

            <div className="drawer-section">
              <label>Status</label>
              <select
                value={selectedLead.status}
                onChange={(e) =>
                  handleStatusChange(
                    selectedLead._id,
                    e.target.value
                  )
                }
              >
                {STATUS_OPTIONS.filter(
                  (s) => s.value !== "all"
                ).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="drawer-close"
              onClick={() => setSelectedLead(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import "../../styles/RequestDemoAdmin.css";
// import { getDemoRequests } from "../../services/adminService";
// import {
//   Search,
//   User,
//   Mail,
//   Building2,
//   MessageCircle,
//   CalendarDays,
// } from "lucide-react";

// export default function RequestDemoAdmin() {
//   const [requests, setRequests] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadRequests();
//   }, []);

//   const loadRequests = async () => {
//     try {
//       const data = await getDemoRequests();

//       console.log("DEMO REQUEST RESPONSE:", data);

//       // Backend returns -> { success, count, requests }
//       const list = Array.isArray(data?.requests) ? data.requests : [];

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

//   // Search filtering
//   useEffect(() => {
//     if (!search.trim()) return setFiltered(requests);

//     const s = search.toLowerCase();

//     const result = requests.filter(
//       (r) =>
//         r.name?.toLowerCase().includes(s) ||
//         r.email?.toLowerCase().includes(s) ||
//         r.company?.toLowerCase().includes(s) ||
//         r.message?.toLowerCase().includes(s)
//     );

//     setFiltered(result);
//   }, [search, requests]);

//   return (
//     <div className="admin-requests-container">

//       {/* HEADER */}
//       <div className="admin-header">
//         <h2>Demo Requests</h2>
//         <p className="subtitle">View and manage demo inquiries submitted from the website.</p>
//       </div>

//       {/* SEARCH BAR */}
//       <div className="rd-search-bar">
//         <div className="rd-search-box">
//           <Search size={18} className="icon" />
//           <input
//             type="text"
//             placeholder="Search by name, email, company or message..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <div className="rd-count-chip">
//           Total: {filtered.length}
//         </div>
//       </div>

//       {/* TABLE */}
//       {loading ? (
//         <div className="rd-skeleton-wrapper">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="rd-skeleton-row"></div>
//           ))}
//         </div>
//       ) : (
//         <div className="rd-table-wrapper">
//           <table className="rd-table">
//             <thead>
//               <tr>
//                 <th><User size={16}/> Name</th>
//                 <th><Mail size={16}/> Email</th>
//                 <th><Building2 size={16}/> Company</th>
//                 <th><MessageCircle size={16}/> Message</th>
//                 <th><CalendarDays size={16}/> Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="rd-no-records">
//                     <img
//                       src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
//                       className="rd-no-data-img"
//                       alt="No data"
//                     />
//                     <p>No demo requests found</p>
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((req) => (
//                   <tr key={req._id}>
//                     <td>{req.name}</td>
//                     <td>{req.email}</td>
//                     <td>{req.company || "—"}</td>
//                     <td className="rd-msg-cell">{req.message || "—"}</td>
//                     <td>{new Date(req.createdAt).toLocaleDateString()}</td>
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
import "../../styles/RequestDemoAdmin.css";
import {
  Search,
  Mail,
  Building2,
  CalendarDays,
  FileText,
} from "lucide-react";

import {
  getDemoRequests,
  exportLeadsExcel,
  exportLeadsPDF,
} from "../../services/adminService";

/* =====================================================
   STATUS CONFIG (VIEW ONLY)
===================================================== */
const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "blue" },
  { value: "contacted", label: "Contacted", color: "yellow" },
  { value: "in-progress", label: "In Progress", color: "purple" },
  { value: "closed", label: "Closed", color: "green" },
];

export default function RequestDemoAdmin() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD LEADS ================= */
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getDemoRequests();
      const list = Array.isArray(data?.requests) ? data.requests : [];
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

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(requests);
      return;
    }

    const s = search.toLowerCase();
    setFiltered(
      requests.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.companyName?.toLowerCase().includes(s) ||
          r.projectDescription?.toLowerCase().includes(s)
      )
    );
  }, [search, requests]);

  /* ================= STATUS BADGE ================= */
  const renderStatusBadge = (status) => {
    const s = STATUS_OPTIONS.find((x) => x.value === status);
    return (
      <span className={`status-badge ${s?.color || "gray"}`}>
        {s?.label || "Unknown"}
      </span>
    );
  };

  return (
    <div className="admin-requests-container">
      {/* ================= HEADER ================= */}
      <div className="admin-header">
        <h2>CRM – Demo Requests</h2>
        <p className="subtitle">
          View all incoming leads (Admin access – read only)
        </p>
      </div>

      {/* ================= ACTION BAR ================= */}
      <div className="rd-action-bar">
        <div className="rd-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, company or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rd-actions">
          <button className="export-btn excel" onClick={exportLeadsExcel}>
            Export Excel
          </button>
          <button className="export-btn pdf" onClick={exportLeadsPDF}>
            Export PDF
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
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
                    No leads found
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead._id}>
                    {/* LEAD */}
                    <td>
                      <div className="lead-main">
                        <p className="lead-name">{lead.fullName}</p>
                        <span className="lead-email">
                          <Mail size={13} /> {lead.email}
                        </span>
                      </div>
                    </td>

                    {/* COMPANY */}
                    <td>
                      <Building2 size={14} />{" "}
                      {lead.companyName || "—"}
                    </td>

                    {/* SERVICE */}
                    <td>{lead.serviceInterested}</td>

                    {/* STATUS (READ ONLY) */}
                    <td>
                      {renderStatusBadge(lead.status)}
                    </td>

                    {/* MESSAGE */}
                    <td className="rd-message">
                      <FileText size={14} />{" "}
                      {lead.projectDescription}
                    </td>

                    {/* DATE */}
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
    </div>
  );
}

// import React from "react";
// import "../../styles/ContactAdmin.css";

// export default function ContactAdmin() {
//   const contacts = [
//     {
//       id: 1,
//       name: "Rohit Verma",
//       email: "rohit@gmail.com",
//       subject: "General Inquiry",
//       message: "I want to know more about your ERP system.",
//       date: "2025-11-10",
//       status: "new",
//     },
//     {
//       id: 2,
//       name: "Anshika Sharma",
//       email: "anshika@domain.com",
//       subject: "Support Needed",
//       message: "I need help with integrating API.",
//       date: "2025-11-09",
//       status: "viewed",
//     },
//   ];

//   return (
//     <div className="admin-contact-container">
//       {/* Header */}
//       <div className="admin-header">
//         <h2>Contact Form Submissions</h2>
//         <p className="subtitle">Total Contacts: {contacts.length}</p>
//       </div>

//       {/* Table */}
//       <div className="contact-table-wrapper">
//         <table className="contact-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Subject</th>
//               <th>Message</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {contacts.map((c) => (
//               <tr key={c.id}>
//                 <td>{c.id}</td>
//                 <td>{c.name}</td>
//                 <td>{c.email}</td>
//                 <td>{c.subject}</td>
//                 <td className="truncate">{c.message}</td>
//                 <td>{c.date}</td>

//                 <td>
//                   <span
//                     className={`status ${
//                       c.status === "new" ? "status-new" : "status-viewed"
//                     }`}
//                   >
//                     {c.status}
//                   </span>
//                 </td>

//                 <td className="actions">
//                   <button className="view-btn">View</button>
//                   <button className="delete-btn">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }





import React, { useEffect, useState } from "react";
import "../../styles/ContactsAdmin.css";
import { getContacts } from "../../services/adminService";
import { Search } from "lucide-react";

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      console.log("CONTACT RESPONSE:", data);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.contacts)
        ? data.contacts
        : [];

      setContacts(list);
      setFiltered(list);
    } catch (err) {
      console.error("Error loading contacts:", err);
      setContacts([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH FILTER
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(contacts);
      return;
    }

    const s = searchTerm.toLowerCase();

    const result = contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.message?.toLowerCase().includes(s)
    );

    setFiltered(result);
  }, [searchTerm, contacts]);

  return (
    <div className="admin-contacts-container">
      <div className="admin-header">
        <h2>Contact Messages</h2>
        <p className="subtitle">
          View all messages submitted through the website
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="contacts-search-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="count-chip">Total: {filtered.length}</div>
      </div>

      {/* TABLE OR LOADER */}
      {loading ? (
        <div className="skeleton-table-wrapper">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row"></div>
          ))}
        </div>
      ) : (
        <div className="contacts-table-wrapper">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Received</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-records">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                      className="no-data-img"
                      alt="no data"
                    />
                    <p>No contact messages found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td className="msg-col">{c.message}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
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

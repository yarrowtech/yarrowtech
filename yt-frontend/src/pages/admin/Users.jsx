

// import React, { useEffect, useState } from "react";
// import "../../styles/UsersAdmin.css";
// import { getERPUsers } from "../../services/adminService";

// export default function Users() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     loadUsers();
//   }, []);

//  const loadUsers = async () => {
//   const data = await getERPUsers();
//   setUsers(Array.isArray(data) ? data : []);
// };


//   const deleteUser = (id) => {
//     alert("Delete API not implemented yet.");
//   };

//   return (
//     <div className="admin-users-container">
//       <div className="admin-header">
//         <h2>User Management</h2>
//         <p className="subtitle">Total Users: {users.length}</p>
//       </div>

//       <div className="users-table-wrapper">
//         <table className="users-table">
//           <thead>
//             <tr>
//               <th>Email</th>
//               <th>Role</th>
//               <th>Status</th>
//               <th>Joined</th>
//             </tr>
//           </thead>

//           <tbody>
//             {users.map((u) => (
//               <tr key={u._id}>
//                 <td>{u.email}</td>

//                 <td>
//                   <span className={`role-badge role-${u.role}`}>
//                     {u.role}
//                   </span>
//                 </td>

//                 <td>
//                   <span className="status-badge status-active">
//                     active
//                   </span>
//                 </td>

//                 <td>{new Date(u.createdAt).toLocaleDateString()}</td>

//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// }





import React, { useEffect, useState } from "react";
import "../../styles/UsersAdmin.css";
import { toast } from "react-hot-toast";

import {
  getERPUsers,
  createERPUser,
  toggleUserStatus,
  resetUserPassword,
} from "../../services/adminService";

export default function Users() {
  const [users, setUsers] = useState([]);

  /* ================= CREATE USER ================= */
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "manager",
  });

  /* ================= RESET PASSWORD MODAL ================= */
  const [resetUser, setResetUser] = useState(null);
  const [resetPwd, setResetPwd] = useState({
    password: "",
    confirm: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getERPUsers();
    setUsers(Array.isArray(data) ? data : []);
  };

  /* ================= CREATE USER ================= */
  const handleCreateUser = async () => {
    if (!form.email || !form.password) {
      toast.error("Email and password required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await createERPUser({
        email: form.email.toLowerCase(),
        password: form.password,
        role: form.role,
      });

      toast.success("User created successfully");
      setForm({
        email: "",
        password: "",
        confirmPassword: "",
        role: "manager",
      });
      loadUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const handleToggleStatus = async (id) => {
    await toggleUserStatus(id);
    toast.success("User status updated");
    loadUsers();
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async () => {
    if (resetPwd.password !== resetPwd.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    await resetUserPassword(resetUser._id, resetPwd.password);
    toast.success("Password reset");

    setResetUser(null);
    setResetPwd({ password: "", confirm: "" });
  };

  return (
    <div className="admin-users-container">

      {/* ================= CREATE USER CARD ================= */}
      <div className="create-user-card">
        <h3>Create Manager / Tech Lead</h3>

        <div className="create-user-form">
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="manager">Manager</option>
            <option value="techlead">Tech Lead</option>
          </select>

          <button onClick={handleCreateUser}>
            Create User
          </button>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="admin-header">
        <h2>User Management</h2>
        <p className="subtitle">Total Users: {users.length}</p>
      </div>

      {/* ================= USERS TABLE ================= */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>

                <td>
                  <span className={`role-badge role-${u.role}`}>
                    {u.role}
                  </span>
                </td>

                <td>
                  <button
                    className={`status-toggle ${u.status}`}
                    onClick={() => handleToggleStatus(u._id)}
                  >
                    {u.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>

                <td>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>

                <td>
                  <button
                    className="reset-btn"
                    onClick={() => setResetUser(u)}
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= RESET PASSWORD MODAL ================= */}
      {resetUser && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Reset Password</h3>
            <p>{resetUser.email}</p>

            <input
              type="password"
              placeholder="New Password"
              value={resetPwd.password}
              onChange={(e) =>
                setResetPwd({ ...resetPwd, password: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={resetPwd.confirm}
              onChange={(e) =>
                setResetPwd({ ...resetPwd, confirm: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={handleResetPassword}>
                Update Password
              </button>
              <button onClick={() => setResetUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

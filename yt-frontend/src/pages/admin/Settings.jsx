// import React from 'react';
// import '../../styles/Admin.css';

// export default function Settings() {
//   return (
//     <div className="admin-page">
//       <h1>Settings</h1>
//       <div className="card" style={{ maxWidth: 700 }}>
//         <h3>Admin Profile</h3>
//         <p>Update name, email, and password (form implementation for backend connection later).</p>
//       </div>
//     </div>
//   );
// }




import React, { useState } from "react";
import "../../styles/Admin.css";
import { updateAdminProfile } from "../../services/adminService";

export default function Settings() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateProfile = async () => {
    try {
      const res = await updateAdminProfile(form);
      alert("Profile updated!");
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="admin-page">
      <h1>Settings</h1>

      <div className="card" style={{ maxWidth: 700 }}>
        <h3>Admin Profile</h3>

        <div className="settings-form">
          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="password" placeholder="New Password" onChange={handleChange} />

          <button onClick={updateProfile} className="save-btn">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

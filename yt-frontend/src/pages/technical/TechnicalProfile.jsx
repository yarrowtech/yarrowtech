import React, { useEffect, useState } from "react";
import "../../styles/technicalProfile.css";
import {
  getTechLeadProfile,
  updateTechLeadProfile,
} from "../../services/techleadService";
import { toast } from "react-hot-toast";

export default function TechnicalProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getTechLeadProfile();

      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        designation: data.designation || "Technical Lead",
        bio: data.bio || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      await updateTechLeadProfile(form);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <p className="muted">Loading profile...</p>;

  return (
    <div className="technical-profile">
      <h2 className="page-title">Technical Lead Profile</h2>

      <div className="profile-card">
        <div className="profile-left">
          <img
            src="https://avatar.iran.liara.run/public"
            alt="Profile"
            className="profile-img"
          />
          <h3 className="profile-name">{form.name || "Technical Lead"}</h3>
          <p className="profile-role">{form.designation}</p>
        </div>

        <div className="profile-right">
          <div className="field-group">
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>Email</label>
            <input value={form.email} disabled />
          </div>

          <div className="field-group">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>Designation</label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>Bio</label>
            <textarea
              name="bio"
              rows="4"
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          <button className="save-btn" onClick={saveProfile}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

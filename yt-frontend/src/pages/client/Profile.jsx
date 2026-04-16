import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/ClientProfile.css";

const API_URL = "http://localhost:5000/api/erp/client/profile";

export default function ClientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("erp_token");

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data);
    } catch (err) {
      console.error("❌ PROFILE FETCH ERROR:", err);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/erp/login";
      } else {
        alert("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  /* ================= UPDATE PROFILE ================= */
  const updateProfile = async () => {
    try {
      setSaving(true);

      await axios.put(
        API_URL,
        {
          phone: profile.phone,
          address: profile.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Profile updated successfully!");
      fetchProfile(); // 🔥 re-sync with backend

    } catch (err) {
      console.error("❌ PROFILE UPDATE ERROR:", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return <p style={{ padding: "20px" }}>Loading profile...</p>;
  }

  if (!profile) {
    return <p style={{ padding: "20px" }}>No profile data</p>;
  }

  return (
    <div className="client-profile-container">
      <div className="client-header">
        <h2>My Profile</h2>
        <p className="subtitle">
          View or update your personal contact details
        </p>
      </div>

      <div className="client-profile-card">
        <div className="client-profile-form">

          {/* NON-EDITABLE */}
          <div className="form-group">
            <label>Name</label>
            <input value={profile.name} disabled />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={profile.email} disabled />
          </div>

          <div className="form-group">
            <label>Company</label>
            <input value={profile.company || "-"} disabled />
          </div>

          <div className="form-group">
            <label>Client ID</label>
            <input value={profile.clientId || "-"} disabled />
          </div>

          <div className="form-group">
            <label>Registered On</label>
            <input
              value={new Date(profile.createdAt).toLocaleDateString()}
              disabled
            />
          </div>

          {/* EDITABLE */}
          <div className="form-group">
            <label>Phone</label>
            <input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              rows="3"
              value={profile.address || ""}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />
          </div>

          <button
            className="client-profile-save-btn"
            onClick={updateProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Hash,
  Calendar,
  Save,
} from "lucide-react";

import { clientService } from "../../services/clientService";
import "../../styles/ClientProfile.css";

function InfoRow({ icon, label, value }) {
  return (
    <div className="cp-info-row">
      <div className="cp-info-icon">{icon}</div>
      <div className="cp-info-body">
        <span className="cp-info-label">{label}</span>
        <span className="cp-info-value">{value || "-"}</span>
      </div>
    </div>
  );
}

export default function ClientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [phone, setPhone]       = useState("");
  const [address, setAddress]   = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await clientService.profile();
      setProfile(data);
      setPhone(data.phone || "");
      setAddress(data.address || "");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await clientService.updateProfile({ phone, address });
      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">Loading profile...</p>;
  if (!profile) return <p className="muted">No profile data.</p>;

  const initials = (profile.name || "C")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="cpr-page">
      {/* Header */}
      <div className="cpr-header">
        <div className="cpr-header-icon"><User size={26} /></div>
        <div>
          <h2>My Profile</h2>
          <p>View your account details and update contact information.</p>
        </div>
      </div>

      <div className="cpr-body">
        {/* Left — Account Info */}
        <div className="cpr-card">
          {/* Avatar */}
          <div className="cpr-avatar-block">
            <div className="cpr-avatar">{initials}</div>
            <div>
              <div className="cpr-avatar-name">{profile.name}</div>
              <div className="cpr-avatar-email">{profile.email}</div>
            </div>
          </div>

          <div className="cpr-divider" />

          <h4 className="cpr-section-title">Account Details</h4>

          <div className="cpr-info-list">
            <InfoRow icon={<User size={15} />}      label="Full Name"      value={profile.name} />
            <InfoRow icon={<Mail size={15} />}      label="Email"          value={profile.email} />
            <InfoRow icon={<Building2 size={15} />} label="Company"        value={profile.company} />
            <InfoRow icon={<Hash size={15} />}      label="Client ID"      value={profile.clientId} />
            <InfoRow
              icon={<Calendar size={15} />}
              label="Registered On"
              value={profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })
                : "-"}
            />
          </div>
        </div>

        {/* Right — Edit Contact */}
        <div className="cpr-card">
          <h4 className="cpr-section-title" style={{ marginBottom: 22 }}>Edit Contact Info</h4>

          <div className="cpr-field">
            <label>
              <Phone size={14} />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="cpr-field">
            <label>
              <MapPin size={14} />
              Address
            </label>
            <textarea
              rows={4}
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button
            className="cpr-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Settings, User, Lock, ShieldCheck,
  Mail, Phone, MapPin, Calendar, Save, Eye, EyeOff,
} from "lucide-react";
import {
  getManagerProfile,
  updateManagerProfile,
  changeManagerPassword,
} from "../../services/managerService";
import "../../styles/AdminSettings.css";

export default function ManagerSettings() {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [form, setForm] = useState({ name: "", address: "", mobileNumber: "" });

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getManagerProfile()
      .then((data) => {
        setProfile(data);
        setForm({ name: data.name || "", address: data.address || "", mobileNumber: data.mobileNumber || "" });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateManagerProfile(form);
      setProfile(res.user);
      const stored = JSON.parse(localStorage.getItem("erp_user") || "{}");
      localStorage.setItem("erp_user", JSON.stringify({ ...stored, name: res.user.name }));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pw.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPwSaving(true);
    try {
      await changeManagerPassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success("Password changed successfully");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="as-loading">
        <div className="as-spinner" />
        <span>Loading settings...</span>
      </div>
    );
  }

  const initials = (profile?.name || profile?.email || "M")[0].toUpperCase();
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="as-page">

      {/* ── Header ── */}
      <div className="as-header">
        <div className="as-header-icon"><Settings size={24} /></div>
        <div>
          <h2>Settings</h2>
          <p>Manage your manager profile and account security</p>
        </div>
      </div>

      <div className="as-grid">

        {/* ── Profile Card ── */}
        <div className="as-card">
          <div className="as-card-head">
            <div className="as-card-head-icon"><User size={17} /></div>
            <h3>Profile Information</h3>
          </div>

          <div className="as-avatar-row">
            <div className="as-avatar">{initials}</div>
            <div className="as-avatar-info">
              <h4>{profile?.name || "—"}</h4>
              <p>{profile?.email}</p>
              <div className="as-role-badge">
                <ShieldCheck size={12} />
                Manager
              </div>
            </div>
          </div>

          <hr className="as-divider" />

          <form onSubmit={handleProfileSave}>
            <div className="as-fields">
              <div className="as-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="as-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="as-input--readonly"
                />
              </div>

              <div className="as-field">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                />
              </div>

              <div className="as-field">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Your address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            <div className="as-actions" style={{ marginTop: 18 }}>
              <button type="submit" className="as-btn as-btn--primary" disabled={saving}>
                <Save size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Account Info Card ── */}
        <div className="as-card">
          <div className="as-card-head">
            <div className="as-card-head-icon"><ShieldCheck size={17} /></div>
            <h3>Account Info</h3>
          </div>

          <div className="as-info-list">
            <div className="as-info-row">
              <Mail size={17} />
              <div className="as-info-row-body">
                <span>Email</span>
                <strong>{profile?.email || "—"}</strong>
              </div>
            </div>

            <div className="as-info-row">
              <Phone size={17} />
              <div className="as-info-row-body">
                <span>Mobile</span>
                <strong>{profile?.mobileNumber || "Not set"}</strong>
              </div>
            </div>

            <div className="as-info-row">
              <MapPin size={17} />
              <div className="as-info-row-body">
                <span>Address</span>
                <strong>{profile?.address || "Not set"}</strong>
              </div>
            </div>

            <div className="as-info-row">
              <ShieldCheck size={17} />
              <div className="as-info-row-body">
                <span>Role</span>
                <strong style={{ textTransform: "capitalize" }}>{profile?.role || "manager"}</strong>
              </div>
            </div>

            <div className="as-info-row">
              <Calendar size={17} />
              <div className="as-info-row-body">
                <span>Member Since</span>
                <strong>{joinedDate}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div className="as-card as-card--wide">
          <div className="as-card-head">
            <div className="as-card-head-icon"><Lock size={17} /></div>
            <h3>Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="as-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div className="as-field">
                <label>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={pw.currentPassword}
                    onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--erp-text-muted)", display: "flex" }}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="as-field">
                <label>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={pw.newPassword}
                    onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--erp-text-muted)", display: "flex" }}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {pw.newPassword.length > 0 && pw.newPassword.length < 6 && (
                  <p className="as-pw-hint">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="as-field">
                <label>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={pw.confirmPassword}
                    onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--erp-text-muted)", display: "flex" }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {pw.confirmPassword.length > 0 && pw.newPassword !== pw.confirmPassword && (
                  <p className="as-pw-hint" style={{ color: "#ef4444" }}>Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="as-actions" style={{ marginTop: 18 }}>
              <button type="submit" className="as-btn as-btn--primary" disabled={pwSaving}>
                <Lock size={15} />
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

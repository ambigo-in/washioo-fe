import React, { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../context/useAuth";
import { updateProfile } from "../../api/authApi";
import "./AdminSettings.css";

interface SettingsFormData {
  full_name: string;
  email: string;
  phone: string;
}

export default function AdminSettings() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<SettingsFormData>({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser.user);
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError("Failed to update settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="settings-page">
        <div className="settings-section">
          <h3>Profile Settings</h3>
          <div className="settings-card">
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="settings-section">
          <h3>Platform Information</h3>
          <div className="settings-card">
            <div className="info-row">
              <span className="info-label">Platform Name</span>
              <span className="info-value">Washioo</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Admin Role</span>
              <span className="info-value">Super Admin</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account Actions</h3>
          <div className="settings-card">
            <div className="action-row">
              <div className="action-info">
                <h4>Logout</h4>
                <p>Sign out from your account</p>
              </div>
              <button className="btn-danger">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

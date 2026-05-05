import React, { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAuth } from "../../context/useAuth";
import { fetchCleanerProfile } from "../../api/cleanerApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfileRequest } from "../../store/slices/authSlice";
import type { CleanerProfile as CleanerProfileData } from "../../types/cleanerTypes";
import "./CleanerProfile.css";

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
}

export default function CleanerProfile() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { user, setUser } = useAuth();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [cleanerProfile, setCleanerProfile] = useState<CleanerProfileData | null>(
    null,
  );

  React.useEffect(() => {
    fetchCleanerProfile()
      .then((response) => setCleanerProfile(response.cleaner))
      .catch(() => setCleanerProfile(null));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const updatedUser = await dispatch(updateProfileRequest(formData)).unwrap();
      setUser(updatedUser.user);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">{user?.full_name?.charAt(0) || "C"}</div>
            <div className="profile-info">
              <h2>{user?.full_name || "Cleaner"}</h2>
              <p className="user-email">{user?.email || "No email"}</p>
              <p className="user-phone">{user?.phone}</p>
            </div>
            <button
              className="btn-edit"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="profile-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              {isEditing && (
                <div className="form-actions">
                  <LoadingButton
                    type="submit"
                    className="btn-primary"
                    isLoading={loading}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </LoadingButton>
                </div>
              )}
            </form>
          </div>

          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">Cleaner</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="profile-section">
            <h3>Identity Verification</h3>
            <div className="info-row">
              <span className="info-label">Aadhaar</span>
              <span className="info-value">
                {cleanerProfile?.has_aadhaar
                  ? cleanerProfile.aadhaar_number_masked || "Provided"
                  : "Not provided"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Driving License</span>
              <span className="info-value">
                {cleanerProfile?.has_driving_license
                  ? cleanerProfile.driving_license_number_masked || "Provided"
                  : "Not provided"}
              </span>
            </div>
            <p className="profile-note">
              Identity details are read-only and shown in masked format for
              security.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

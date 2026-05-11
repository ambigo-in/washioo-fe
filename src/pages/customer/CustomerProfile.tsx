import React, { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAuth } from "../../context/useAuth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfileRequest } from "../../store/slices/authSlice";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatDisplayDate } from "../../utils/dateTimeUtils";
import "./CustomerProfile.css";

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
}

export default function CustomerProfile() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
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
      setSuccess(t("profile.updated"));
      setIsEditing(false);
    } catch (err) {
      setError(t("profile.failed"));
      console.error(err);
    }
  };

  return (
    <DashboardLayout title={t("profile.myProfile")}>
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">{user?.full_name?.charAt(0) || "U"}</div>
            <div className="profile-info">
              <h2>{user?.full_name || t("common.user")}</h2>
              <p className="user-email">{user?.email || t("profile.noEmail")}</p>
              <p className="user-phone">{user?.phone}</p>
            </div>
            <button
              className="btn-edit"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? t("profile.cancel") : t("profile.editProfile")}
            </button>
          </div>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="profile-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t("profile.fullName")}</label>
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
                <label>{t("profile.email")}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>{t("profile.phoneNumber")}</label>
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
                    loadingText={t("profile.saving")}
                  >
                    {t("profile.saveChanges")}
                  </LoadingButton>
                </div>
              )}
            </form>
          </div>

          <div className="profile-section">
            <h3>{t("profile.accountInformation")}</h3>
            <div className="info-row">
              <span className="info-label">{t("profile.role")}</span>
              <span className="info-value">Customer</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t("profile.memberSince")}</span>
              <span className="info-value">
                {user?.created_at
                  ? formatDisplayDate(user.created_at)
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

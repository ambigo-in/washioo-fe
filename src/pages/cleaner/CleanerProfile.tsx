import React, { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAuth } from "../../context/useAuth";
import { fetchCleanerProfile, verifyCleanerIdentity } from "../../api/cleanerApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfileRequest } from "../../store/slices/authSlice";
import type { CleanerProfile as CleanerProfileData } from "../../types/cleanerTypes";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatDisplayDate } from "../../utils/dateTimeUtils";
import "./CleanerProfile.css";

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
}

interface VerificationModalState {
  isOpen: boolean;
  type: "aadhaar" | "license" | null;
}

const hasFullIdentityValue = (value?: string | null) =>
  !!value && !value.includes("*");

export default function CleanerProfile() {
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
  const [cleanerProfile, setCleanerProfile] =
    useState<CleanerProfileData | null>(null);
  const [verificationModal, setVerificationModal] =
    useState<VerificationModalState>({
      isOpen: false,
      type: null,
    });
  const [verificationPassword, setVerificationPassword] = useState("");
  const [verifyingDocument, setVerifyingDocument] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState({
    aadhaar: false,
    license: false,
  });

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
      const updatedUser = await dispatch(
        updateProfileRequest(formData),
      ).unwrap();
      setUser(updatedUser.user);
      setSuccess(t("profile.updated"));
      setIsEditing(false);
    } catch (err) {
      setError(t("profile.failed"));
      console.error(err);
    }
  };

  const handleRequestFullDetails = (type: "aadhaar" | "license") => {
    setVerificationModal({ isOpen: true, type });
    setVerificationPassword("");
  };

  const handleVerifyAndShow = async () => {
    if (!verificationPassword.trim()) {
      setError(t("profile.verifyPlaceholder"));
      return;
    }

    setVerifyingDocument(true);
    try {
      const enteredDigits = verificationPassword.replace(/\D/g, "");
      const response = await verifyCleanerIdentity(enteredDigits);
      const fullValue =
        verificationModal.type === "aadhaar"
          ? response.cleaner.aadhaar_number
          : response.cleaner.driving_license_number;
      setCleanerProfile(response.cleaner);

      if (!hasFullIdentityValue(fullValue)) {
        setVerificationModal({ isOpen: false, type: null });
        setError(t("profile.fullDetailsUnavailable"));
        setSuccess("");
        return;
      }

      if (verificationModal.type === "aadhaar") {
        setShowFullDetails((prev) => ({ ...prev, aadhaar: true }));
      } else if (verificationModal.type === "license") {
        setShowFullDetails((prev) => ({ ...prev, license: true }));
      }

      setVerificationModal({ isOpen: false, type: null });
      setSuccess(t("profile.detailsDisplayed"));
      setError("");
    } catch (err) {
      setError(t("profile.verifyFailed"));
    } finally {
      setVerifyingDocument(false);
    }
  };

  const closeVerificationModal = () => {
    setVerificationModal({ isOpen: false, type: null });
    setVerificationPassword("");
    setError("");
  };

  const aadhaarDisplay =
    showFullDetails.aadhaar &&
    hasFullIdentityValue(cleanerProfile?.aadhaar_number)
      ? cleanerProfile?.aadhaar_number
      : cleanerProfile?.aadhaar_number_masked || t("profile.provided");
  const licenseDisplay =
    showFullDetails.license &&
    hasFullIdentityValue(cleanerProfile?.driving_license_number)
      ? cleanerProfile?.driving_license_number
      : cleanerProfile?.driving_license_number_masked || t("profile.provided");

  return (
    <DashboardLayout title={t("profile.myProfile")}>
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">{user?.full_name?.charAt(0) || "C"}</div>
            <div className="profile-info">
              <h2>{user?.full_name || t("common.cleaner")}</h2>
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
              <span className="info-value">{t("common.cleaner")}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t("profile.memberSince")}</span>
              <span className="info-value">
                {user?.created_at
                  ? formatDisplayDate(user.created_at)
                  : t("common.notAvailable")}
              </span>
            </div>
          </div>

          <div className="profile-section">
            <h3>{t("profile.identityVerification")}</h3>
            <div className="info-row">
              <span className="info-label">{t("profile.aadhaar")}</span>
              <span className="info-value">
                {cleanerProfile?.has_aadhaar ? (
                  <span>
                    {aadhaarDisplay}
                    {!showFullDetails.aadhaar && (
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => handleRequestFullDetails("aadhaar")}
                      >
                        {t("profile.view")}
                      </button>
                    )}
                  </span>
                ) : (
                  t("profile.notProvided")
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">{t("profile.drivingLicense")}</span>
              <span className="info-value">
                {cleanerProfile?.has_driving_license ? (
                  <span>
                    {licenseDisplay}
                    {!showFullDetails.license && (
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => handleRequestFullDetails("license")}
                      >
                        {t("profile.view")}
                      </button>
                    )}
                  </span>
                ) : (
                  t("profile.notProvided")
                )}
              </span>
            </div>
            <p className="profile-note">
              {t("profile.identityNote")}
            </p>

            {verificationModal.isOpen && (
              <div className="verification-modal-overlay">
                <div className="verification-modal">
                  <h3>{t("profile.verifyIdentity")}</h3>
                  <p>{t("profile.verifyDigits")}</p>
                  {error && <div className="error-message">{error}</div>}
                  <input
                    type="password"
                    placeholder={t("profile.verifyPlaceholder")}
                    value={verificationPassword}
                    onChange={(e) =>
                      setVerificationPassword(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={4}
                    inputMode="numeric"
                  />
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={closeVerificationModal}
                      disabled={verifyingDocument}
                    >
                      {t("profile.cancel")}
                    </button>
                    <LoadingButton
                      isLoading={verifyingDocument}
                      loadingText={t("profile.verifying")}
                      type="button"
                      className="btn-verify"
                      onClick={handleVerifyAndShow}
                    >
                      {t("profile.verify")}
                    </LoadingButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

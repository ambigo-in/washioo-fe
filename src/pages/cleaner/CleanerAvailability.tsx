import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadCleanerProfile,
  setCleanerAvailability,
  setCleanerLocation,
} from "../../store/slices/cleanerSlice";
import { getCurrentCoordinates } from "../../utils/locationUtils";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CleanerAvailability.css";

export default function CleanerAvailability() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { profile, loading } = useAppSelector((state) => state.cleaner);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(loadCleanerProfile());
  }, [dispatch]);

  const handleAvailabilityChange = async (
    status: "offline" | "available" | "busy",
  ) => {
    if (!profile?.approval_status || profile.approval_status !== "approved") {
      setMessage(t("availability.mustBeApproved"));
      return;
    }

    setMessage("");
    try {
      if (status === "available") {
        const coordinates = await getCurrentCoordinates();
        await dispatch(setCleanerLocation(coordinates)).unwrap();
      }
      await dispatch(setCleanerAvailability(status)).unwrap();
      setMessage(t("availability.updateSuccess"));
    } catch {
      setMessage(t("availability.updateFailed"));
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={t("nav.availability")}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t("availability.loading")}</p>
        </div>
      </DashboardLayout>
    );
  }

  const isApproved = profile?.approval_status === "approved";

  return (
    <DashboardLayout title={t("availability.manage")}>
      <div className="cleaner-availability">
        <div className="status-info">
          <div className="info-card">
            <h3>{t("availability.currentStatus")}</h3>
            <div className="current-status">
              <span className={`status-badge ${profile?.availability_status}`}>
                {profile?.availability_status || "offline"}
              </span>
            </div>
          </div>
          <div className="info-card">
            <h3>{t("availability.approvalStatus")}</h3>
            <div className="approval-status">
              <span className={`status-badge ${profile?.approval_status}`}>
                {profile?.approval_status || "pending"}
              </span>
            </div>
            {!isApproved && (
              <p className="warning-text">{t("availability.approvalWarning")}</p>
            )}
          </div>
        </div>

        <div className="availability-options">
          <h3>{t("availability.setAvailability")}</h3>
          <p className="subtitle">{t("availability.subtitle")}</p>

          <div className="options-grid">
            <LoadingButton
              className={`option-card ${
                profile?.availability_status === "offline" ? "active" : ""
              }`}
              onClick={() => handleAvailabilityChange("offline")}
              isLoading={loading}
              loadingText={t("profile.saving")}
            >
              <div className="option-icon">○</div>
              <h4>{t("availability.offline")}</h4>
              <p>{t("availability.offlineHint")}</p>
            </LoadingButton>

            <LoadingButton
              className={`option-card ${
                profile?.availability_status === "available" ? "active" : ""
              } ${!isApproved ? "disabled" : ""}`}
              onClick={() =>
                isApproved && handleAvailabilityChange("available")
              }
              disabled={!isApproved}
              isLoading={loading}
              loadingText={t("profile.saving")}
            >
              <div className="option-icon">✓</div>
              <h4>{t("availability.available")}</h4>
              <p>{t("availability.availableHint")}</p>
              {!isApproved && (
                <span className="disabled-text">
                  {t("availability.notApproved")}
                </span>
              )}
            </LoadingButton>

            <LoadingButton
              className={`option-card ${
                profile?.availability_status === "busy" ? "active" : ""
              } ${!isApproved ? "disabled" : ""}`}
              onClick={() => isApproved && handleAvailabilityChange("busy")}
              disabled={!isApproved}
              isLoading={loading}
              loadingText={t("profile.saving")}
            >
              <div className="option-icon">↻</div>
              <h4>{t("availability.busy")}</h4>
              <p>{t("availability.busyHint")}</p>
              {!isApproved && (
                <span className="disabled-text">
                  {t("availability.notApproved")}
                </span>
              )}
            </LoadingButton>
          </div>

          {message && (
            <div
              className={`message ${
                message === t("availability.updateSuccess") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="guidelines">
          <h3>{t("availability.guidelines")}</h3>
          <ul>
            <li>{t("availability.guidelineAvailable")}</li>
            <li>{t("availability.guidelineApproved")}</li>
            <li>{t("availability.guidelineBusy")}</li>
            <li>{t("availability.guidelineOffline")}</li>
            <li>{t("availability.guidelineUpdated")}</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

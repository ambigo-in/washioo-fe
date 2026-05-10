import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadCleanerAssignments,
  loadCleanerProfile,
  setCleanerAvailability,
  setCleanerLocation,
} from "../../store/slices/cleanerSlice";
import CleanerEarnings from "./CleanerEarnings";
import type { CleanerProfile } from "../../types/cleanerTypes";
import { formatAddress } from "../../utils/addressUtils";
import { getCurrentCoordinates } from "../../utils/locationUtils";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CleanerDashboard.css";

type AvailabilityStatus = CleanerProfile["availability_status"];

const availabilityOptions: AvailabilityStatus[] = [
  "offline",
  "available",
  "busy",
];

const dashboardStatusPriority: Record<string, number> = {
  assigned: 0,
  accepted: 1,
  in_progress: 2,
  completed: 3,
  rejected: 4,
  cancelled: 5,
};

export default function CleanerDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { profile, assignments, loading } = useAppSelector(
    (state) => state.cleaner,
  );
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [updatingAvailability, setUpdatingAvailability] =
    useState<AvailabilityStatus | null>(null);

  useEffect(() => {
    dispatch(loadCleanerProfile());
    dispatch(loadCleanerAssignments(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (
      profile?.approval_status !== "approved" ||
      profile.availability_status !== "available"
    ) {
      return;
    }

    let active = true;
    const updateLocation = async () => {
      try {
        const coordinates = await getCurrentCoordinates();
        if (active) {
          void dispatch(setCleanerLocation(coordinates));
        }
      } catch {
        // Location is best-effort here; availability page shows explicit errors.
      }
    };

    void updateLocation();
    const timer = window.setInterval(updateLocation, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [dispatch, profile?.approval_status, profile?.availability_status]);

  const pendingJobs = assignments.filter(
    (assignment) => assignment.assignment_status === "assigned",
  );
  const activeJobs = assignments.filter((assignment) =>
    ["accepted", "in_progress"].includes(assignment.assignment_status),
  );
  const completedJobs = assignments.filter(
    (assignment) => assignment.assignment_status === "completed",
  );
  const isApproved = profile?.approval_status === "approved";
  const dashboardAssignments = [...assignments]
    .filter((assignment) =>
      ["assigned", "accepted", "in_progress", "completed"].includes(
        assignment.assignment_status,
      ),
    )
    .sort((left, right) => {
      const priority =
        (dashboardStatusPriority[left.assignment_status] ?? 99) -
        (dashboardStatusPriority[right.assignment_status] ?? 99);
      if (priority !== 0) return priority;
      return (
        new Date(right.assigned_at).getTime() -
        new Date(left.assigned_at).getTime()
      );
    });

  const getAssignmentRoute = (status: string) =>
    `/cleaner/assignments?status=${encodeURIComponent(status || "all")}`;

  const getAssignmentStatusLabel = (status: string) =>
    t(status === "in_progress" ? "booking.inProgress" : `booking.${status}`);

  const handleAvailabilityChange = async (status: AvailabilityStatus) => {
    if (!isApproved) {
      setAvailabilityMessage(t("availability.mustBeApproved"));
      return;
    }

    setAvailabilityMessage("");
    setUpdatingAvailability(status);
    try {
      if (status === "available") {
        const coordinates = await getCurrentCoordinates();
        await dispatch(setCleanerLocation(coordinates)).unwrap();
      }
      await dispatch(setCleanerAvailability(status)).unwrap();
      setAvailabilityMessage(t("availability.updateSuccess"));
    } catch {
      setAvailabilityMessage(t("availability.updateFailed"));
    } finally {
      setUpdatingAvailability(null);
    }
  };

  if (loading && !assignments.length) {
    return (
      <DashboardLayout title={t("common.dashboard")}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t("common.loadingDashboard")}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("common.dashboard")}>
      <div className="cleaner-dashboard">
        <section className="profile-status">
          <div className="status-card">
            <div className="status-header">
              <h2>{t("cleaner.workStatus")}</h2>
              <span className={`status-badge ${profile?.availability_status}`}>
                {profile?.availability_status || "offline"}
              </span>
            </div>
            <div className="status-details">
              <div className="detail-item">
                <span className="label">{t("cleaner.approval")}</span>
                <span className={`value ${profile?.approval_status}`}>
                  {profile?.approval_status || "pending"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">{t("cleaner.jobsCompleted")}</span>
                <span className="value">
                  {profile?.total_jobs_completed ?? completedJobs.length}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">{t("cleaner.rating")}</span>
                <span className="value">{profile?.rating ?? 0}</span>
              </div>
            </div>
            <div className="availability-inline">
              <div
                className="availability-switcher"
                aria-label={t("availability.setAvailability")}
              >
                {availabilityOptions.map((status) => (
                  <LoadingButton
                    key={status}
                    type="button"
                    className={`availability-switch ${
                      profile?.availability_status === status ? "active" : ""
                    } ${status}`}
                    onClick={() => handleAvailabilityChange(status)}
                    disabled={
                      Boolean(updatingAvailability) ||
                      profile?.availability_status === status
                    }
                    isLoading={updatingAvailability === status}
                    loadingText={t("profile.saving")}
                  >
                    {t(`availability.${status}`)}
                  </LoadingButton>
                ))}
              </div>
              <Link to="/cleaner/availability" className="manage-btn">
                {t("actions.manageAvailability")}
              </Link>
            </div>
            {availabilityMessage && (
              <p
                className={`availability-message ${
                  availabilityMessage === t("availability.updateSuccess")
                    ? "success"
                    : "error"
                }`}
              >
                {availabilityMessage}
              </p>
            )}
          </div>
        </section>

        {pendingJobs.length > 0 && (
          <section className="today-live-services">
            <div className="section-header">
              <h2>{t("cleaner.liveServices")}</h2>
              <span className="live-badge">{t("common.active")}</span>
            </div>
            <div className="live-services-list">
              {pendingJobs.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={getAssignmentRoute(assignment.assignment_status)}
                  className={`live-service-card ${assignment.assignment_status}`}
                >
                  <div className="live-indicator"></div>
                  <div className="live-service-info">
                    <h3>{assignment.booking.service_name}</h3>
                    <p className="customer-name">
                      {assignment.booking.customer_name}
                    </p>
                    <p className="booking-time">
                      {assignment.booking.scheduled_date} at{" "}
                      {assignment.booking.scheduled_time.slice(0, 5)}
                    </p>
                    <p className="booking-location">
                      {formatAddress(assignment.booking.address)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="pending-assignments">
          <div className="section-header">
            <h2>{t("cleaner.assignedBookings")}</h2>
            <Link to="/cleaner/assignments" className="view-all">
              {t("actions.viewAll")}
            </Link>
          </div>
          {dashboardAssignments.length ? (
            <div className="assignments-list">
              {dashboardAssignments.slice(0, 4).map((assignment) => (
                <Link
                  key={assignment.id}
                  className={`assignment-card dashboard-assignment-link ${assignment.assignment_status}`}
                  to={getAssignmentRoute(
                    assignment.assignment_status,
                  )}
                >
                  <div className="assignment-info">
                    {assignment.assignment_status === "assigned" && (
                      <span className="assigned-callout-label">
                        {t("cleaner.newAssignments")}
                      </span>
                    )}
                    <div className="assignment-title-row">
                      <h4>{assignment.booking.service_name}</h4>
                      <span className="assignment-status-chip">
                        {getAssignmentStatusLabel(
                          assignment.assignment_status,
                        )}
                      </span>
                    </div>
                    <p className="booking-ref">
                      {assignment.booking.booking_reference}
                    </p>
                    <p className="booking-date">
                      {assignment.booking.scheduled_date} at{" "}
                      {assignment.booking.scheduled_time.slice(0, 5)}
                    </p>
                    <p className="customer-address">
                      {formatAddress(assignment.booking.address)}
                    </p>
                  </div>
                  <span className="btn-primary">{t("actions.viewDetails")}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{t("cleaner.noAssignments")}</p>
            </div>
          )}
        </section>

        <section className="quick-stats">
          <h2>{t("cleaner.todayAtGlance")}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{pendingJobs.length}</div>
              <div className="stat-label">{t("cleaner.newAssignments")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{activeJobs.length}</div>
              <div className="stat-label">{t("cleaner.activeJobs")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{completedJobs.length}</div>
              <div className="stat-label">{t("cleaner.completed")}</div>
            </div>
          </div>
        </section>

        <CleanerEarnings />

        {false && pendingJobs.length > 0 && (
          <section className="today-live-services">
            <div className="section-header">
              <h2>{t("cleaner.liveServices")}</h2>
              <span className="live-badge">{t("common.active")}</span>
            </div>
            <div className="live-services-list">
              {pendingJobs.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={getAssignmentRoute(
                    assignment.assignment_status,
                  )}
                  className={`live-service-card ${assignment.assignment_status}`}
                >
                  <div className="live-indicator"></div>
                  <div className="live-service-info">
                    <h3>{assignment.booking.service_name}</h3>
                    <p className="customer-name">
                      {assignment.booking.customer_name}
                    </p>
                    <p className="booking-time">
                      {assignment.booking.scheduled_date} at{" "}
                      {assignment.booking.scheduled_time.slice(0, 5)}
                    </p>
                    <p className="booking-location">
                      {formatAddress(assignment.booking.address)}
                    </p>
                  </div>
                  <div className="live-action-hint">
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="quick-actions">
          <h2>{t("cleaner.quickActions")}</h2>
          <div className="action-cards">
            <Link to="/cleaner/assignments" className="action-card">
              <div className="action-icon">≡</div>
              <div className="action-content">
                <h3>{t("cleaner.assignments")}</h3>
                <p>{t("cleaner.searchAssignments")}</p>
              </div>
            </Link>
            <Link to="/cleaner/history" className="action-card">
              <div className="action-icon">◷</div>
              <div className="action-content">
                <h3>{t("cleaner.history")}</h3>
                <p>{t("history.noHistoryHint")}</p>
              </div>
            </Link>
            <Link to="/cleaner/profile" className="action-card">
              <div className="action-icon">○</div>
              <div className="action-content">
                <h3>{t("cleaner.profile")}</h3>
                <p>{t("profile.editProfile")}</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

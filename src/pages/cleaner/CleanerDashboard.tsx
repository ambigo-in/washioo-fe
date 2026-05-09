import { useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadCleanerAssignments,
  loadCleanerProfile,
} from "../../store/slices/cleanerSlice";
import CleanerEarnings from "./CleanerEarnings";
import { formatAddress } from "../../utils/addressUtils";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CleanerDashboard.css";

export default function CleanerDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { profile, assignments, loading } = useAppSelector(
    (state) => state.cleaner,
  );

  useEffect(() => {
    dispatch(loadCleanerProfile());
    dispatch(loadCleanerAssignments(undefined));
  }, [dispatch]);

  const pendingJobs = assignments.filter(
    (assignment) => assignment.assignment_status === "assigned",
  );
  const activeJobs = assignments.filter((assignment) =>
    ["accepted", "in_progress"].includes(assignment.assignment_status),
  );
  const completedJobs = assignments.filter(
    (assignment) => assignment.assignment_status === "completed",
  );

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
            <Link to="/cleaner/availability" className="manage-btn">
              {t("actions.manageAvailability")}
            </Link>
          </div>
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

        <section className="pending-assignments">
          <div className="section-header">
            <h2>{t("cleaner.assignedBookings")}</h2>
            <Link to="/cleaner/assignments" className="view-all">
              {t("actions.viewAll")}
            </Link>
          </div>
          {assignments.length ? (
            <div className="assignments-list">
              {assignments.slice(0, 4).map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-info">
                    <h4>{assignment.booking.service_name}</h4>
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
                  <div className="assignment-actions">
                    <Link
                      className="btn-primary"
                      to={`/cleaner/bookings/${assignment.booking_id}`}
                    >
                      {t("actions.viewDetails")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{t("cleaner.noAssignments")}</p>
            </div>
          )}
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
                  to={`/cleaner/bookings/${assignment.booking_id}`}
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

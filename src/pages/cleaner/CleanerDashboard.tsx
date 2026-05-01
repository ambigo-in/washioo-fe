import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCleanerProfile,
  fetchCleanerAssignments,
} from "../../api/cleanerApi";
import type { CleanerProfile, Assignment } from "../../types/cleanerTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./CleanerDashboard.css";

export default function CleanerDashboard() {
  const [profile, setProfile] = useState<CleanerProfile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, assignmentsRes] = await Promise.all([
          fetchCleanerProfile(),
          fetchCleanerAssignments(),
        ]);
        setProfile(profileRes.cleaner);
        setAssignments(assignmentsRes.assignments);
      } catch (error) {
        console.error("Failed to fetch cleaner data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingJobs = assignments.filter(
    (a) => a.assignment_status === "assigned",
  );
  const activeJobs = assignments.filter(
    (a) =>
      a.assignment_status === "accepted" || a.assignment_status === "assigned",
  );
  const completedJobs = assignments.filter(
    (a) => a.assignment_status === "completed",
  );

  if (loading) {
    return (
      <DashboardLayout title="Cleaner Dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cleaner Dashboard">
      <div className="cleaner-dashboard">
        {/* Profile Status Card */}
        <section className="profile-status">
          <div className="status-card">
            <div className="status-header">
              <h2>Your Status</h2>
              <span className={`status-badge ${profile?.availability_status}`}>
                {profile?.availability_status || "offline"}
              </span>
            </div>
            <div className="status-details">
              <div className="detail-item">
                <span className="label">Approval:</span>
                <span className={`value ${profile?.approval_status}`}>
                  {profile?.approval_status || "pending"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Jobs Completed:</span>
                <span className="value">
                  {profile?.total_jobs_completed || 0}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Rating:</span>
                <span className="value">
                  ⭐ {profile?.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>
            <Link to="/cleaner/availability" className="manage-btn">
              Manage Availability
            </Link>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="quick-stats">
          <h2>Today's Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{pendingJobs.length}</div>
              <div className="stat-label">New Assignments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{activeJobs.length}</div>
              <div className="stat-label">Active Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{completedJobs.length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </section>

        {/* Pending Assignments */}
        <section className="pending-assignments">
          <div className="section-header">
            <h2>Pending Assignments</h2>
            <Link to="/cleaner/assignments" className="view-all">
              View All →
            </Link>
          </div>
          {pendingJobs.length > 0 ? (
            <div className="assignments-list">
              {pendingJobs.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-info">
                    <h4>{assignment.booking.service_name}</h4>
                    <p className="booking-ref">
                      {assignment.booking.booking_reference}
                    </p>
                    <p className="booking-date">
                      {new Date(
                        assignment.booking.scheduled_date,
                      ).toLocaleDateString()}{" "}
                      at {assignment.booking.scheduled_time.slice(0, 5)}
                    </p>
                    <p className="customer-address">
                      📍 {assignment.booking.address.address_line1},{" "}
                      {assignment.booking.address.city}
                    </p>
                  </div>
                  <div className="assignment-actions">
                    <Link
                      to={`/cleaner/assignments/${assignment.id}`}
                      className="btn-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No pending assignments. Check back later!</p>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <Link to="/cleaner/assignments" className="action-card">
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h3>My Assignments</h3>
                <p>View all your job assignments</p>
              </div>
            </Link>
            <Link to="/cleaner/history" className="action-card">
              <div className="action-icon">📜</div>
              <div className="action-content">
                <h3>Work History</h3>
                <p>View completed jobs</p>
              </div>
            </Link>
            <Link to="/cleaner/profile" className="action-card">
              <div className="action-icon">👤</div>
              <div className="action-content">
                <h3>My Profile</h3>
                <p>Update your details</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

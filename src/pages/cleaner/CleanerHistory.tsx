import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { fetchCleanerAssignments } from "../../api/cleanerApi";
import type { Assignment } from "../../types/cleanerTypes";
import "./CleanerHistory.css";

export default function CleanerHistory() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">(
    "all",
  );

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchCleanerAssignments();

      // Filter based on assignment_status
      let filtered = data.assignments.filter(
        (a: Assignment) =>
          a.assignment_status === "completed" ||
          a.assignment_status === "rejected",
      );

      if (filter === "completed") {
        filtered = filtered.filter(
          (a: Assignment) => a.assignment_status === "completed",
        );
      } else if (filter === "cancelled") {
        filtered = filtered.filter(
          (a: Assignment) => a.assignment_status === "rejected",
        );
      }

      setAssignments(filtered);
    } catch (err) {
      setError("Failed to load work history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="status-badge completed">Completed</span>;
      case "rejected":
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate stats
  const totalJobs = assignments.length;
  const completedJobs = assignments.filter(
    (a) => a.assignment_status === "completed",
  ).length;
  const cancelledJobs = assignments.filter(
    (a) => a.assignment_status === "rejected",
  ).length;

  return (
    <DashboardLayout title="Work History">
      <div className="history-page">
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{totalJobs}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value completed">{completedJobs}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value cancelled">{cancelledJobs}</span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>

        <div className="filter-row">
          <label>Filter by:</label>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "completed" | "cancelled")
            }
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading history...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="empty-state">
            <p>No work history found.</p>
            <p>Your completed jobs will appear here.</p>
          </div>
        ) : (
          <div className="history-list">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="history-card">
                <div className="history-header">
                  <div className="booking-info">
                    <h3>Booking #{assignment.booking_id}</h3>
                    {getStatusBadge(assignment.assignment_status)}
                  </div>
                  <span className="booking-date">
                    {formatDate(assignment.booking?.scheduled_date)}
                  </span>
                </div>

                <div className="history-details">
                  <div className="detail-row">
                    <span className="detail-label">Service</span>
                    <span className="detail-value">
                      {assignment.booking?.service_name || "Car Wash"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vehicle</span>
                    <span className="detail-value">
                      {assignment.booking?.address?.city || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">
                      {assignment.booking?.address?.address_line1 || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">
                      {assignment.booking?.scheduled_time || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount Earned</span>
                    <span className="detail-value price">
                      ₹
                      {assignment.booking?.final_price ||
                        assignment.booking?.estimated_price ||
                        0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

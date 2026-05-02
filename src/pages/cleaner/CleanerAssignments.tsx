import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  acceptCleanerAssignment,
  completeCleanerAssignment,
  loadCleanerAssignments,
  rejectCleanerAssignment,
  startCleanerAssignment,
} from "../../store/slices/cleanerSlice";
import "./CleanerAssignments.css";

type FilterStatus = "all" | "assigned" | "accepted" | "in_progress" | "completed";

export default function CleanerAssignments() {
  const dispatch = useAppDispatch();
  const { assignments, loading } = useAppSelector((state) => state.cleaner);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadCleanerAssignments(filter === "all" ? undefined : filter));
  }, [dispatch, filter]);

  const handleAccept = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await dispatch(
        acceptCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Accepted" },
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to accept assignment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await dispatch(
        rejectCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Rejected" },
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to reject assignment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await dispatch(
        startCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Started" },
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to start assignment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await dispatch(
        completeCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Completed" },
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to complete assignment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: "#ffc107",
      accepted: "#6f42c1",
      in_progress: "#007bff",
      rejected: "#dc3545",
      completed: "#28a745",
    };
    return colors[status] || "#6c757d";
  };

  return (
    <DashboardLayout title="My Assignments">
      <div className="cleaner-assignments">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {(["all", "assigned", "accepted", "in_progress", "completed"] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading assignments...</p>
          </div>
        ) : assignments.length > 0 ? (
          <div className="assignments-list">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <div className="service-info">
                    <h3>{assignment.booking.service_name}</h3>
                    <span className="booking-ref">
                      {assignment.booking.booking_reference}
                    </span>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(
                        assignment.assignment_status,
                      ),
                    }}
                  >
                    {assignment.assignment_status}
                  </span>
                </div>

                <div className="assignment-details">
                  <div className="detail-row">
                    <span className="label">📅 Date:</span>
                    <span>
                      {new Date(
                        assignment.booking.scheduled_date,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">⏰ Time:</span>
                    <span>{assignment.booking.scheduled_time.slice(0, 5)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">🚗 Vehicle:</span>
                    <span>{assignment.booking.service_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">💰 Price:</span>
                    <span>₹{assignment.booking.estimated_price}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📍 Location:</span>
                    <span>
                      {assignment.booking.address.address_line1},{" "}
                      {assignment.booking.address.city}
                    </span>
                  </div>
                  {assignment.booking.special_instructions && (
                    <div className="detail-row">
                      <span className="label">📝 Notes:</span>
                      <span>{assignment.booking.special_instructions}</span>
                    </div>
                  )}
                </div>

                <div className="assignment-actions">
                  <Link
                    className="btn-details"
                    to={`/cleaner/bookings/${assignment.booking_id}`}
                  >
                    View Details
                  </Link>
                  {assignment.assignment_status === "assigned" && (
                    <>
                      <button
                        className="btn-accept"
                        onClick={() => handleAccept(assignment.id)}
                        disabled={actionLoading === assignment.id}
                      >
                        {actionLoading === assignment.id
                          ? "Processing..."
                          : "Accept"}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(assignment.id)}
                        disabled={actionLoading === assignment.id}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {assignment.assignment_status === "accepted" &&
                    !assignment.started_at && (
                      <button
                        className="btn-start"
                        onClick={() => handleStart(assignment.id)}
                        disabled={actionLoading === assignment.id}
                      >
                        {actionLoading === assignment.id
                          ? "Starting..."
                          : "Start Job"}
                      </button>
                    )}
                  {assignment.assignment_status === "in_progress" && (
                      <button
                        className="btn-complete"
                        onClick={() => handleComplete(assignment.id)}
                        disabled={actionLoading === assignment.id}
                      >
                        {actionLoading === assignment.id
                          ? "Completing..."
                          : "Complete Job"}
                      </button>
                    )}
                  {assignment.assignment_status === "completed" && (
                    <span className="completed-badge">Job Completed ✅</span>
                  )}
                  {assignment.assignment_status === "rejected" && (
                    <span className="rejected-badge">Job Rejected ❌</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No assignments found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

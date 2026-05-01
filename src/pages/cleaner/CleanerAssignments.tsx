import { useEffect, useState } from "react";
import {
  fetchCleanerAssignments,
  acceptAssignment,
  rejectAssignment,
  startAssignment,
  completeAssignment,
} from "../../api/cleanerApi";
import type { Assignment } from "../../types/cleanerTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./CleanerAssignments.css";

type FilterStatus = "all" | "assigned" | "accepted" | "completed";

export default function CleanerAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const status = filter === "all" ? undefined : filter;
        const response = await fetchCleanerAssignments(status);
        setAssignments(response.assignments);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const handleAccept = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await acceptAssignment(assignmentId, { cleaner_notes: "Accepted" });
      // Refresh the list
      const response = await fetchCleanerAssignments(
        filter === "all" ? undefined : filter,
      );
      setAssignments(response.assignments);
    } catch (error) {
      console.error("Failed to accept assignment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await rejectAssignment(assignmentId, { cleaner_notes: "Rejected" });
      const response = await fetchCleanerAssignments(
        filter === "all" ? undefined : filter,
      );
      setAssignments(response.assignments);
    } catch (error) {
      console.error("Failed to reject assignment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await startAssignment(assignmentId, { cleaner_notes: "Started" });
      const response = await fetchCleanerAssignments(
        filter === "all" ? undefined : filter,
      );
      setAssignments(response.assignments);
    } catch (error) {
      console.error("Failed to start assignment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (assignmentId: string) => {
    setActionLoading(assignmentId);
    try {
      await completeAssignment(assignmentId, { cleaner_notes: "Completed" });
      const response = await fetchCleanerAssignments(
        filter === "all" ? undefined : filter,
      );
      setAssignments(response.assignments);
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
          {(["all", "assigned", "accepted", "completed"] as FilterStatus[]).map(
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
                  {assignment.assignment_status === "accepted" &&
                    assignment.started_at && (
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

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  acceptCleanerAssignment,
  completeCleanerAssignment,
  loadCleanerAssignments,
  rejectCleanerAssignment,
  startCleanerAssignment,
} from "../../store/slices/cleanerSlice";
import { loadCleanerEarnings } from "../../store/slices/paymentSlice";
import type { PaymentType } from "../../types/apiTypes";
import { formatAddress } from "../../utils/addressUtils";
import "./CleanerAssignments.css";

type FilterStatus =
  | "all"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed";

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CleanerAssignments() {
  const dispatch = useAppDispatch();
  const { assignments, loading } = useAppSelector((state) => state.cleaner);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [completeAmount, setCompleteAmount] = useState<Record<string, number>>(
    {},
  );
  const [paymentType, setPaymentType] = useState<Record<string, PaymentType>>(
    {},
  );
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(loadCleanerAssignments(filter === "all" ? undefined : filter));
  }, [dispatch, filter]);

  const handleAccept = async (assignmentId: string) => {
    setActionError("");
    try {
      await dispatch(
        acceptCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Accepted" },
        }),
      ).unwrap();
    } catch (error) {
      setActionError(String(error));
    }
  };

  const handleReject = async (assignmentId: string) => {
    setActionError("");
    try {
      await dispatch(
        rejectCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Rejected" },
        }),
      ).unwrap();
    } catch (error) {
      setActionError(String(error));
    }
  };

  const handleStart = async (assignmentId: string) => {
    setActionError("");
    try {
      await dispatch(
        startCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Started" },
        }),
      ).unwrap();
    } catch (error) {
      setActionError(String(error));
    }
  };

  const handleComplete = async (assignmentId: string) => {
    const assignment = assignments.find((item) => item.id === assignmentId);
    const amount =
      completeAmount[assignmentId] ??
      assignment?.booking.final_price ??
      assignment?.booking.estimated_price ??
      0;
    const type = paymentType[assignmentId] ?? "cash";

    if (!amount || amount <= 0) {
      setActionError(
        "Enter a valid collected amount before completing the job.",
      );
      return;
    }

    setActionError("");
    try {
      await dispatch(
        completeCleanerAssignment({
          assignmentId,
          actionPayload: {
            cleaner_notes: "Completed",
            final_price: amount,
            payment_type: type,
            payment_method: type === "upi" ? "UPI" : "Cash",
            collected_amount: amount,
            collected_by_cleaner: true,
          },
        }),
      ).unwrap();
      dispatch(loadCleanerEarnings());
      dispatch(loadCleanerAssignments(filter === "all" ? undefined : filter));
    } catch (error) {
      setActionError(String(error));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: "var(--brand-teal)",
      accepted: "var(--brand-teal-dark)",
      in_progress: "var(--brand-teal)",
      rejected: "#dc3545",
      completed: "var(--brand-teal)",
    };
    return colors[status] || "var(--brand-text-muted)";
  };

  return (
    <DashboardLayout title="My Assignments">
      <div className="cleaner-assignments">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {(
            [
              "all",
              "assigned",
              "accepted",
              "in_progress",
              "completed",
            ] as FilterStatus[]
          ).map((status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading && assignments.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading assignments...</p>
          </div>
        ) : assignments.length > 0 ? (
          <>
            {actionError && <p className="form-alert error">{actionError}</p>}
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
                      <span>
                        {assignment.booking.scheduled_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">🚗 Vehicle:</span>
                      <span>{assignment.booking.service_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">💰 Price:</span>
                      <span>
                        Rs. {formatMoney(assignment.booking.estimated_price)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📍 Location:</span>
                      <span>
                        {formatAddress(assignment.booking.address)}
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
                        <LoadingButton
                          className="btn-accept"
                          onClick={() => handleAccept(assignment.id)}
                          isLoading={loading}
                          loadingText="Processing..."
                        >
                          Accept
                        </LoadingButton>
                        <LoadingButton
                          className="btn-reject"
                          onClick={() => handleReject(assignment.id)}
                          isLoading={loading}
                          loadingText="Processing..."
                        >
                          Reject
                        </LoadingButton>
                      </>
                    )}
                    {assignment.assignment_status === "accepted" &&
                      !assignment.started_at && (
                        <LoadingButton
                          className="btn-start"
                          onClick={() => handleStart(assignment.id)}
                          isLoading={loading}
                          loadingText="Starting..."
                        >
                          Start Job
                        </LoadingButton>
                      )}
                    {assignment.assignment_status === "in_progress" && (
                      <div className="complete-section">
                        <div className="payment-collect-fields">
                          <div className="field-row">
                            <label>Amount Collected (Rs.)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                completeAmount[assignment.id] ??
                                assignment.booking.final_price ??
                                assignment.booking.estimated_price
                              }
                              onChange={(event) =>
                                setCompleteAmount((current) => ({
                                  ...current,
                                  [assignment.id]: Number(event.target.value),
                                }))
                              }
                            />
                          </div>
                          <div className="field-row">
                            <label>Payment Type</label>
                            <select
                              value={paymentType[assignment.id] ?? "cash"}
                              onChange={(event) =>
                                setPaymentType((current) => ({
                                  ...current,
                                  [assignment.id]: event.target
                                    .value as PaymentType,
                                }))
                              }
                            >
                              <option value="cash">Cash</option>
                              <option value="upi">UPI</option>
                            </select>
                          </div>
                        </div>
                        <LoadingButton
                          className="btn-complete"
                          onClick={() =>
                            handleComplete(assignment.id)
                          }
                          isLoading={loading}
                          loadingText="Completing..."
                        >
                          Complete Job
                        </LoadingButton>
                      </div>
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
          </>
        ) : (
          <div className="empty-state">
            <p>No assignments found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

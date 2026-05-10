import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  PaginationControls,
  SearchInput,
  StatusTabs,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
  type StatusTabOption,
} from "../../components/dashboard/DashboardControls";
import BookingRatingPanel from "../../components/BookingRatingPanel";
import { LoadingButton } from "../../components/ui";
import OpenInMapsButton from "../../components/OpenInMapsButton";
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
import { useLanguage } from "../../i18n/LanguageContext";
import "./CleanerAssignments.css";

type FilterStatus =
  | "all"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "rejected";

type WorkflowStatus = Exclude<FilterStatus, "all">;

const assignmentStatuses: WorkflowStatus[] = [
  "assigned",
  "accepted",
  "in_progress",
  "completed",
  "rejected",
];

const assignmentListParams = {
  limit: 50,
  offset: 0,
};

const workflowStatusPriority: Record<WorkflowStatus, number> = {
  assigned: 0,
  accepted: 1,
  in_progress: 2,
  completed: 3,
  rejected: 4,
};

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const statusKey = (status: Exclude<FilterStatus, "all">) =>
  status === "in_progress" ? "booking.inProgress" : `booking.${status}`;

const getWorkflowStatus = (assignment: {
  assignment_status: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}): WorkflowStatus => {
  if (
    assignment.assignment_status === "rejected" ||
    assignment.assignment_status === "cancelled"
  ) {
    return "rejected";
  }
  if (assignment.completed_at || assignment.assignment_status === "completed") {
    return "completed";
  }
  if (assignment.started_at || assignment.assignment_status === "in_progress") {
    return "in_progress";
  }
  if (assignment.accepted_at || assignment.assignment_status === "accepted") {
    return "accepted";
  }
  return "assigned";
};

export default function CleanerAssignments() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { assignments, loading } = useAppSelector(
    (state) => state.cleaner,
  );
  const query = useDashboardQueryState<FilterStatus>("all");
  const [completeAmount, setCompleteAmount] = useState<Record<string, number>>(
    {},
  );
  const [paymentType, setPaymentType] = useState<Record<string, PaymentType>>(
    {},
  );
  const [showRating, setShowRating] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(loadCleanerAssignments(assignmentListParams));
  }, [dispatch]);

  const handleAccept = async (assignmentId: string) => {
    setActionError("");
    try {
      await dispatch(
        acceptCleanerAssignment({
          assignmentId,
          actionPayload: { cleaner_notes: "Accepted" },
        }),
      ).unwrap();
      dispatch(loadCleanerAssignments(assignmentListParams));
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
      dispatch(loadCleanerAssignments(assignmentListParams));
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
      dispatch(loadCleanerAssignments(assignmentListParams));
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
      setActionError(t("cleaner.validAmount"));
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
      dispatch(loadCleanerAssignments(assignmentListParams));
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

  const workflowAssignments = useMemo(
    () =>
      assignments
        .map((assignment) => ({
          ...assignment,
          workflowStatus: getWorkflowStatus(assignment),
        }))
        .sort((left, right) => {
          const priority =
            workflowStatusPriority[left.workflowStatus] -
            workflowStatusPriority[right.workflowStatus];
          if (priority !== 0) return priority;
          return (
            new Date(right.assigned_at).getTime() -
            new Date(left.assigned_at).getTime()
          );
        }),
    [assignments],
  );
  const counts = useMemo(() => {
    const next: Record<WorkflowStatus, number> = {
      assigned: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
    };
    workflowAssignments.forEach((assignment) => {
      next[assignment.workflowStatus] += 1;
    });
    return next;
  }, [workflowAssignments]);
  const statusOptions: Array<StatusTabOption<FilterStatus>> = (
    ["all", ...assignmentStatuses] as FilterStatus[]
  ).map((status) => ({
    value: status,
    label: status === "all" ? t("common.all") : t(statusKey(status)),
    count: status === "all" ? workflowAssignments.length : counts[status],
  }));
  const statusFilteredAssignments =
    query.status === "all"
      ? workflowAssignments
      : workflowAssignments.filter(
          (assignment) => assignment.workflowStatus === query.status,
        );
  const filteredAssignments = statusFilteredAssignments.filter((assignment) =>
    matchesSearch(assignment, query.debouncedSearch, [
      (item) => item.booking.booking_reference,
      (item) => item.booking.service_name,
      (item) => item.booking.customer_name,
      (item) => item.workflowStatus,
      (item) => formatAddress(item.booking.address),
    ]),
  );
  const visibleAssignments = paginateItems(
    filteredAssignments,
    query.page,
    query.pageSize,
  );
  const visibleTotal = filteredAssignments.length;

  return (
    <DashboardLayout title={t("cleaner.myAssignments")}>
      <div className="cleaner-assignments">
        <div className="dashboard-toolbar">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder={t("cleaner.searchAssignments")}
          />
        </div>
        <StatusTabs
          value={query.status}
          options={statusOptions}
          onChange={query.setStatus}
        />

        {loading && assignments.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t("cleaner.loadingAssignments")}</p>
          </div>
        ) : visibleAssignments.length > 0 ? (
          <>
            {actionError && <p className="form-alert error">{actionError}</p>}
            <div className="assignments-list">
              {visibleAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`assignment-card ${assignment.workflowStatus}`}
                >
                  {assignment.workflowStatus === "assigned" && (
                    <div className="assigned-callout-label">
                      {t("cleaner.newAssignments")}
                    </div>
                  )}
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
                          assignment.workflowStatus,
                        ),
                      }}
                    >
                      {t(
                        assignment.workflowStatus === "in_progress"
                          ? "booking.inProgress"
                          : `booking.${assignment.workflowStatus}`,
                      )}
                    </span>
                  </div>

                  <div className="assignment-details">
                    <div className="detail-row">
                      <span className="label">📅</span>
                      <span>
                        {new Date(
                          assignment.booking.scheduled_date,
                        ).toLocaleDateString()}
                        {" at "}
                        {assignment.booking.scheduled_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📍</span>
                      <span>{formatAddress(assignment.booking.address)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">💰</span>
                      <span>
                        Rs. {formatMoney(assignment.booking.estimated_price)}
                      </span>
                    </div>
                  </div>

                  <div className="assignment-actions">
                    <Link
                      className="btn-details"
                      to={`/cleaner/bookings/${assignment.booking_id}`}
                    >
                      {t("actions.viewDetails")}
                    </Link>

                    {(assignment.workflowStatus === "accepted" ||
                      assignment.workflowStatus === "in_progress") && (
                      <OpenInMapsButton
                        address={assignment.booking.address}
                        label={t("cleaner.route")}
                        className="btn-start-route"
                      />
                    )}

                    {assignment.workflowStatus === "assigned" && (
                      <>
                        <LoadingButton
                          className="btn-accept"
                          onClick={() => handleAccept(assignment.id)}
                          isLoading={loading}
                          loadingText={t("cleaner.accepting")}
                        >
                          ✓ {t("cleaner.accept")}
                        </LoadingButton>
                        <LoadingButton
                          className="btn-reject"
                          onClick={() => handleReject(assignment.id)}
                          isLoading={loading}
                          loadingText={t("cleaner.rejecting")}
                        >
                          × {t("cleaner.reject")}
                        </LoadingButton>
                      </>
                    )}
                    {assignment.workflowStatus === "accepted" &&
                      !assignment.started_at && (
                        <LoadingButton
                          className="btn-start"
                          onClick={() => handleStart(assignment.id)}
                          isLoading={loading}
                          loadingText={t("cleaner.starting")}
                        >
                          ▶ {t("cleaner.startService")}
                        </LoadingButton>
                      )}
                    {assignment.workflowStatus === "in_progress" && (
                      <div className="complete-section">
                        <div className="payment-collect-fields">
                          <div className="field-row">
                            <label>{t("cleaner.amountCollected")}</label>
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
                            <label>{t("cleaner.paymentType")}</label>
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
                          onClick={() => handleComplete(assignment.id)}
                          isLoading={loading}
                          loadingText={t("cleaner.completing")}
                        >
                          ✓ {t("cleaner.completeService")}
                        </LoadingButton>
                      </div>
                    )}
                    {assignment.workflowStatus === "completed" && (
                      <>
                        <span className="completed-badge">✓ {t("common.completed")}</span>
                        <button
                          type="button"
                          className="btn-rate-customer"
                          onClick={() =>
                            setShowRating((current) => ({
                              ...current,
                              [assignment.id]: !current[assignment.id],
                            }))
                          }
                        >
                          {showRating[assignment.id]
                            ? t("cleaner.hideRating")
                            : t("cleaner.rateCustomer")}
                        </button>
                      </>
                    )}
                    {assignment.workflowStatus === "rejected" && (
                      <span className="rejected-badge">× {t("cleaner.rejected")}</span>
                    )}
                  </div>

                  {assignment.workflowStatus === "completed" &&
                    showRating[assignment.id] && (
                      <div className="assignment-rating-panel">
                        <BookingRatingPanel
                          bookingId={assignment.booking_id}
                          bookingStatus="completed"
                          perspective="cleaner"
                          subjectName={assignment.booking.customer_name}
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
            <PaginationControls
              page={query.page}
              pageSize={query.pageSize}
              total={visibleTotal}
              onPageChange={query.setPage}
            />
          </>
        ) : (
          <div className="empty-state">
            <p>{t("cleaner.noAssignments")}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { fetchCleanerAssignments } from "../../api/cleanerApi";
import type { Assignment } from "../../types/cleanerTypes";
import {
  FilterSelect,
  PaginationControls,
  SearchInput,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
} from "../../components/dashboard/DashboardControls";
import { formatAddress } from "../../utils/addressUtils";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CleanerHistory.css";

export default function CleanerHistory() {
  const { t } = useLanguage();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = useDashboardQueryState<"all" | "completed" | "cancelled">("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    const status = query.status === "cancelled" ? "rejected" : query.status;
    fetchCleanerAssignments(status === "all" ? undefined : status, {
      limit: query.pageSize,
      offset: query.offset,
    })
      .then((data) => {
        if (!active) return;

        const filtered = data.assignments.filter(
          (a: Assignment) =>
            a.assignment_status === "completed" ||
            a.assignment_status === "rejected",
        );
        setAssignments(filtered);
        setTotal(data.total);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError("Failed to load work history");
        console.error(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query.offset, query.pageSize, query.status]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="status-badge completed">{t("common.completed")}</span>;
      case "rejected":
        return <span className="status-badge cancelled">{t("common.cancelled")}</span>;
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

  const formatMoney = (value: number) =>
    `Rs. ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatPaymentStatus = (status?: string | null) =>
    status ? status.replace("_", " ") : t("history.paymentNotCollected");

  const renderEarningValue = (assignment: Assignment) => {
    const payment = assignment.booking?.payment;
    if (!payment || payment.payment_status === "pending_collection") {
      return <span className="earning-state muted">{t("history.paymentNotCollected")}</span>;
    }
    if (payment.payment_status === "collected") {
      return <span className="earning-state pending">{t("history.splitPending")}</span>;
    }
    if (payment.payment_status === "split_done" && payment.cleaner_share != null) {
      return (
        <span className="earning-confirmed">
          <strong>{formatMoney(payment.cleaner_share)}</strong>
          <small>{t("history.yourShare")}</small>
        </span>
      );
    }
    return <span className="earning-state pending">{t("history.splitPending")}</span>;
  };

  // Calculate stats
  const totalJobs = assignments.length;
  const completedJobs = assignments.filter(
    (a) => a.assignment_status === "completed",
  ).length;
  const cancelledJobs = assignments.filter(
    (a) => a.assignment_status === "rejected",
  ).length;
  const totalEarnings = assignments.reduce((sum, assignment) => {
    if (assignment.assignment_status !== "completed") return sum;
    if (assignment.booking?.payment?.payment_status === "split_done") {
      return sum + (assignment.booking.payment.cleaner_share ?? 0);
    }
    return sum;
  }, 0);
  const filteredAssignments = assignments.filter((assignment) =>
    matchesSearch(assignment, query.debouncedSearch, [
      (item) => item.booking.booking_reference,
      (item) => item.booking.service_name,
      (item) => item.assignment_status,
      (item) => formatAddress(item.booking.address),
    ]),
  );
  const visibleAssignments = query.debouncedSearch
    ? paginateItems(filteredAssignments, query.page, query.pageSize)
    : filteredAssignments;
  const visibleTotal = query.debouncedSearch ? filteredAssignments.length : total;

  return (
    <DashboardLayout title={t("history.workHistory")}>
      <div className="history-page">
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{totalJobs}</span>
            <span className="stat-label">{t("history.totalJobs")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value completed">{completedJobs}</span>
            <span className="stat-label">{t("common.completed")}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value cancelled">{cancelledJobs}</span>
            <span className="stat-label">{t("common.cancelled")}</span>
          </div>
          <div className="stat-card revenue">
            <span className="stat-value">
              {formatMoney(totalEarnings)}
            </span>
            <span className="stat-label">{t("history.totalEarnings")}</span>
          </div>
        </div>

        <div className="filter-row">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder={t("history.searchPlaceholder")}
          />
          <FilterSelect
            label={t("common.filterBy")}
            value={query.status}
            onChange={query.setStatus}
            options={[
              { value: "all", label: t("common.all") },
              { value: "completed", label: t("common.completed") },
              { value: "cancelled", label: t("common.cancelled") },
            ]}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>{t("common.loadingHistory")}</p>
          </div>
        ) : visibleAssignments.length === 0 ? (
          <div className="empty-state">
            <p>{t("history.noHistory")}</p>
            <p>{t("history.noHistoryHint")}</p>
          </div>
        ) : (
          <div className="history-list">
            {visibleAssignments.map((assignment) => (
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
                    <span className="detail-label">{t("history.service")}</span>
                    <span className="detail-value">
                      {assignment.booking?.service_name || "Car Wash"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t("history.vehicle")}</span>
                    <span className="detail-value">
                      {assignment.booking?.address?.city || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">
                      {formatAddress(assignment.booking?.address)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t("history.time")}</span>
                    <span className="detail-value">
                      {assignment.booking?.scheduled_time || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t("history.amountEarned")}</span>
                    <span className="detail-value price">
                      {renderEarningValue(assignment)}
                    </span>
                  </div>
                  {assignment.booking?.payment?.payment_status && (
                    <div className="detail-row">
                      <span className="detail-label">{t("history.paymentStatus")}</span>
                      <span className="detail-value">
                        {formatPaymentStatus(
                          assignment.booking.payment.payment_status,
                        )}
                      </span>
                    </div>
                  )}
                  {assignment.booking?.payment?.admin_share != null && (
                    <div className="detail-row">
                      <span className="detail-label">{t("history.adminShare")}</span>
                      <span className="detail-value">
                        {formatMoney(assignment.booking.payment.admin_share)}
                      </span>
                    </div>
                  )}
                  {assignment.booking?.payment?.payment_method && (
                    <div className="detail-row">
                      <span className="detail-label">{t("history.paymentMode")}</span>
                      <span className="detail-value">
                        {assignment.booking.payment.payment_method}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <PaginationControls
          page={query.page}
          pageSize={query.pageSize}
          total={visibleTotal}
          onPageChange={query.setPage}
        />
      </div>
    </DashboardLayout>
  );
}

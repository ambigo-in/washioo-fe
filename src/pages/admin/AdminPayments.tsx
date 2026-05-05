import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadAdminBookings,
  loadAdminCleaners,
  loadAdminUsers,
} from "../../store/slices/adminSlice";
import {
  loadAdminPayments,
  markAdminShareCollected,
  submitAdminSplit,
} from "../../store/slices/paymentSlice";
import type { CleanerHandoverStatus, Payment, PaymentStatus } from "../../types/apiTypes";
import "./AdminPayments.css";

type FilterStatus = "all" | "collected" | "split_done" | "admin_due" | "admin_collected";

const filterTabs: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Collected", value: "collected" },
  { label: "Split Done", value: "split_done" },
  { label: "Admin Due", value: "admin_due" },
  { label: "Admin Collected", value: "admin_collected" },
];

const formatMoney = (value?: number | null) =>
  `Rs. ${(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatLabel = (value?: string | null) =>
  value ? value.replace("_", " ") : "Not available";

function PaymentTypeBadge({ type }: { type: Payment["payment_type"] }) {
  if (!type) return <span className="payment-type-badge muted">N/A</span>;
  return (
    <span className={`payment-type-badge ${type}`}>
      {type === "upi" ? "UPI" : "Cash"}
    </span>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`payment-status-badge ${status}`}>{formatLabel(status)}</span>;
}

function HandoverBadge({
  status,
}: {
  status?: CleanerHandoverStatus;
}) {
  const value = status ?? "pending";
  return (
    <span className={`handover-badge ${value}`}>
      {value === "settled" ? "Admin Collected" : "Admin Due"}
    </span>
  );
}

function SplitForm({
  payment,
  onSubmit,
  submitting,
}: {
  payment: Payment;
  onSubmit: (cleanerShare: number, adminShare: number) => Promise<void>;
  submitting: boolean;
}) {
  const collectedAmount = payment.collected_amount ?? 0;
  const [cleanerShare, setCleanerShare] = useState("");
  const cleanerShareNumber = Number(cleanerShare);
  const adminShare =
    Number.isFinite(cleanerShareNumber) && cleanerShare !== ""
      ? Math.max(collectedAmount - cleanerShareNumber, 0)
      : collectedAmount;
  const fieldError =
    cleanerShare !== "" &&
    (cleanerShareNumber <= 0 || cleanerShareNumber >= collectedAmount)
      ? "Cleaner share must be greater than 0 and less than collected amount."
      : "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (fieldError || cleanerShare === "") return;
    await onSubmit(cleanerShareNumber, adminShare);
  };

  return (
    <form className="split-form" onSubmit={handleSubmit}>
      <label>
        <span>Cleaner Share (Rs.)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={cleanerShare}
          onChange={(event) => setCleanerShare(event.target.value)}
        />
      </label>

      <label>
        <span>Admin Share (Rs.)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={adminShare.toFixed(2)}
          readOnly
        />
      </label>

      {fieldError && <p className="field-error">{fieldError}</p>}

      <LoadingButton
        type="submit"
        className="confirm-split-btn"
        isLoading={submitting}
        loadingText="Confirming split..."
        disabled={!!fieldError || cleanerShare === ""}
      >
        Confirm Split
      </LoadingButton>
    </form>
  );
}

export default function AdminPayments() {
  const dispatch = useAppDispatch();
  const { bookings, cleaners, users } = useAppSelector((state) => state.admin);
  const { payments, loading, error } = useAppSelector((state) => state.payments);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [localError, setLocalError] = useState("");

  const paymentFilter = useMemo(() => {
    if (filter === "all") return undefined;
    if (filter === "admin_due") {
      return {
        status: "split_done" as PaymentStatus,
        cleaner_handover_status: "pending" as CleanerHandoverStatus,
      };
    }
    if (filter === "admin_collected") {
      return {
        status: "split_done" as PaymentStatus,
        cleaner_handover_status: "settled" as CleanerHandoverStatus,
      };
    }
    return filter as PaymentStatus;
  }, [filter]);

  useEffect(() => {
    dispatch(loadAdminPayments(paymentFilter));
  }, [dispatch, paymentFilter]);

  useEffect(() => {
    dispatch(loadAdminBookings("all"));
    dispatch(loadAdminCleaners(undefined));
    dispatch(loadAdminUsers());
  }, [dispatch]);

  const bookingById = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings],
  );
  const cleanerById = useMemo(
    () => new Map(cleaners.map((cleaner) => [cleaner.id, cleaner])),
    [cleaners],
  );
  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const handleSplit = async (
    payment: Payment,
    cleanerShare: number,
    adminShare: number,
  ) => {
    setLocalError("");

    try {
      await dispatch(
        submitAdminSplit({
          paymentId: payment.id,
          body: {
            cleaner_share: cleanerShare,
            admin_share: adminShare,
          },
        }),
      ).unwrap();
      dispatch(loadAdminPayments(paymentFilter));
    } catch (err) {
      setLocalError(String(err));
    }
  };

  const handleAdminShareCollected = async (payment: Payment) => {
    setLocalError("");

    try {
      await dispatch(markAdminShareCollected(payment.id)).unwrap();
      dispatch(loadAdminPayments(paymentFilter));
    } catch (err) {
      setLocalError(String(err));
    }
  };

  return (
    <DashboardLayout title="Payment Management">
      <div className="admin-payments">
        <section className="payments-toolbar">
          <div>
            <h2>Payment Reconciliation</h2>
            <p>Review cleaner collections and split each collected payment.</p>
          </div>

          <div className="filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`filter-tab ${filter === tab.value ? "active" : ""}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {(error || localError) && (
          <p className="form-alert error">{localError || error}</p>
        )}

        {loading && payments.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <h3>No payments found.</h3>
            <p>Collected payments will appear here after cleaners record them.</p>
          </div>
        ) : (
          <div className="payment-card-list">
            {payments.map((payment) => {
              const booking = bookingById.get(payment.booking_id);
              const cleaner = payment.collected_by
                ? cleanerById.get(payment.collected_by)
                : undefined;
              const splitAdmin = payment.split_updated_by
                ? userById.get(payment.split_updated_by)
                : undefined;

              return (
                <article key={payment.id} className="payment-card">
                  <div className="payment-card-header">
                    <div>
                      <span className="booking-reference">
                        {booking?.booking_reference || payment.booking_id}
                      </span>
                      <h3>{booking?.service_name || "Service booking"}</h3>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>

                  <div className="payment-card-grid">
                    <div>
                      <span>Customer</span>
                      <strong>
                        {booking?.customer_name || payment.customer_id || "N/A"}
                      </strong>
                    </div>
                    <div>
                      <span>Cleaner</span>
                      <strong>{cleaner?.full_name || payment.collected_by || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Collected Amount</span>
                      <strong>{formatMoney(payment.collected_amount)}</strong>
                    </div>
                    <div>
                      <span>Payment Type</span>
                      <PaymentTypeBadge type={payment.payment_type} />
                    </div>
                    {payment.status === "split_done" && (
                      <div>
                        <span>Admin Collection</span>
                        <HandoverBadge
                          status={payment.cleaner_handover_status}
                        />
                      </div>
                    )}
                  </div>

                  {payment.status === "collected" && (
                    <SplitForm
                      payment={payment}
                      submitting={loading}
                      onSubmit={(cleanerShare, adminShare) =>
                        handleSplit(payment, cleanerShare, adminShare)
                      }
                    />
                  )}

                  {payment.status === "split_done" && (
                    <div className="split-summary">
                      <div>
                        <span>Cleaner Share</span>
                        <strong>{formatMoney(payment.cleaner_share)}</strong>
                      </div>
                      <div>
                        <span>Admin Share</span>
                        <strong>{formatMoney(payment.admin_share)}</strong>
                      </div>
                      <div>
                        <span>Admin Collection</span>
                        <HandoverBadge
                          status={payment.cleaner_handover_status}
                        />
                      </div>
                      <div>
                        <span>Split By</span>
                        <strong>{splitAdmin?.full_name || payment.split_updated_by || "N/A"}</strong>
                      </div>
                      <div>
                        <span>Split At</span>
                        <strong>
                          {payment.split_updated_at
                            ? new Date(payment.split_updated_at).toLocaleString()
                            : "N/A"}
                        </strong>
                      </div>
                      {payment.cleaner_handover_status !== "settled" && (
                        <div className="handover-action">
                          <span>Collect From Cleaner</span>
                          <LoadingButton
                            type="button"
                            className="mark-admin-collected-btn"
                            isLoading={loading}
                            loadingText="Updating payment..."
                            onClick={() => handleAdminShareCollected(payment)}
                          >
                            {`Mark ${formatMoney(payment.admin_share)} Collected`}
                          </LoadingButton>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

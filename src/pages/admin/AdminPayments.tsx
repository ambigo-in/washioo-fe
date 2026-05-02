import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadAdminBookings,
  loadAdminCleaners,
  loadAdminUsers,
} from "../../store/slices/adminSlice";
import {
  loadAdminPayments,
  submitAdminSplit,
} from "../../store/slices/paymentSlice";
import type { Payment, PaymentStatus } from "../../types/apiTypes";
import "./AdminPayments.css";

type FilterStatus = "all" | "collected" | "split_done";

const filterTabs: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Collected", value: "collected" },
  { label: "Split Done", value: "split_done" },
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

      <button
        type="submit"
        className="confirm-split-btn"
        disabled={submitting || !!fieldError || cleanerShare === ""}
      >
        {submitting ? "Splitting..." : "Confirm Split"}
      </button>
    </form>
  );
}

export default function AdminPayments() {
  const dispatch = useAppDispatch();
  const { bookings, cleaners, users } = useAppSelector((state) => state.admin);
  const { payments, loading, error } = useAppSelector((state) => state.payments);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const status = filter === "all" ? undefined : filter;
    dispatch(loadAdminPayments(status));
  }, [dispatch, filter]);

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
    setSubmittingId(payment.id);
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
      dispatch(loadAdminPayments(filter === "all" ? undefined : filter));
    } catch (err) {
      setLocalError(String(err));
    } finally {
      setSubmittingId(null);
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

        {loading ? (
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
                  </div>

                  {payment.status === "collected" && (
                    <SplitForm
                      payment={payment}
                      submitting={submittingId === payment.id}
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

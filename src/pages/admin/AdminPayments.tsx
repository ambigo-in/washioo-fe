import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  deletePayment,
  fetchPaymentStats,
  fetchPayments,
  markPaymentFailed,
  markPaymentPaid,
} from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import type { AdminPayment } from "../../types/adminTypes";
import type { PaymentStatus } from "../../types/apiTypes";
import "./AdminPayments.css";

const statusLabels: Record<string, string> = {
  all: "All",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [stats, setStats] = useState({
    total_payments: 0,
    pending_count: 0,
    paid_count: 0,
    failed_count: 0,
    total_amount_paid: 0,
    total_amount_pending: 0,
  });
  const [filter, setFilter] = useState<"all" | PaymentStatus>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        fetchPaymentStats(),
        fetchPayments({ status: filter === "all" ? undefined : filter }),
      ]);
      setStats(statsRes.statistics);
      setPayments(paymentsRes.payments);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const handleMarkPaid = async (payment: AdminPayment) => {
    setActionLoading(payment.id);
    setError("");
    try {
      await markPaymentPaid(
        payment.id,
        payment.transaction_reference ?? undefined,
      );
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkFailed = async (payment: AdminPayment) => {
    setActionLoading(payment.id);
    setError("");
    try {
      await markPaymentFailed(payment.id);
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (payment: AdminPayment) => {
    if (!window.confirm("Delete this pending payment?")) return;
    setActionLoading(payment.id);
    setError("");
    try {
      await deletePayment(payment.id);
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "failed":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <DashboardLayout title="Payment Management">
      <div className="admin-payments">
        <section className="payment-stats">
          <h2>Payment Dashboard</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_payments}</div>
              <div className="stat-label">Total Payments</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{stats.pending_count}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{stats.paid_count}</div>
              <div className="stat-label">Paid</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">{stats.failed_count}</div>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-value">
                ₹{stats.total_amount_paid.toLocaleString()}
              </div>
              <div className="stat-label">Amount Paid</div>
            </div>
            <div className="stat-card pending-total">
              <div className="stat-value">
                ₹{stats.total_amount_pending.toLocaleString()}
              </div>
              <div className="stat-label">Amount Pending</div>
            </div>
          </div>
        </section>

        <section className="payment-actions">
          <div className="filter-row">
            <div className="filter-buttons">
              {Object.entries(statusLabels).map(([value, label]) => (
                <button
                  key={value}
                  className={`filter-button ${filter === value ? "active" : ""}`}
                  type="button"
                  onClick={() => setFilter(value as "all" | PaymentStatus)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="form-alert error">{error}</p>}

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <h3>No payments found.</h3>
              <p>Try a different filter or come back later.</p>
            </div>
          ) : (
            <div className="payments-table-wrapper">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Collected</th>
                    <th>Reference</th>
                    <th>Paid At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.booking_id}</td>
                      <td>{payment.customer_id}</td>
                      <td>₹{payment.amount}</td>
                      <td>{payment.payment_method || "N/A"}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{
                            backgroundColor: statusColor(
                              payment.payment_status,
                            ),
                          }}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                      <td>{payment.collected_by_cleaner ? "Yes" : "No"}</td>
                      <td>{payment.transaction_reference || "—"}</td>
                      <td>
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleString()
                          : "—"}
                      </td>
                      <td>
                        <div className="row-actions">
                          {payment.payment_status === "pending" && (
                            <>
                              <button
                                className="btn-action success"
                                onClick={() => handleMarkPaid(payment)}
                                disabled={actionLoading === payment.id}
                              >
                                {actionLoading === payment.id
                                  ? "Processing..."
                                  : "Mark Paid"}
                              </button>
                              <button
                                className="btn-action danger"
                                onClick={() => handleMarkFailed(payment)}
                                disabled={actionLoading === payment.id}
                              >
                                {actionLoading === payment.id
                                  ? "Processing..."
                                  : "Mark Failed"}
                              </button>
                              <button
                                className="btn-action delete"
                                onClick={() => handleDelete(payment)}
                                disabled={actionLoading === payment.id}
                              >
                                {actionLoading === payment.id
                                  ? "Processing..."
                                  : "Delete"}
                              </button>
                            </>
                          )}
                          {payment.payment_status === "failed" && (
                            <button
                              className="btn-action success"
                              onClick={() => handleMarkPaid(payment)}
                              disabled={actionLoading === payment.id}
                            >
                              {actionLoading === payment.id
                                ? "Processing..."
                                : "Mark Paid"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

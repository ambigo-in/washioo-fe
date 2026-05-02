import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BookingStatus } from "../../types/apiTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  assignAdminBooking,
  loadAdminBookings,
  loadAdminCleaners,
} from "../../store/slices/adminSlice";
import "./AdminBookings.css";

type FilterStatus = "all" | BookingStatus;

export default function AdminBookings() {
  const dispatch = useAppDispatch();
  const { bookings, cleaners, loading } = useAppSelector(
    (state) => state.admin,
  );
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [assigningBooking, setAssigningBooking] = useState<string | null>(null);
  const [selectedCleaner, setSelectedCleaner] = useState<string>("");
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    dispatch(loadAdminBookings(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    dispatch(
      loadAdminCleaners({
        approval_status: "approved",
        availability_status: "available",
      }),
    );
  }, [dispatch]);

  const handleAssign = async (bookingId: string) => {
    if (!selectedCleaner) return;
    setAssigningBooking(bookingId);
    setAssignError("");
    try {
      await dispatch(
        assignAdminBooking({ bookingId, cleanerId: selectedCleaner }),
      ).unwrap();
      await dispatch(loadAdminBookings(filter)).unwrap();
      setSelectedCleaner("");
    } catch (error) {
      setAssignError(String(error));
    } finally {
      setAssigningBooking(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "var(--brand-teal)",
      assigned: "var(--brand-teal)",
      accepted: "var(--brand-teal-dark)",
      in_progress: "var(--brand-teal)",
      completed: "var(--brand-teal)",
      cancelled: "#dc3545",
    };
    return colors[status] || "var(--brand-text-muted)";
  };

  const statusFilters: FilterStatus[] = [
    "all",
    "pending",
    "assigned",
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
  ];

  return (
    <DashboardLayout title="Manage Bookings">
      <div className="admin-bookings">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {statusFilters.map((status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All" : status.replace("_", " ")}
              {status !== "all" && (
                <span className="count">
                  {bookings.filter((b) => b.booking_status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <>
          {assignError && <p className="form-alert error">{assignError}</p>}
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-ref">
                    <h3>{booking.booking_reference}</h3>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(booking.booking_status),
                      }}
                    >
                      {booking.booking_status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="booking-price">
                    Rs. {booking.estimated_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Customer</span>
                    <span className="value">{booking.customer_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone</span>
                    <span className="value">{booking.customer_phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Service</span>
                    <span className="value">{booking.service_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date</span>
                    <span className="value">
                      {new Date(booking.scheduled_date).toLocaleDateString()} at{" "}
                      {booking.scheduled_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Address</span>
                    <span className="value">
                      {booking.address.address_line1}, {booking.address.city}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Price</span>
                    <span className="value">
                      Rs. {(booking.final_price ?? booking.estimated_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Cleaner</span>
                    <span className="value">
                      {booking.assignment?.cleaner_name ?? "Not Assigned"}
                    </span>
                  </div>
                </div>

                {booking.booking_status === "pending" && (
                  <div className="booking-actions">
                    <select
                      value={selectedCleaner}
                      onChange={(e) => setSelectedCleaner(e.target.value)}
                      className="cleaner-select"
                    >
                      <option value="">Select Cleaner</option>
                      {cleaners.map((cleaner) => (
                        <option key={cleaner.id} value={cleaner.id}>
                          {cleaner.full_name} - {cleaner.vehicle_type}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-assign"
                      onClick={() => handleAssign(booking.id)}
                      disabled={
                        !selectedCleaner || assigningBooking === booking.id
                      }
                    >
                      {assigningBooking === booking.id
                        ? "Assigning..."
                        : "Assign Cleaner"}
                    </button>
                  </div>
                )}

                {booking.booking_status === "completed" && (
                  <div className="booking-actions admin-payment-actions">
                    <p className="payment-note">
                      Payment should be reconciled in Payments.
                    </p>
                    <Link to="/admin/payments" className="btn-manage-payment">
                      Manage Payments
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
        ) : (
          <div className="empty-state">
            <p>No bookings found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

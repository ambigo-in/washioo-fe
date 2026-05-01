import { useEffect, useState } from "react";
import {
  fetchAllBookings,
  fetchBookingsByStatus,
  assignBooking,
} from "../../api/adminApi";
import { fetchCleaners } from "../../api/adminApi";
import type { AdminBooking } from "../../types/adminTypes";
import type { CleanerProfile } from "../../types/cleanerTypes";
import type { BookingStatus } from "../../types/apiTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./AdminBookings.css";

type FilterStatus = "all" | BookingStatus;

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [cleaners, setCleaners] = useState<CleanerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [assigningBooking, setAssigningBooking] = useState<string | null>(null);
  const [selectedCleaner, setSelectedCleaner] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response =
          filter === "all"
            ? await fetchAllBookings()
            : await fetchBookingsByStatus(filter as BookingStatus);
        setBookings(response.bookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  useEffect(() => {
    const fetchCleanersList = async () => {
      try {
        const response = await fetchCleaners({
          approval_status: "approved",
          availability_status: "available",
        });
        setCleaners(response.cleaners);
      } catch (error) {
        console.error("Failed to fetch cleaners:", error);
      }
    };
    fetchCleanersList();
  }, []);

  const handleAssign = async (bookingId: string) => {
    if (!selectedCleaner) return;
    setAssigningBooking(bookingId);
    try {
      await assignBooking(bookingId, { cleaner_id: selectedCleaner });
      // Refresh bookings
      const response =
        filter === "all"
          ? await fetchAllBookings()
          : await fetchBookingsByStatus(filter as BookingStatus);
      setBookings(response.bookings);
      setSelectedCleaner("");
    } catch (error) {
      console.error("Failed to assign booking:", error);
    } finally {
      setAssigningBooking(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#ffc107",
      assigned: "#17a2b8",
      accepted: "#6f42c1",
      in_progress: "#007bff",
      completed: "#28a745",
      cancelled: "#dc3545",
    };
    return colors[status] || "#6c757d";
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
                    ₹{booking.estimated_price}
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
                  {booking.assignment && (
                    <div className="detail-item">
                      <span className="label">Assigned To</span>
                      <span className="value">
                        {booking.assignment.cleaner_id
                          ? "Cleaner Assigned"
                          : "Not Assigned"}
                      </span>
                    </div>
                  )}
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
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No bookings found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

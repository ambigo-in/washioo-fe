import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  cancelBooking,
  fetchBookings,
  updateBooking,
} from "../api/bookingApi";
import { getApiErrorMessage } from "../api/client";
import type { BookingStatus, CustomerBooking } from "../types/apiTypes";
import "../styles/myBookings.css";

const statusLabel: Record<BookingStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const canCancel = (status: BookingStatus) =>
  !["in_progress", "completed", "cancelled"].includes(status);

const canEdit = (status: BookingStatus) => status === "pending";

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [error, setError] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    fetchBookings()
      .then((data) => {
        if (active) setBookings(data.bookings || []);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const startEdit = (booking: CustomerBooking) => {
    setEditingId(booking.id);
    setEditDate(booking.scheduled_date);
    setEditTime(booking.scheduled_time.slice(0, 5));
    setEditInstructions(booking.special_instructions || "");
    setError("");
  };

  const handleUpdate = async (booking: CustomerBooking) => {
    setWorkingId(booking.id);
    setError("");

    try {
      await updateBooking(booking.id, {
        scheduled_date: editDate,
        scheduled_time: editTime,
        special_instructions: editInstructions.trim() || null,
      });
      setEditingId("");
      await loadBookings();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setWorkingId("");
    }
  };

  const handleCancel = async (booking: CustomerBooking) => {
    setWorkingId(booking.id);
    setError("");

    try {
      await cancelBooking(booking.id);
      await loadBookings();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <>
      <Header />
      <section className="my-bookings-page">
        <div className="my-bookings-heading">
          <span>YOUR WASHES</span>
          <h1>My Bookings</h1>
          <p>Track active bookings and manage pending requests.</p>
        </div>

        {error && <p className="form-alert error">{error}</p>}

        {loading ? (
          <div className="loading-state">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <h2>No bookings yet</h2>
            <p>Your confirmed wash bookings will appear here.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <article key={booking.id} className="booking-card">
                <div className="booking-card-top">
                  <div>
                    <span className="booking-reference">
                      {booking.booking_reference}
                    </span>
                    <h2>{booking.service_name}</h2>
                  </div>
                  <span className={`status-badge ${booking.booking_status}`}>
                    {statusLabel[booking.booking_status]}
                  </span>
                </div>

                <div className="booking-details-grid">
                  <div>
                    <span>Date</span>
                    <strong>{booking.scheduled_date}</strong>
                  </div>
                  <div>
                    <span>Time</span>
                    <strong>{booking.scheduled_time.slice(0, 5)}</strong>
                  </div>
                  <div>
                    <span>Price</span>
                    <strong>
                      Rs. {booking.final_price ?? booking.estimated_price}
                    </strong>
                  </div>
                </div>

                <div className="booking-address">
                  <span>Address</span>
                  <p>
                    {booking.address.address_line1}
                    {booking.address.city ? `, ${booking.address.city}` : ""}
                  </p>
                </div>

                {booking.special_instructions && (
                  <div className="booking-address">
                    <span>Instructions</span>
                    <p>{booking.special_instructions}</p>
                  </div>
                )}

                {editingId === booking.id ? (
                  <div className="booking-edit-form">
                    <input
                      type="date"
                      value={editDate}
                      onChange={(event) => setEditDate(event.target.value)}
                    />
                    <input
                      type="time"
                      value={editTime}
                      onChange={(event) => setEditTime(event.target.value)}
                    />
                    <textarea
                      placeholder="Special instructions"
                      value={editInstructions}
                      onChange={(event) => setEditInstructions(event.target.value)}
                    />
                    <div className="booking-actions">
                      <button
                        disabled={workingId === booking.id}
                        onClick={() => handleUpdate(booking)}
                        type="button"
                      >
                        {workingId === booking.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="secondary-action"
                        onClick={() => setEditingId("")}
                        type="button"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="booking-actions">
                    {canEdit(booking.booking_status) && (
                      <button onClick={() => startEdit(booking)} type="button">
                        Edit Pending Booking
                      </button>
                    )}
                    {canCancel(booking.booking_status) && (
                      <button
                        className="danger-action"
                        disabled={workingId === booking.id}
                        onClick={() => handleCancel(booking)}
                        type="button"
                      >
                        {workingId === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default MyBookingsPage;


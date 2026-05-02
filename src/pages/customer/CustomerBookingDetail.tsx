import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBooking } from "../../api/bookingApi";
import { getApiErrorMessage } from "../../api/client";
import BookingRatingPanel from "../../components/BookingRatingPanel";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearCustomerPaymentStatus,
  loadCustomerPaymentStatus,
} from "../../store/slices/paymentSlice";
import type { CustomerBooking } from "../../types/apiTypes";
import "./CustomerBookingDetail.css";

const formatStatus = (value?: string | null) =>
  value ? value.replace("_", " ") : "Not available";

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CustomerBookingDetail() {
  const { bookingId } = useParams();
  const dispatch = useAppDispatch();
  const { customerPaymentStatus } = useAppSelector((state) => state.payments);
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    let active = true;
    dispatch(clearCustomerPaymentStatus());

    fetchBooking(bookingId)
      .then((response) => {
        if (!active) return;
        setBooking(response.booking);
        if (response.booking.booking_status === "completed") {
          dispatch(loadCustomerPaymentStatus(bookingId));
        }
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      dispatch(clearCustomerPaymentStatus());
    };
  }, [bookingId, dispatch]);

  const address = booking?.address;
  const paymentStatus = customerPaymentStatus?.status ?? "pending_collection";
  const paymentType = customerPaymentStatus?.payment_type;

  return (
    <DashboardLayout title="Booking Details">
      {loading ? (
        <div className="customer-detail-state">Loading booking details...</div>
      ) : error ? (
        <div className="customer-detail-state error">
          <p>{error}</p>
          <Link to="/my-bookings">Back to my bookings</Link>
        </div>
      ) : booking ? (
        <div className="customer-booking-detail">
          <section className="customer-detail-hero">
            <div>
              <span className="booking-reference">
                {booking.booking_reference}
              </span>
              <h2>{booking.service_name}</h2>
              <p>
                {booking.scheduled_date} at {booking.scheduled_time.slice(0, 5)}
              </p>
            </div>
            <span className={`booking-status ${booking.booking_status}`}>
              {formatStatus(booking.booking_status)}
            </span>
          </section>

          <div className="customer-detail-grid">
            <section className="customer-detail-card">
              <h3>Service</h3>
              <dl>
                <div>
                  <dt>Price</dt>
                  <dd>
                    Rs. {formatMoney(booking.final_price ?? booking.estimated_price)}
                  </dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{booking.scheduled_date}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{booking.scheduled_time.slice(0, 5)}</dd>
                </div>
              </dl>
            </section>

            <section className="customer-detail-card">
              <h3>Address</h3>
              <p>
                {[address?.address_line1, address?.address_line2, address?.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                {[address?.state, address?.pincode, address?.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </section>

            {booking.booking_status === "completed" && (
              <section className="customer-detail-card payment-card">
                <h3>Payment</h3>
                {paymentStatus === "pending_collection" ? (
                  <p className="payment-pending">Payment pending collection</p>
                ) : (
                  <span className="customer-paid-pill">
                    Paid via {paymentType === "upi" ? "UPI" : "Cash"}
                  </span>
                )}
              </section>
            )}

            {booking.special_instructions && (
              <section className="customer-detail-card notes-card">
                <h3>Instructions</h3>
                <p>{booking.special_instructions}</p>
              </section>
            )}

            <BookingRatingPanel
              bookingId={booking.id}
              bookingStatus={booking.booking_status}
              perspective="customer"
              subjectName={booking.assignment?.cleaner_name}
            />
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

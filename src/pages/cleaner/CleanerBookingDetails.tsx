import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCleanerBooking } from "../../api/cleanerApi";
import { getApiErrorMessage } from "../../api/client";
import BookingRatingPanel from "../../components/BookingRatingPanel";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OpenInMapsButton from "../../components/OpenInMapsButton";
import { useAppDispatch } from "../../store/hooks";
import {
  collectPayment,
  loadAdminPayments,
  loadCleanerEarnings,
} from "../../store/slices/paymentSlice";
import type { Payment, PaymentStatus, PaymentType } from "../../types/apiTypes";
import type { CleanerBookingDetail } from "../../types/cleanerTypes";
import "./CleanerBookingDetails.css";

const formatStatus = (value?: string | null) =>
  value ? value.replace("_", " ") : "Not available";

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CleanerBookingDetails() {
  const { bookingId } = useParams();
  const dispatch = useAppDispatch();
  const [booking, setBooking] = useState<CleanerBookingDetail | null>(null);
  const [workflowPayment, setWorkflowPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [collectedAmount, setCollectedAmount] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");

  useEffect(() => {
    if (!bookingId) return;

    let active = true;

    fetchCleanerBooking(bookingId)
      .then((response) => {
        if (active) {
          setBooking(response.booking);
          const amount =
            response.booking.payment.amount ??
            response.booking.final_price ??
            response.booking.estimated_price;
          setCollectedAmount(String(amount));
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
    };
  }, [bookingId]);

  const address = booking?.address;
  const amount =
    booking?.payment.amount ?? booking?.final_price ?? booking?.estimated_price;
  const inferredPaymentStatus: PaymentStatus =
    workflowPayment?.status ??
    booking?.payment.payment_status ??
    "pending_collection";
  const inferredPaymentType =
    workflowPayment?.payment_type ??
    booking?.payment.payment_type ??
    (booking?.payment.payment_method?.toLowerCase() as PaymentType | undefined);
  const collectedDisplayAmount =
    workflowPayment?.collected_amount ??
    booking?.payment.collected_amount ??
    amount ??
    0;
  const canRecordPayment =
    booking?.booking_status === "completed" &&
    inferredPaymentStatus === "pending_collection";

  const handleCollectPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingId) return;

    const parsedAmount = Number(collectedAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setPaymentError("Enter a valid collected amount.");
      return;
    }

    setSubmittingPayment(true);
    setPaymentError("");
    setPaymentSuccess("");

    try {
      const response = await dispatch(
        collectPayment({
          bookingId,
          body: { amount: parsedAmount, payment_type: paymentType },
        }),
      ).unwrap();
      setWorkflowPayment(response.payment);
      setPaymentSuccess("Payment collection recorded successfully.");
      dispatch(loadCleanerEarnings());
      void dispatch(loadAdminPayments("collected"));
    } catch (err) {
      setPaymentError(String(err));
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <DashboardLayout title="Booking Details">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading booking details...</p>
        </div>
      ) : error ? (
        <div className="detail-state">
          <p>{error}</p>
          <Link to="/cleaner/dashboard">Back to dashboard</Link>
        </div>
      ) : booking ? (
        <div className="cleaner-booking-detail">
          <div className="detail-hero">
            <div>
              <span className="booking-reference">
                {booking.booking_reference}
              </span>
              <h2>{booking.service_name || "Service booking"}</h2>
              <p>
                {booking.scheduled_date} at {booking.scheduled_time.slice(0, 5)}
              </p>
            </div>
            <div className="hero-actions">
              <span className={`status-pill ${booking.booking_status}`}>
                {formatStatus(booking.booking_status)}
              </span>
              <OpenInMapsButton
                latitude={address?.latitude}
                longitude={address?.longitude}
              />
            </div>
          </div>

          <div className="detail-grid">
            <section className="detail-card">
              <h3>Customer</h3>
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{booking.customer_name || "Not available"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{booking.customer_phone || "Not available"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{booking.customer_email || "Not available"}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h3>Address</h3>
              <p className="full-address">
                {[address?.address_line1, address?.address_line2, address?.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="full-address">
                {[address?.state, address?.pincode, address?.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <dl>
                <div>
                  <dt>Latitude</dt>
                  <dd>{address?.latitude ?? "Not shared"}</dd>
                </div>
                <div>
                  <dt>Longitude</dt>
                  <dd>{address?.longitude ?? "Not shared"}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h3>Service</h3>
              <dl>
                <div>
                  <dt>Type</dt>
                  <dd>{booking.service_name || "Not available"}</dd>
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

            <section className="detail-card">
              <h3>Vehicle</h3>
              <dl>
                <div>
                  <dt>Make</dt>
                  <dd>{booking.vehicle_details.make || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{booking.vehicle_details.model || "Not provided"}</dd>
                </div>
                <div>
                  <dt>License Plate</dt>
                  <dd>
                    {booking.vehicle_details.license_plate || "Not provided"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h3>Payment</h3>
              <div className="payment-workflow">
                <span className={`payment-status ${inferredPaymentStatus}`}>
                  {formatStatus(inferredPaymentStatus)}
                </span>

                {canRecordPayment ? (
                  <form
                    className="record-payment-form"
                    onSubmit={handleCollectPayment}
                  >
                    <label>
                      <span>Amount Collected (Rs.)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={collectedAmount}
                        onChange={(event) =>
                          setCollectedAmount(event.target.value)
                        }
                      />
                    </label>

                    <label>
                      <span>Payment Type</span>
                      <select
                        value={paymentType}
                        onChange={(event) =>
                          setPaymentType(event.target.value as PaymentType)
                        }
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                      </select>
                    </label>

                    {paymentError && (
                      <p className="payment-message error">{paymentError}</p>
                    )}
                    {paymentSuccess && (
                      <p className="payment-message success">
                        {paymentSuccess}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="mark-collected-btn"
                      disabled={submittingPayment}
                    >
                      {submittingPayment ? "Saving..." : "Mark as Collected"}
                    </button>
                    <p className="earnings-note">
                      Earnings update after admin reconciliation.
                    </p>
                  </form>
                ) : inferredPaymentStatus === "collected" ||
                  inferredPaymentStatus === "split_done" ? (
                  <div className="payment-collected-summary">
                    <span
                      className={`payment-type-badge ${
                        inferredPaymentType || "cash"
                      }`}
                    >
                      {inferredPaymentType?.toUpperCase() || "CASH"}
                    </span>
                    <strong>
                      Rs. {formatMoney(collectedDisplayAmount)} collected via{" "}
                      {inferredPaymentType?.toUpperCase() || "Cash"}
                    </strong>
                  </div>
                ) : (
                  <p className="payment-muted">Payment pending collection.</p>
                )}
              </div>
            </section>

            {booking.special_instructions && (
              <section className="detail-card notes-card">
                <h3>Instructions</h3>
                <p>{booking.special_instructions}</p>
              </section>
            )}

            <BookingRatingPanel
              bookingId={booking.id}
              bookingStatus={booking.booking_status}
              perspective="cleaner"
              subjectName={booking.customer_name}
            />
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

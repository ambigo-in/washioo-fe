import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCleanerBooking } from "../../api/cleanerApi";
import { getApiErrorMessage } from "../../api/client";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OpenInMapsButton from "../../components/OpenInMapsButton";
import type { CleanerBookingDetail } from "../../types/cleanerTypes";
import "./CleanerBookingDetails.css";

const formatStatus = (value?: string | null) =>
  value ? value.replace("_", " ") : "Not available";

export default function CleanerBookingDetails() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<CleanerBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    let active = true;
    setLoading(true);
    setError("");

    fetchCleanerBooking(bookingId)
      .then((response) => {
        if (active) setBooking(response.booking);
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
  const amount = booking?.payment.amount ?? booking?.final_price ?? booking?.estimated_price;

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
              <dl>
                <div>
                  <dt>Status</dt>
                  <dd>{formatStatus(booking.payment.payment_status)}</dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd>Rs. {amount}</dd>
                </div>
                {booking.payment.payment_method && (
                  <div>
                    <dt>Method</dt>
                    <dd>{booking.payment.payment_method}</dd>
                  </div>
                )}
                {booking.payment.transaction_reference && (
                  <div>
                    <dt>Reference</dt>
                    <dd>{booking.payment.transaction_reference}</dd>
                  </div>
                )}
                {booking.payment.collected_by_cleaner !== undefined && (
                  <div>
                    <dt>Collected by Cleaner</dt>
                    <dd>{booking.payment.collected_by_cleaner ? "Yes" : "No"}</dd>
                  </div>
                )}
                {booking.payment.paid_at && (
                  <div>
                    <dt>Paid At</dt>
                    <dd>{new Date(booking.payment.paid_at).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </section>

            {booking.special_instructions && (
              <section className="detail-card notes-card">
                <h3>Instructions</h3>
                <p>{booking.special_instructions}</p>
              </section>
            )}
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

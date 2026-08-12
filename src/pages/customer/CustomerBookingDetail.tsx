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
import { formatAddress } from "../../utils/addressUtils";
import {
  formatDisplayDate,
  formatDisplayTime,
  formatScheduleDateTime,
} from "../../utils/dateTimeUtils";
import {
  getServicePriceLabel,
  getServiceExtraPaymentNote,
} from "../../utils/servicePriceUtils";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CustomerBookingDetail.css";

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CustomerBookingDetail() {
  const { bookingId } = useParams();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
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
  const cleanerDetails = booking?.assignment?.cleaner_details;
  const showCleanerDetails = Boolean(
    cleanerDetails &&
    booking &&
    ["accepted", "in_progress", "completed"].includes(booking.booking_status),
  );

  return (
    <DashboardLayout title={t("booking.details")}>
      {loading ? (
        <div className="customer-detail-state">
          {t("booking.loadingDetails")}
        </div>
      ) : error ? (
        <div className="customer-detail-state error">
          <p>{error}</p>
          <Link to="/my-bookings">{t("booking.backToMyBookings")}</Link>
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
                {formatScheduleDateTime(
                  booking.scheduled_date,
                  booking.scheduled_time,
                )}
              </p>
            </div>
            <span className={`booking-status ${booking.booking_status}`}>
              {t(
                `booking.${booking.booking_status === "in_progress" ? "inProgress" : booking.booking_status}`,
              )}
            </span>
          </section>

          <div className="customer-detail-grid">
            <section className="customer-detail-card">
              <h3>{t("common.service")}</h3>
              <dl>
                <div>
                  <dt>{t("common.price")}</dt>
                  <dd>
                    {booking.service ? (
                      <>
                        {getServicePriceLabel(booking.service!)}
                        {booking.service!.allow_extra_payment && (
                          <p className="service-extra-note small">
                            {getServiceExtraPaymentNote(booking.service!)}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        Rs.{" "}
                        {formatMoney(
                          booking.final_price ?? booking.estimated_price,
                        )}
                      </>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>{t("common.date")}</dt>
                  <dd>{formatDisplayDate(booking.scheduled_date)}</dd>
                </div>
                <div>
                  <dt>{t("common.time")}</dt>
                  <dd>{formatDisplayTime(booking.scheduled_time)}</dd>
                </div>
              </dl>
            </section>

            <section className="customer-detail-card">
              <h3>{t("common.vehicle")}</h3>
              <dl>
                <div>
                  <dt>{t("common.make")}</dt>
                  <dd>
                    {booking.vehicle_details?.make || t("common.notProvided")}
                  </dd>
                </div>
                <div>
                  <dt>{t("common.model")}</dt>
                  <dd>
                    {booking.vehicle_details?.model || t("common.notProvided")}
                  </dd>
                </div>
                <div>
                  <dt>{t("common.licensePlate")}</dt>
                  <dd>
                    {booking.vehicle_details?.license_plate ||
                      t("common.notProvided")}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="customer-detail-card">
              <h3>{t("common.address")}</h3>
              <p>{formatAddress(address)}</p>
            </section>

            {showCleanerDetails && cleanerDetails && (
              <section className="customer-detail-card cleaner-detail-card">
                <h3>{t("booking.cleanerDetails")}</h3>
                <div className="assigned-cleaner">
                  <div className="assigned-cleaner-photo">
                    {cleanerDetails.profile_photo_url ? (
                      <img src={cleanerDetails.profile_photo_url} alt="" />
                    ) : (
                      cleanerDetails.name?.charAt(0) || "C"
                    )}
                  </div>
                  <div>
                    <strong>
                      {cleanerDetails.name || t("common.cleaner")}
                    </strong>
                    <span>
                      {cleanerDetails.verification_badge
                        ? t("booking.verifiedCleaner")
                        : t("booking.verificationPending")}
                    </span>
                    <small>
                      {t("booking.cleanerSummary", {
                        rating: cleanerDetails.rating.toFixed(1),
                        jobs: cleanerDetails.experience,
                      })}
                    </small>
                  </div>
                </div>
              </section>
            )}

            {booking.booking_status === "completed" && (
              <section className="customer-detail-card payment-card">
                <h3>{t("booking.payment")}</h3>
                {paymentStatus === "pending_collection" ? (
                  <p className="payment-pending">
                    {t("booking.paymentPending")}
                  </p>
                ) : (
                  <span className="customer-paid-pill">
                    {t("booking.paidVia")}{" "}
                    {paymentType === "upi" ? t("common.upi") : t("common.cash")}
                  </span>
                )}
              </section>
            )}

            {booking.special_instructions && (
              <section className="customer-detail-card notes-card">
                <h3>{t("booking.instructions")}</h3>
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

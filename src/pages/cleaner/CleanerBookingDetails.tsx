import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCleanerBooking } from "../../api/cleanerApi";
import { getApiErrorMessage } from "../../api/client";
import BookingRatingPanel from "../../components/BookingRatingPanel";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import OpenInMapsButton from "../../components/OpenInMapsButton";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  acceptCleanerAssignment,
  rejectCleanerAssignment,
  startCleanerAssignment,
} from "../../store/slices/cleanerSlice";
import {
  collectPayment,
  loadAdminPayments,
  loadCleanerEarnings,
} from "../../store/slices/paymentSlice";
import type { Payment, PaymentStatus, PaymentType } from "../../types/apiTypes";
import type { CleanerBookingDetail } from "../../types/cleanerTypes";
import { formatAddress } from "../../utils/addressUtils";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CleanerBookingDetails.css";

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CleanerBookingDetails() {
  const { bookingId } = useParams();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { loading: paymentLoading } = useAppSelector((state) => state.payments);
  const [booking, setBooking] = useState<CleanerBookingDetail | null>(null);
  const [workflowPayment, setWorkflowPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [assignmentActionLoading, setAssignmentActionLoading] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");

  const loadBookingDetails = async (active = true) => {
    if (!bookingId) return;

    try {
      const response = await fetchCleanerBooking(bookingId);
      if (active) {
        setBooking(response.booking);
        const amount =
          response.booking.payment.amount ??
          response.booking.final_price ??
          response.booking.estimated_price;
        setCollectedAmount(String(amount));
        setError("");
      }
    } catch (err) {
      if (active) setError(getApiErrorMessage(err));
    } finally {
      if (active) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    void loadBookingDetails(active);

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const assignment = booking?.assignment;
  const canViewCustomerContact =
    assignment?.assignment_status === "accepted" ||
    assignment?.assignment_status === "in_progress" ||
    assignment?.assignment_status === "completed";

  const refreshAfterAssignmentAction = async (
    action: typeof acceptCleanerAssignment,
    notes: string,
  ) => {
    if (!assignment?.id) return;

    setActionError("");
    setAssignmentActionLoading(true);
    try {
      await dispatch(
        action({
          assignmentId: assignment.id,
          actionPayload: { cleaner_notes: notes },
        }),
      ).unwrap();
      await loadBookingDetails(true);
    } catch (err) {
      setActionError(String(err));
    } finally {
      setAssignmentActionLoading(false);
    }
  };

  const handleCollectPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingId) return;

    const parsedAmount = Number(collectedAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setPaymentError(t("cleaner.validCollectedAmount"));
      return;
    }

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
      setPaymentSuccess(t("cleaner.paymentCollected"));
      dispatch(loadCleanerEarnings());
      void dispatch(loadAdminPayments("collected"));
    } catch (err) {
      setPaymentError(String(err));
    }
  };

  return (
    <DashboardLayout title={t("booking.details")}>
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t("booking.loadingDetails")}</p>
        </div>
      ) : error ? (
        <div className="detail-state">
          <p>{error}</p>
          <Link to="/cleaner/dashboard">{t("common.backToDashboard")}</Link>
        </div>
      ) : booking ? (
        <div className="cleaner-booking-detail">
          <div className="detail-hero">
            <div>
              <span className="booking-reference">
                {booking.booking_reference}
              </span>
              <h2>{booking.service_name || t("booking.serviceBooking")}</h2>
              <p>
                {booking.scheduled_date} {t("common.time")} {booking.scheduled_time.slice(0, 5)}
              </p>
            </div>
            <div className="hero-actions">
              <span className={`status-pill ${booking.booking_status}`}>
                {t(`booking.${booking.booking_status === "in_progress" ? "inProgress" : booking.booking_status}`)}
              </span>
              <OpenInMapsButton
                latitude={address?.latitude}
                longitude={address?.longitude}
                mode="directions"
              />
            </div>
          </div>

          {actionError && (
            <p className="payment-message error">{actionError}</p>
          )}

          {assignment && assignment.assignment_status !== "completed" && (
            <div className="detail-action-bar">
              {assignment.assignment_status === "assigned" && (
                <>
                  <LoadingButton
                    className="btn-accept"
                    isLoading={assignmentActionLoading}
                    loadingText={t("cleaner.accepting")}
                    onClick={() =>
                      refreshAfterAssignmentAction(
                        acceptCleanerAssignment,
                        t("booking.accepted"),
                      )
                    }
                    type="button"
                  >
                    {t("cleaner.accept")}
                  </LoadingButton>
                  <LoadingButton
                    className="btn-reject"
                    isLoading={assignmentActionLoading}
                    loadingText={t("cleaner.rejecting")}
                    onClick={() =>
                      refreshAfterAssignmentAction(
                        rejectCleanerAssignment,
                        t("cleaner.rejected"),
                      )
                    }
                    type="button"
                  >
                    {t("cleaner.reject")}
                  </LoadingButton>
                </>
              )}
              {assignment.assignment_status === "accepted" && (
                <LoadingButton
                  className="btn-start"
                  isLoading={assignmentActionLoading}
                  loadingText={t("cleaner.starting")}
                  onClick={() =>
                    refreshAfterAssignmentAction(
                      startCleanerAssignment,
                      t("cleaner.starting"),
                    )
                  }
                  type="button"
                >
                  {t("cleaner.startService")}
                </LoadingButton>
              )}
            </div>
          )}

          <div className="detail-grid">
            <section className="detail-card">
              <h3>{t("cleaner.customer")}</h3>
              {canViewCustomerContact ? (
                <dl>
                  <div>
                    <dt>{t("common.name")}</dt>
                    <dd>{booking.customer_name || t("common.notAvailable")}</dd>
                  </div>
                  <div>
                    <dt>{t("common.phone")}</dt>
                    <dd>{booking.customer_phone || t("common.notAvailable")}</dd>
                  </div>
                </dl>
              ) : (
                <p className="privacy-note">
                  Accept this booking to view the customer's name and mobile
                  number.
                </p>
              )}
            </section>

            <section className="detail-card">
              <h3>{t("common.address")}</h3>
              <p className="full-address">{formatAddress(address)}</p>
            </section>

            <section className="detail-card">
              <h3>{t("common.service")}</h3>
              <dl>
                <div>
                  <dt>{t("common.type")}</dt>
                  <dd>{booking.service_name || t("common.notAvailable")}</dd>
                </div>
                <div>
                  <dt>{t("common.date")}</dt>
                  <dd>{booking.scheduled_date}</dd>
                </div>
                <div>
                  <dt>{t("common.time")}</dt>
                  <dd>{booking.scheduled_time.slice(0, 5)}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h3>{t("common.vehicle")}</h3>
              <dl>
                <div>
                  <dt>{t("common.make")}</dt>
                  <dd>{booking.vehicle_details.make || t("common.notProvided")}</dd>
                </div>
                <div>
                  <dt>{t("common.model")}</dt>
                  <dd>{booking.vehicle_details.model || t("common.notProvided")}</dd>
                </div>
                <div>
                  <dt>{t("common.licensePlate")}</dt>
                  <dd>
                    {booking.vehicle_details.license_plate || t("common.notProvided")}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h3>{t("booking.payment")}</h3>
              <div className="payment-workflow">
                <span className={`payment-status ${inferredPaymentStatus}`}>
                  {inferredPaymentStatus.replace("_", " ")}
                </span>

                {canRecordPayment ? (
                  <form
                    className="record-payment-form"
                    onSubmit={handleCollectPayment}
                  >
                    <label>
                      <span>{t("cleaner.amountCollected")}</span>
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
                      <span>{t("cleaner.paymentType")}</span>
                      <select
                        value={paymentType}
                        onChange={(event) =>
                          setPaymentType(event.target.value as PaymentType)
                        }
                      >
                        <option value="cash">{t("common.cash")}</option>
                        <option value="upi">{t("common.upi")}</option>
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

                    <LoadingButton
                      type="submit"
                      className="mark-collected-btn"
                      isLoading={paymentLoading}
                      loadingText={t("cleaner.updatePayment")}
                    >
                      {t("cleaner.markCollected")}
                    </LoadingButton>
                    <p className="earnings-note">
                      {t("cleaner.earningsReconcileNote")}
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
                      {t("cleaner.paymentCollectedSummary", {
                        amount: formatMoney(collectedDisplayAmount),
                        type: inferredPaymentType?.toUpperCase() || t("common.cash"),
                      })}
                    </strong>
                  </div>
                ) : (
                  <p className="payment-muted">{t("cleaner.paymentPendingCollection")}</p>
                )}
              </div>
            </section>

            {booking.special_instructions && (
              <section className="detail-card notes-card">
                <h3>{t("booking.instructions")}</h3>
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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import {
  PaginationControls,
  SearchInput,
  StatusTabs,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
  type StatusTabOption,
} from "../components/dashboard/DashboardControls";
import { LoadingButton } from "../components/ui";
import type { BookingStatus, CustomerBooking } from "../types/apiTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  cancelCustomerBooking,
  loadCustomerBookings,
  patchBooking,
} from "../store/slices/customerSlice";
import { formatAddress } from "../utils/addressUtils";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/myBookings.css";

const statusLabelKey: Record<BookingStatus, string> = {
  pending: "booking.pending",
  assigned: "cleaner.assignedBookings",
  accepted: "booking.accepted",
  in_progress: "booking.inProgress",
  completed: "booking.completed",
  cancelled: "common.cancelled",
};

const canCancel = (status: BookingStatus) => status === "pending";

const canEdit = (status: BookingStatus) => status === "pending";

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MyBookingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const {
    bookings,
    bookingsTotal,
    loading,
    error: storeError,
  } = useAppSelector((state) => state.customer);
  const query = useDashboardQueryState<"all" | BookingStatus>("all");
  const [editingId, setEditingId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [error, setError] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "date-desc" | "date-asc" | "price-desc" | "price-asc"
  >("date-desc");
  const [priceFilter, setPriceFilter] = useState<
    "all" | "0-100" | "100-500" | "500+"
  >("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  const formatPaymentMethod = (booking: CustomerBooking) => {
    const payment = booking.payment;
    if (payment?.payment_type) return payment.payment_type.toUpperCase();
    if (payment?.payment_status === "pending") {
      return t("booking.awaitingCollection");
    }
    return "N/A";
  };

  const formatPaymentStatus = (booking: CustomerBooking) => {
    const status = booking.payment?.payment_status;
    if (status === "done") return t("booking.done");
    if (status === "failed") return t("booking.failed");
    return t("booking.pending");
  };

  useEffect(() => {
    dispatch(
      loadCustomerBookings({ limit: query.pageSize, offset: query.offset }),
    );
  }, [dispatch, query.offset, query.pageSize]);

  // Helper functions for filtering
  const isDateInRange = (dateStr: string, range: string) => {
    const bookingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case "today":
        return bookingDate.toDateString() === today.toDateString();
      case "week": {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return bookingDate >= today && bookingDate <= weekEnd;
      }
      case "month": {
        const monthEnd = new Date(today);
        monthEnd.setMonth(today.getMonth() + 1);
        return bookingDate >= today && bookingDate <= monthEnd;
      }
      default:
        return true;
    }
  };

  const isPriceInRange = (amount: number, range: string) => {
    switch (range) {
      case "0-5000":
        return amount >= 0 && amount <= 5000;
      case "5000-10000":
        return amount > 5000 && amount <= 10000;
      case "10000+":
        return amount > 10000;
      default:
        return true;
    }
  };

  const sortBookings = (bookingsToSort: CustomerBooking[]) => {
    const sorted = [...bookingsToSort];
    switch (sortBy) {
      case "date-desc":
        return sorted.sort(
          (a, b) =>
            new Date(b.scheduled_date).getTime() -
            new Date(a.scheduled_date).getTime(),
        );
      case "date-asc":
        return sorted.sort(
          (a, b) =>
            new Date(a.scheduled_date).getTime() -
            new Date(b.scheduled_date).getTime(),
        );
      case "price-desc":
        return sorted.sort(
          (a, b) =>
            (b.final_price ?? b.estimated_price) -
            (a.final_price ?? a.estimated_price),
        );
      case "price-asc":
        return sorted.sort(
          (a, b) =>
            (a.final_price ?? a.estimated_price) -
            (b.final_price ?? b.estimated_price),
        );
      default:
        return sorted;
    }
  };

  const startEdit = (booking: CustomerBooking) => {
    setEditingId(booking.id);
    setEditDate(booking.scheduled_date);
    setEditTime(booking.scheduled_time.slice(0, 5));
    setEditInstructions(booking.special_instructions || "");
    setError("");
  };

  const handleUpdate = async (booking: CustomerBooking) => {
    setError("");

    try {
      await dispatch(
        patchBooking({
          bookingId: booking.id,
          changes: {
            scheduled_date: editDate,
            scheduled_time: editTime,
            special_instructions: editInstructions.trim() || null,
          },
        }),
      ).unwrap();
      setEditingId("");
    } catch (err) {
      setError(String(err));
    }
  };

  const handleCancel = async (booking: CustomerBooking) => {
    setError("");

    try {
      await dispatch(cancelCustomerBooking(booking.id)).unwrap();
      await dispatch(
        loadCustomerBookings({ limit: query.pageSize, offset: query.offset }),
      ).unwrap();
    } catch (err) {
      setError(String(err));
    }
  };
  const filteredBookings = bookings
    .filter((booking) =>
      query.status === "all" ? true : booking.booking_status === query.status,
    )
    .filter((booking) =>
      matchesSearch(booking, query.debouncedSearch, [
        (item) => item.booking_reference,
        (item) => item.service_name,
        (item) => item.booking_status,
        (item) => formatAddress(item.address),
      ]),
    )
    .filter((booking) =>
      isPriceInRange(
        booking.payment?.amount ??
          booking.final_price ??
          booking.estimated_price,
        priceFilter,
      ),
    )
    .filter((booking) =>
      isDateInRange(booking.scheduled_date, dateRangeFilter),
    );

  const sortedBookings = sortBookings(filteredBookings);

  const visibleBookings =
    query.debouncedSearch ||
    query.status !== "all" ||
    priceFilter !== "all" ||
    dateRangeFilter !== "all"
      ? paginateItems(sortedBookings, query.page, pageSize)
      : paginateItems(sortedBookings, query.page, pageSize);

  const totalVisible =
    query.debouncedSearch ||
    query.status !== "all" ||
    priceFilter !== "all" ||
    dateRangeFilter !== "all"
      ? sortedBookings.length
      : Math.min(pageSize, sortedBookings.length);
  const counts = bookings.reduce(
    (acc, booking) => {
      acc[booking.booking_status] += 1;
      return acc;
    },
    {
      pending: 0,
      assigned: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    } as Record<BookingStatus, number>,
  );
  const tabOptions: Array<StatusTabOption<"all" | BookingStatus>> = [
    { value: "all", label: "All", count: bookingsTotal || bookings.length },
    ...Object.entries(statusLabelKey).map(([value, labelKey]) => ({
      value: value as BookingStatus,
      label: t(labelKey),
      count: counts[value as BookingStatus],
    })),
  ];

  return (
    <>
      <Header />
      <section className="my-bookings-page">
        <div className="my-bookings-heading">
          <span>{t("booking.washesKicker")}</span>
          <h1>{t("booking.myBookings")}</h1>
          <p>{t("booking.trackHint")}</p>
        </div>

        {(error || storeError) && (
          <p className="form-alert error">{error || storeError}</p>
        )}
        <div className="dashboard-toolbar">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder={t("booking.searchPlaceholder")}
          />
          <div className="toolbar-filters">
            <select
              className="filter-select"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
            >
              <option value="all">{t("booking.allDates")}</option>
              <option value="today">{t("booking.today")}</option>
              <option value="week">{t("booking.thisWeek")}</option>
              <option value="month">{t("booking.thisMonth")}</option>
            </select>

            <select
              className="filter-select"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
            >
              <option value="all">{t("booking.allPrices")}</option>
              <option value="0-5000">Rs. 0 - 5,000</option>
              <option value="5000-10000">Rs. 5,000 - 10,000</option>
              <option value="10000+">Rs. 10,000+</option>
            </select>

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date-desc">{t("booking.newestFirst")}</option>
              <option value="date-asc">{t("booking.oldestFirst")}</option>
              <option value="price-desc">{t("booking.highestPrice")}</option>
              <option value="price-asc">{t("booking.lowestPrice")}</option>
            </select>

            <select
              className="filter-select page-size-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="5">{t("booking.pageSize", { count: 5 })}</option>
              <option value="10">{t("booking.pageSize", { count: 10 })}</option>
              <option value="15">{t("booking.pageSize", { count: 15 })}</option>
              <option value="20">{t("booking.pageSize", { count: 20 })}</option>
            </select>
          </div>
        </div>
        <StatusTabs
          value={query.status}
          options={tabOptions}
          onChange={query.setStatus}
        />

        {loading && bookings.length === 0 ? (
          <div className="loading-state">{t("booking.loadingList")}</div>
        ) : visibleBookings.length === 0 ? (
          <div className="empty-state">
            <h2>{t("booking.noBookings")}</h2>
            <p>{t("customer.noBookings")}</p>
          </div>
        ) : (
          <div className="bookings-list">
            {visibleBookings.map((booking) => (
              <article key={booking.id} className="booking-card">
                <div className="booking-card-top">
                  <div>
                    <span className="booking-reference">
                      {booking.booking_reference}
                    </span>
                    <h2>{booking.service_name}</h2>
                  </div>
                  <span className={`status-badge ${booking.booking_status}`}>
                    {t(statusLabelKey[booking.booking_status])}
                  </span>
                </div>

                <div className="booking-details-grid">
                  <div>
                    <span>{t("common.date")}</span>
                    <strong>{booking.scheduled_date}</strong>
                  </div>
                  <div>
                    <span>{t("common.time")}</span>
                    <strong>{booking.scheduled_time.slice(0, 5)}</strong>
                  </div>
                  <div>
                    <span>{t("common.price")}</span>
                    <strong>
                      Rs.{" "}
                      {formatMoney(
                        booking.payment?.amount ??
                          booking.final_price ??
                          booking.estimated_price,
                      )}
                    </strong>
                  </div>
                  {booking.payment && (
                    <>
                      <div>
                        <span>{t("booking.paymentStatus")}</span>
                        <strong>{formatPaymentStatus(booking)}</strong>
                      </div>
                      <div>
                        <span>{t("booking.paymentMethod")}</span>
                        <strong>{formatPaymentMethod(booking)}</strong>
                      </div>
                    </>
                  )}
                </div>

                <div className="booking-address">
                  <span>{t("common.address")}</span>
                  <p>{formatAddress(booking.address)}</p>
                </div>

                {booking.special_instructions && (
                  <div className="booking-address">
                    <span>{t("booking.instructions")}</span>
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
                      placeholder={t("booking.specialInstructions")}
                      value={editInstructions}
                      onChange={(event) =>
                        setEditInstructions(event.target.value)
                      }
                    />
                    <div className="booking-actions">
                      <LoadingButton
                        isLoading={loading}
                        loadingText={t("common.saving")}
                        onClick={() => handleUpdate(booking)}
                        type="button"
                      >
                        {t("common.save")}
                      </LoadingButton>
                      <button
                        className="secondary-action"
                        onClick={() => setEditingId("")}
                        type="button"
                      >
                        {t("booking.cancelEdit")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="booking-actions">
                    <Link
                      className="secondary-action"
                      to={`/customer/bookings/${booking.id}`}
                    >
                      {t("actions.viewDetails")}
                    </Link>
                    {canEdit(booking.booking_status) && (
                      <button onClick={() => startEdit(booking)} type="button">
                        {t("booking.editPending")}
                      </button>
                    )}
                    {canCancel(booking.booking_status) && (
                      <LoadingButton
                        className="danger-action"
                        isLoading={loading}
                        loadingText={t("booking.cancelling")}
                        onClick={() => handleCancel(booking)}
                        type="button"
                      >
                        {t("common.cancel")}
                      </LoadingButton>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
        <PaginationControls
          page={query.page}
          pageSize={pageSize}
          total={totalVisible}
          onPageChange={query.setPage}
        />
      </section>
    </>
  );
};

export default MyBookingsPage;

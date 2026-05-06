import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BookingStatus } from "../../types/apiTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  PaginationControls,
  SearchInput,
  StatusTabs,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
  type StatusTabOption,
} from "../../components/dashboard/DashboardControls";
import { LoadingButton } from "../../components/ui";
import { fetchBookingsByStatus } from "../../api/adminApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  assignAdminBooking,
  loadAdminBookings,
  loadAdminCleaners,
} from "../../store/slices/adminSlice";
import { formatAddress } from "../../utils/addressUtils";
import "./AdminBookings.css";

type FilterStatus = "all" | BookingStatus;

export default function AdminBookings() {
  const dispatch = useAppDispatch();
  const { bookings, bookingsTotal, cleaners, loading } = useAppSelector(
    (state) => state.admin,
  );
  const query = useDashboardQueryState<FilterStatus>("all");
  const [selectedCleaner, setSelectedCleaner] = useState<string>("");
  const [assignError, setAssignError] = useState("");
  const [statusCounts, setStatusCounts] = useState<Record<BookingStatus, number>>({
    pending: 0,
    assigned: 0,
    accepted: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    dispatch(
      loadAdminBookings({
        status: query.status,
        limit: query.pageSize,
        offset: query.offset,
      }),
    );
  }, [dispatch, query.offset, query.pageSize, query.status]);

  useEffect(() => {
    let active = true;
    Promise.all(
      ([
        "pending",
        "assigned",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ] as BookingStatus[]).map(async (status) => {
        const response = await fetchBookingsByStatus(status, { limit: 1, offset: 0 });
        return [status, response.total] as const;
      }),
    )
      .then((entries) => {
        if (active) setStatusCounts(Object.fromEntries(entries) as Record<BookingStatus, number>);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [bookingsTotal]);

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
    setAssignError("");
    try {
      await dispatch(
        assignAdminBooking({ bookingId, cleanerId: selectedCleaner }),
      ).unwrap();
      await dispatch(
        loadAdminBookings({
          status: query.status,
          limit: query.pageSize,
          offset: query.offset,
        }),
      ).unwrap();
      setSelectedCleaner("");
    } catch (error) {
      setAssignError(String(error));
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
  const filteredBookings = bookings.filter((booking) =>
    matchesSearch(booking, query.debouncedSearch, [
      (item) => item.booking_reference,
      (item) => item.customer_name,
      (item) => item.customer_phone,
      (item) => item.service_name,
      (item) => item.assignment?.cleaner_name,
      (item) => formatAddress(item.address),
    ]),
  );
  const visibleBookings = query.debouncedSearch
    ? paginateItems(filteredBookings, query.page, query.pageSize)
    : filteredBookings;
  const totalVisible = query.debouncedSearch ? filteredBookings.length : bookingsTotal;
  const tabOptions: Array<StatusTabOption<FilterStatus>> = statusFilters.map((status) => ({
    value: status,
    label: status === "all" ? "All" : status.replace("_", " "),
    count:
      status === "all"
        ? Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
        : statusCounts[status],
  }));

  return (
    <DashboardLayout title="Manage Bookings">
      <div className="admin-bookings">
        <div className="dashboard-toolbar">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder="Search bookings, customers, cleaners..."
          />
        </div>
        <StatusTabs value={query.status} options={tabOptions} onChange={query.setStatus} />

        {loading && bookings.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : visibleBookings.length > 0 ? (
          <>
          {assignError && <p className="form-alert error">{assignError}</p>}
          <div className="bookings-list">
            {visibleBookings.map((booking) => (
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
                      {formatAddress(booking.address)}
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
                    <LoadingButton
                      className="btn-assign"
                      onClick={() => handleAssign(booking.id)}
                      isLoading={loading}
                      loadingText="Assigning..."
                      disabled={
                        !selectedCleaner
                      }
                    >
                      Assign Cleaner
                    </LoadingButton>
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
          <PaginationControls
            page={query.page}
            pageSize={query.pageSize}
            total={totalVisible}
            onPageChange={query.setPage}
          />
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

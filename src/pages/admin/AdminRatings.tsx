import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { fetchAllBookings } from "../../api/adminApi";
import { fetchAdminRatings } from "../../api/ratingApi";
import { getApiErrorMessage } from "../../api/client";
import {
  PaginationControls,
  SearchInput,
  StatusTabs,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
} from "../../components/dashboard/DashboardControls";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import type { AdminBooking } from "../../types/adminTypes";
import type { RatingResponse, RatingReviewerRole } from "../../types/ratingTypes";
import "./AdminRatings.css";

type RatingFilter = "all" | RatingReviewerRole;

const filters: { label: string; value: RatingFilter }[] = [
  { label: "All", value: "all" },
  { label: "Customers", value: "customer" },
  { label: "Cleaners", value: "cleaner" },
];

function RatingStars({ value }: { value: number }) {
  return (
    <span
      className="admin-rating-stars"
      style={{ "--rating": String(value) } as CSSProperties}
      aria-label={`${value.toFixed(1)} out of 5`}
    >
      ★★★★★
    </span>
  );
}

const formatRole = (role: RatingReviewerRole) =>
  role === "customer" ? "Customer to cleaner" : "Cleaner to customer";

export default function AdminRatings() {
  const [ratings, setRatings] = useState<RatingResponse[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = useDashboardQueryState<RatingFilter>("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminRatings({
      reviewerRole: query.status,
      page: query.page,
      limit: query.pageSize,
    })
      .then((response) => {
        if (!active) return;
        setRatings(response.ratings);
        setTotal(response.total);
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
  }, [query.page, query.pageSize, query.status]);

  useEffect(() => {
    let active = true;
    fetchAllBookings({ limit: 500, offset: 0 })
      .then((response) => {
        if (active) setBookings(response.bookings);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const bookingById = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings],
  );
  const filteredRatings = ratings.filter((rating) => {
    const booking = bookingById.get(rating.booking_id);
    return matchesSearch(rating, query.debouncedSearch, [
      (item) => item.reviewee_name,
      (item) => item.comment,
      (item) => item.reviewer_role,
      (item) => item.rating,
      () => booking?.booking_reference,
      () => booking?.customer_name,
      () => booking?.customer_phone,
      () => booking?.service_name,
      () => booking?.assignment?.cleaner_name,
    ]);
  });
  const visibleRatings = query.debouncedSearch
    ? paginateItems(filteredRatings, query.page, query.pageSize)
    : filteredRatings;
  const visibleTotal = query.debouncedSearch ? filteredRatings.length : total;

  return (
    <DashboardLayout title="Ratings">
      <div className="admin-ratings">
        <section className="ratings-toolbar">
          <div>
            <h2>Customer and Cleaner Ratings</h2>
            <p>Review feedback submitted after completed bookings.</p>
          </div>

          <StatusTabs
            value={query.status}
            options={filters}
            onChange={query.setStatus}
          />
        </section>

        <div className="dashboard-toolbar">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder="Search name, mobile, booking reference, service..."
          />
        </div>

        {error && <p className="ratings-alert">{error}</p>}

        {loading ? (
          <div className="ratings-state">
            <div className="loading-spinner" />
            <p>Loading ratings...</p>
          </div>
        ) : visibleRatings.length === 0 ? (
          <div className="ratings-state">
            <h3>No ratings found.</h3>
            <p>Ratings appear here after customers or cleaners submit them.</p>
          </div>
        ) : (
          <>
            <p className="ratings-count">
              {visibleTotal} rating{visibleTotal === 1 ? "" : "s"}
            </p>
            <div className="ratings-table">
              <table>
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Direction</th>
                    <th>Rating</th>
                    <th>Reviewee</th>
                    <th>Comment</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRatings.map((rating) => {
                    const booking = bookingById.get(rating.booking_id);

                    return (
                      <tr key={rating.id}>
                        <td>
                          <strong>
                            {booking?.booking_reference || rating.booking_id}
                          </strong>
                          <small>{booking?.service_name || "Service booking"}</small>
                        </td>
                        <td>
                          <strong>{booking?.customer_name || "N/A"}</strong>
                          <small>{booking?.customer_phone || "Mobile unavailable"}</small>
                        </td>
                        <td>
                          <span className={`reviewer-badge ${rating.reviewer_role}`}>
                            {formatRole(rating.reviewer_role)}
                          </span>
                        </td>
                        <td>
                          <div className="rating-score-cell">
                            <RatingStars value={rating.rating} />
                            <strong>{rating.rating.toFixed(1)}</strong>
                          </div>
                        </td>
                        <td>{rating.reviewee_name || booking?.assignment?.cleaner_name || "N/A"}</td>
                        <td>{rating.comment || "No comment"}</td>
                        <td>{new Date(rating.created_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationControls
              page={query.page}
              pageSize={query.pageSize}
              total={visibleTotal}
              onPageChange={query.setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

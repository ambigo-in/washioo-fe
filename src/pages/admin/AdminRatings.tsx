import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { fetchAdminRatings } from "../../api/ratingApi";
import { getApiErrorMessage } from "../../api/client";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
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
  const [filter, setFilter] = useState<RatingFilter>("all");
  const [bookingId, setBookingId] = useState("");
  const [appliedBookingId, setAppliedBookingId] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminRatings({
      reviewerRole: filter,
      bookingId: appliedBookingId.trim() || undefined,
      page: 1,
      limit: 50,
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
  }, [filter, appliedBookingId]);

  const handleBookingSearch = (event: FormEvent) => {
    event.preventDefault();
    setAppliedBookingId(bookingId);
  };

  return (
    <DashboardLayout title="Ratings">
      <div className="admin-ratings">
        <section className="ratings-toolbar">
          <div>
            <h2>Customer and Cleaner Ratings</h2>
            <p>Review feedback submitted after completed bookings.</p>
          </div>

          <div className="rating-filter-tabs">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? "active" : ""}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <form className="rating-booking-search" onSubmit={handleBookingSearch}>
          <label>
            <span>Booking ID</span>
            <input
              value={bookingId}
              onChange={(event) => setBookingId(event.target.value)}
              placeholder="Filter by booking UUID"
            />
          </label>
          <button type="submit">Apply</button>
          {appliedBookingId && (
            <button
              type="button"
              className="clear-filter-btn"
              onClick={() => {
                setBookingId("");
                setAppliedBookingId("");
              }}
            >
              Clear
            </button>
          )}
        </form>

        {error && <p className="ratings-alert">{error}</p>}

        {loading ? (
          <div className="ratings-state">
            <div className="loading-spinner" />
            <p>Loading ratings...</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="ratings-state">
            <h3>No ratings found.</h3>
            <p>Ratings appear here after customers or cleaners submit them.</p>
          </div>
        ) : (
          <>
            <p className="ratings-count">
              {total} rating{total === 1 ? "" : "s"}
            </p>
            <div className="ratings-table">
              <table>
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Direction</th>
                    <th>Rating</th>
                    <th>Reviewee</th>
                    <th>Comment</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((rating) => (
                    <tr key={rating.id}>
                      <td>{rating.booking_id}</td>
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
                      <td>{rating.reviewee_name || "N/A"}</td>
                      <td>{rating.comment || "No comment"}</td>
                      <td>{new Date(rating.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

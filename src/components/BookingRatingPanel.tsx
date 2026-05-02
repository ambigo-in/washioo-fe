import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  fetchBookingRatings,
  submitBookingRating,
} from "../api/ratingApi";
import { ApiError, getApiErrorMessage } from "../api/client";
import type { BookingStatus } from "../types/apiTypes";
import type { RatingResponse } from "../types/ratingTypes";
import "./BookingRatingPanel.css";

type RatingPerspective = "customer" | "cleaner";

interface BookingRatingPanelProps {
  bookingId: string;
  bookingStatus: BookingStatus;
  perspective: RatingPerspective;
  subjectName?: string | null;
}

const ratingOptions = [1, 2, 3, 4, 5];

const getTitle = (perspective: RatingPerspective) =>
  perspective === "customer" ? "Rate your cleaner" : "Rate this customer";

const getPrompt = (perspective: RatingPerspective, subjectName?: string | null) =>
  perspective === "customer"
    ? `Share how ${subjectName || "your cleaner"} handled this service.`
    : `Share how the visit went with ${subjectName || "this customer"}.`;

const formatRole = (role: string) =>
  role === "customer" ? "Customer rated cleaner" : "Cleaner rated customer";

function StarMeter({ value }: { value: number }) {
  return (
    <span
      className="rating-stars"
      aria-label={`${value.toFixed(1)} out of 5`}
      style={{ "--rating": String(value) } as CSSProperties}
    >
      ★★★★★
    </span>
  );
}

export default function BookingRatingPanel({
  bookingId,
  bookingStatus,
  perspective,
  subjectName,
}: BookingRatingPanelProps) {
  const [ratings, setRatings] = useState<RatingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isCompleted = bookingStatus === "completed";
  const title = useMemo(() => getTitle(perspective), [perspective]);
  const prompt = useMemo(
    () => getPrompt(perspective, subjectName),
    [perspective, subjectName],
  );

  const loadRatings = async () => {
    if (!isCompleted) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetchBookingRatings(bookingId);
      setRatings(response);
      setSubmitted(response.some((entry) => entry.reviewer_role === perspective));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRatings();
  }, [bookingId, isCompleted, perspective]);

  if (!isCompleted) return null;

  const commentLength = comment.trim().length;
  const commentTooLong = commentLength > 500;
  const canSubmit = rating >= 1 && rating <= 5 && !commentTooLong && !submitting;
  const showForm = !submitted;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      await submitBookingRating(bookingId, {
        booking_id: bookingId,
        rating,
        comment: comment.trim() || null,
      });
      setSubmitted(true);
      setComment("");
      setRating(0);
      await loadRatings();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitted(true);
        await loadRatings();
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="booking-rating-panel">
      <div className="rating-panel-header">
        <div>
          <h3>{title}</h3>
          <p>{prompt}</p>
        </div>
        {submitted && <span className="rating-submitted-pill">Submitted</span>}
      </div>

      {loading ? (
        <p className="rating-muted">Loading ratings...</p>
      ) : showForm ? (
        <form className="rating-form" onSubmit={handleSubmit}>
          <div className="rating-picker">
            <span>Your rating</span>
            <div className="rating-buttons" role="radiogroup" aria-label="Rating">
              {ratingOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={rating >= option ? "active" : ""}
                  aria-label={`${option} star${option > 1 ? "s" : ""}`}
                  onClick={() => setRating(option)}
                >
                  ★
                </button>
              ))}
            </div>
            <label className="half-rating-control">
              <span>{rating ? rating.toFixed(1) : "Select"} / 5</span>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={rating || 1}
                onChange={(event) => setRating(Number(event.target.value))}
              />
            </label>
          </div>

          <label className="rating-comment-field">
            <span>Review comment</span>
            <textarea
              maxLength={500}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Optional feedback"
            />
          </label>

          <div className="rating-form-footer">
            <span className={commentTooLong ? "char-count error" : "char-count"}>
              {commentLength}/500
            </span>
            <button type="submit" disabled={!canSubmit}>
              {submitting ? "Submitting..." : "Submit rating"}
            </button>
          </div>
        </form>
      ) : ratings.length > 0 ? (
        <div className="rating-list">
          {ratings.map((entry) => (
            <article key={entry.id} className="rating-result">
              <div>
                <span className="rating-role">{formatRole(entry.reviewer_role)}</span>
                <strong>{entry.reviewee_name || "Reviewee"}</strong>
              </div>
              <StarMeter value={entry.rating} />
              {entry.comment && <p>{entry.comment}</p>}
              <time dateTime={entry.created_at}>
                {new Date(entry.created_at).toLocaleString()}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <p className="rating-muted">
          Your rating has been submitted. The other rating will appear here once
          available.
        </p>
      )}

      {error && <p className="rating-error">{error}</p>}
    </section>
  );
}

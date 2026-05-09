import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  fetchBookingRatings,
} from "../api/ratingApi";
import { ApiError, getApiErrorMessage } from "../api/client";
import { LoadingButton } from "./ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { submitRating } from "../store/slices/ratingSlice";
import { useLanguage } from "../i18n/LanguageContext";
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

function StarMeter({ value, label }: { value: number; label: string }) {
  return (
    <span
      className="rating-stars"
      aria-label={label}
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
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { loading: submitting } = useAppSelector((state) => state.rating);
  const [ratings, setRatings] = useState<RatingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isCompleted = bookingStatus === "completed";
  const title = useMemo(
    () =>
      perspective === "customer"
        ? t("rating.rateCleaner")
        : t("rating.rateCustomer"),
    [perspective, t],
  );
  const prompt = useMemo(
    () =>
      perspective === "customer"
        ? t("rating.shareCleaner", {
            name: subjectName || t("rating.yourCleaner"),
          })
        : t("rating.shareCustomer", {
            name: subjectName || t("rating.thisCustomer"),
          }),
    [perspective, subjectName, t],
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

    setError("");

    try {
      await dispatch(
        submitRating({
          bookingId,
          body: {
            booking_id: bookingId,
            rating,
            comment: comment.trim() || null,
          },
        }),
      ).unwrap();
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
    }
  };

  return (
    <section className="booking-rating-panel">
      <div className="rating-panel-header">
        <div>
          <h3>{title}</h3>
          <p>{prompt}</p>
        </div>
        {submitted && (
          <span className="rating-submitted-pill">{t("rating.submitted")}</span>
        )}
      </div>

      {loading ? (
        <p className="rating-muted">{t("rating.loading")}</p>
      ) : showForm ? (
        <form className="rating-form" onSubmit={handleSubmit}>
          <div className="rating-picker">
            <span>{t("rating.yourRating")}</span>
            <div className="rating-buttons" role="radiogroup" aria-label={t("nav.ratings")}>
              {ratingOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={rating >= option ? "active" : ""}
                  aria-label={t(
                    option > 1 ? "rating.starsLabel" : "rating.starLabel",
                    { count: option },
                  )}
                  onClick={() => setRating(option)}
                >
                  ★
                </button>
              ))}
            </div>
            <label className="half-rating-control">
              <span>{rating ? rating.toFixed(1) : t("rating.select")} / 5</span>
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
            <span>{t("rating.reviewComment")}</span>
            <textarea
              maxLength={500}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={t("rating.optionalFeedback")}
            />
          </label>

          <div className="rating-form-footer">
            <span className={commentTooLong ? "char-count error" : "char-count"}>
              {commentLength}/500
            </span>
            <LoadingButton
              type="submit"
              isLoading={submitting}
              loadingText={t("rating.submitting")}
              disabled={!canSubmit}
            >
              {t("rating.submit")}
            </LoadingButton>
          </div>
        </form>
      ) : ratings.length > 0 ? (
        <div className="rating-list">
          {ratings.map((entry) => (
            <article key={entry.id} className="rating-result">
              <div>
                <span className="rating-role">
                  {entry.reviewer_role === "customer"
                    ? t("rating.customerRatedCleaner")
                    : t("rating.cleanerRatedCustomer")}
                </span>
                <strong>{entry.reviewee_name || t("rating.reviewee")}</strong>
              </div>
              <StarMeter value={entry.rating} label={`${entry.rating.toFixed(1)} / 5`} />
              {entry.comment && <p>{entry.comment}</p>}
              <time dateTime={entry.created_at}>
                {new Date(entry.created_at).toLocaleString()}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <p className="rating-muted">
          {t("rating.availableLater")}
        </p>
      )}

      {error && <p className="rating-error">{error}</p>}
    </section>
  );
}

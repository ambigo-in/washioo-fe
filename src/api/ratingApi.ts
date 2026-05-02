import { apiRequest, withQuery } from "./client";
import type {
  AdminRatingsResponse,
  RatingCreateRequest,
  RatingResponse,
  RatingReviewerRole,
  RatingSummary,
} from "../types/ratingTypes";

export const fetchBookingRatings = (bookingId: string) =>
  apiRequest<RatingResponse[]>(`/bookings/${bookingId}/ratings`, {
    auth: true,
  });

export const submitBookingRating = (
  bookingId: string,
  payload: RatingCreateRequest,
) =>
  apiRequest<RatingResponse>(`/bookings/${bookingId}/ratings`, {
    method: "POST",
    auth: true,
    body: payload,
  });

export const fetchCleanerRatingSummary = (cleanerId: string) =>
  apiRequest<RatingSummary>(`/cleaners/${cleanerId}/ratings`, {
    auth: true,
  });

export const fetchCustomerRatingSummary = (customerId: string) =>
  apiRequest<RatingSummary>(`/customers/${customerId}/ratings`, {
    auth: true,
  });

export const fetchAdminRatings = ({
  reviewerRole,
  bookingId,
  page = 1,
  limit = 50,
}: {
  reviewerRole?: RatingReviewerRole | "all";
  bookingId?: string;
  page?: number;
  limit?: number;
} = {}) =>
  apiRequest<AdminRatingsResponse>(
    withQuery("/admin/ratings", {
      reviewer_role: reviewerRole === "all" ? undefined : reviewerRole,
      booking_id: bookingId,
      page,
      limit,
    }),
    { auth: true },
  );

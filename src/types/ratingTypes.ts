export type RatingReviewerRole = "customer" | "cleaner";

export interface RatingCreateRequest {
  booking_id: string;
  rating: number;
  comment?: string | null;
}

export interface RatingResponse {
  id: string;
  booking_id: string;
  reviewer_role: RatingReviewerRole;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewee_name: string | null;
}

export interface RatingSummary {
  average_rating: number;
  total_ratings: number;
  recent_reviews?: RatingResponse[];
}

export interface AdminRatingsResponse {
  ratings: RatingResponse[];
  total: number;
  page: number;
  limit: number;
}

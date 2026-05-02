import { apiRequest } from "./client";
import { withQuery, type PaginationParams } from "./client";
import type { BookingPayload, CreatedBooking, CustomerBooking } from "../types/apiTypes";

export const createBooking = (payload: BookingPayload) =>
  apiRequest<{ message: string; booking: CreatedBooking }>("/services/book", {
    method: "POST",
    auth: true,
    body: payload,
  });

export const fetchBookings = (params: PaginationParams = {}) =>
  apiRequest<{ message: string; bookings: CustomerBooking[]; total: number }>(
    withQuery("/services/my-bookings", { limit: 50, offset: 0, ...params }),
    { auth: true },
  );

export const fetchBooking = (bookingId: string) =>
  apiRequest<{ message: string; booking: CustomerBooking }>(
    `/services/my-bookings/${bookingId}`,
    { auth: true },
  );

export const updateBooking = (
  bookingId: string,
  payload: Partial<BookingPayload>,
) =>
  apiRequest<{ message: string; booking: CustomerBooking }>(
    `/services/my-bookings/${bookingId}`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

export const cancelBooking = (bookingId: string, reason = "Cancelled by customer") =>
  apiRequest<{ message: string; booking: CustomerBooking }>(
    `/services/my-bookings/${bookingId}/cancel`,
    {
      method: "POST",
      auth: true,
      body: { reason },
    },
  );


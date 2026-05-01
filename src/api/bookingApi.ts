import { apiRequest } from "./client";
import type { BookingPayload, CustomerBooking } from "../types/apiTypes";

export const createBooking = (payload: BookingPayload) =>
  apiRequest<{ message: string; booking: CustomerBooking }>("/services/book", {
    method: "POST",
    auth: true,
    body: payload,
  });

export const fetchBookings = () =>
  apiRequest<{ message: string; bookings: CustomerBooking[]; total: number }>(
    "/services/my-bookings",
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


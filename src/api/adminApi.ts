import { apiRequest } from "./client";
import type {
  AdminBooking,
  AdminServiceCategory,
  ServiceCategoryPayload,
  CleanerFilters,
} from "../types/adminTypes";
import type { CleanerProfile } from "../types/cleanerTypes";
import type { Assignment } from "../types/cleanerTypes";
import type { BookingStatus } from "../types/apiTypes";

// Admin Dashboard
export const fetchAdminDashboard = () =>
  apiRequest<{ message: string; admin_id: string; roles: string[] }>(
    "/auth/admin/dashboard",
    { auth: true },
  );

// Service Category APIs
export const fetchAdminServiceCategories = () =>
  apiRequest<{
    message: string;
    services: AdminServiceCategory[];
    total: number;
  }>("/services/");

export const createServiceCategory = (payload: ServiceCategoryPayload) =>
  apiRequest<{ message: string; service: AdminServiceCategory }>(
    "/services/admin/service-categories",
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  );

export const updateServiceCategory = (
  serviceId: string,
  payload: Partial<ServiceCategoryPayload>,
) =>
  apiRequest<{ message: string; service: AdminServiceCategory }>(
    `/services/admin/service-categories/${serviceId}`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

export const deleteServiceCategory = (serviceId: string) =>
  apiRequest<{ message: string; service_id: string }>(
    `/services/admin/service-categories/${serviceId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );

// Booking APIs
export const fetchAllBookings = () =>
  apiRequest<{ message: string; bookings: AdminBooking[]; total: number }>(
    "/services/admin/all-bookings",
    { auth: true },
  );

export const fetchAdminBooking = (bookingId: string) =>
  apiRequest<{ message: string; booking: AdminBooking }>(
    `/services/admin/bookings/${bookingId}`,
    { auth: true },
  );

export const fetchBookingsByStatus = (status: BookingStatus) =>
  apiRequest<{
    message: string;
    status: string;
    bookings: AdminBooking[];
    total: number;
  }>(`/services/admin/bookings-by-status/${status}`, { auth: true });

export const fetchCustomerBookings = (customerId: string) =>
  apiRequest<{
    message: string;
    customer_id: string;
    bookings: AdminBooking[];
    total: number;
  }>(`/services/admin/customers/${customerId}/bookings`, { auth: true });

export const updateAdminBooking = (
  bookingId: string,
  payload: {
    service_category_id?: string;
    address_id?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    special_instructions?: string;
    booking_status?: BookingStatus;
    estimated_price?: number;
    final_price?: number;
  },
) =>
  apiRequest<{ message: string; booking: AdminBooking }>(
    `/services/admin/bookings/${bookingId}`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

export const assignBooking = (
  bookingId: string,
  payload: { cleaner_id: string; cleaner_notes?: string },
) =>
  apiRequest<{ message: string; assignment: Assignment }>(
    `/services/admin/bookings/${bookingId}/assign`,
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  );

// Cleaner Profile APIs
export const fetchCleaners = (filters?: CleanerFilters) => {
  const params = new URLSearchParams();
  if (filters?.approval_status)
    params.append("approval_status", filters.approval_status);
  if (filters?.availability_status)
    params.append("availability_status", filters.availability_status);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<{
    message: string;
    cleaners: CleanerProfile[];
    total: number;
  }>(`/services/admin/cleaners${query}`, { auth: true });
};

export const fetchCleaner = (cleanerId: string) =>
  apiRequest<{ message: string; cleaner: CleanerProfile }>(
    `/services/admin/cleaners/${cleanerId}`,
    { auth: true },
  );

export const createCleanerProfile = (payload: {
  user_id: string;
  vehicle_type?: string;
  government_id_number?: string;
  service_radius_km?: number;
  approval_status?: string;
  availability_status?: string;
}) =>
  apiRequest<{ message: string; cleaner: CleanerProfile }>(
    "/services/admin/cleaners",
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  );

export const updateCleanerProfile = (
  cleanerId: string,
  payload: Partial<CleanerProfile>,
) =>
  apiRequest<{ message: string; cleaner: CleanerProfile }>(
    `/services/admin/cleaners/${cleanerId}`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

export const deleteCleanerProfile = (cleanerId: string) =>
  apiRequest<{ message: string; cleaner_id: string }>(
    `/services/admin/cleaners/${cleanerId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );

// Assignment APIs
export const fetchAdminAssignments = (status?: string) => {
  const query = status ? `?status=${status}` : "";
  return apiRequest<{
    message: string;
    assignments: Assignment[];
    total: number;
  }>(`/services/admin/assignments${query}`, { auth: true });
};

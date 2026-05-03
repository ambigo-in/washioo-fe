import { apiRequest, withQuery, type PaginationParams } from "./client";
import type {
  AdminBooking,
  AdminServiceCategory,
  ServiceCategoryPayload,
  CleanerFilters,
  AdminUser,
  AdminPayment,
} from "../types/adminTypes";
import type { CleanerProfile } from "../types/cleanerTypes";
import type { Assignment } from "../types/cleanerTypes";
import type { BookingStatus, LegacyPaymentStatus } from "../types/apiTypes";
import { normalizeIndianPhone } from "../utils/phoneUtils";

// Admin Dashboard
export const fetchAdminDashboard = () =>
  apiRequest<{ message: string; admin_id: string; roles: string[] }>(
    "/auth/admin/dashboard",
    { auth: true },
  );

// Service Category APIs
export const fetchAdminServiceCategories = (params: PaginationParams = {}) =>
  apiRequest<{
    message: string;
    services: AdminServiceCategory[];
    total: number;
  }>(withQuery("/services/", { limit: 50, offset: 0, ...params }));

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
export const fetchAllBookings = (params: PaginationParams = {}) =>
  apiRequest<{ message: string; bookings: AdminBooking[]; total: number }>(
    withQuery("/services/admin/all-bookings", {
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );

export const fetchAdminBooking = (bookingId: string) =>
  apiRequest<{ message: string; booking: AdminBooking }>(
    `/services/admin/bookings/${bookingId}`,
    { auth: true },
  );

export const fetchBookingsByStatus = (
  status: BookingStatus,
  params: PaginationParams = {},
) =>
  apiRequest<{
    message: string;
    status: string;
    bookings: AdminBooking[];
    total: number;
  }>(
    withQuery(`/services/admin/bookings-by-status/${status}`, {
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );

export const fetchCustomerBookings = (
  customerId: string,
  params: PaginationParams = {},
) =>
  apiRequest<{
    message: string;
    customer_id: string;
    bookings: AdminBooking[];
    total: number;
  }>(
    withQuery(`/services/admin/customers/${customerId}/bookings`, {
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );

export const updateAdminBooking = (
  bookingId: string,
  payload: {
    service_category_id?: string;
    address_id?: string;
    vehicle_id?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    special_instructions?: string;
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
  return apiRequest<{
    message: string;
    cleaners: CleanerProfile[];
    total: number;
  }>(
    withQuery("/services/admin/cleaners", {
      limit: 50,
      offset: 0,
      ...filters,
    }),
    { auth: true },
  );
};

export const fetchCleaner = (cleanerId: string) =>
  apiRequest<{ message: string; cleaner: CleanerProfile }>(
    `/services/admin/cleaners/${cleanerId}`,
    { auth: true },
  );

export const createCleanerProfile = (payload: {
  user_id: string;
  vehicle_type?: string;
  aadhaar_number: string;
  driving_license_number?: string;
  service_radius_km?: number;
  approval_status?: string;
  availability_status?: string;
}) =>
  apiRequest<{ message: string; cleaner: CleanerProfile }>(
    "/services/admin/cleaners",
    {
      method: "POST",
      auth: true,
      body: {
        ...payload,
        aadhaar_number: payload.aadhaar_number.replace(/\D/g, ""),
        driving_license_number:
          payload.driving_license_number?.trim() || undefined,
      },
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
export const fetchAdminAssignments = (
  status?: string,
  params: PaginationParams = {},
) => {
  return apiRequest<{
    message: string;
    assignments: Assignment[];
    total: number;
  }>(
    withQuery("/services/admin/assignments", {
      status,
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );
};

// Payment APIs
export const fetchPaymentStats = () =>
  apiRequest<{
    message: string;
    statistics: {
      total_payments: number;
      pending_count: number;
      paid_count: number;
      failed_count: number;
      total_amount_paid: number;
      total_amount_pending: number;
    };
  }>("/payments/stats", { auth: true });

export const fetchPayments = (
  status?: LegacyPaymentStatus,
  params: PaginationParams = {},
) =>
  apiRequest<{
    message: string;
    payments: AdminPayment[];
    total: number;
    pending_count: number;
    paid_count: number;
    failed_count: number;
  }>(
    withQuery("/payments/", {
      limit: 50,
      offset: 0,
      status,
      ...params,
    }),
    {
      auth: true,
    },
  );

export const fetchPaymentByBooking = (bookingId: string) =>
  apiRequest<{ message: string; payment: AdminPayment }>(
    `/payments/booking/${bookingId}`,
    { auth: true },
  );

export const fetchPaymentsByCustomer = (
  customerId: string,
  params: PaginationParams = {},
) =>
  apiRequest<{
    message: string;
    customer_id: string;
    payments: AdminPayment[];
    total: number;
  }>(
    withQuery(`/payments/customer/${customerId}`, {
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );

export const fetchPayment = (paymentId: string) =>
  apiRequest<{ message: string; payment: AdminPayment }>(
    `/payments/${paymentId}`,
    { auth: true },
  );

export type UpdatePaymentPayload = Partial<{
  payment_method: string;
  payment_status: LegacyPaymentStatus;
  transaction_reference: string;
  amount: number;
  collected_by_cleaner: boolean;
  paid_at: string;
}>;

export const updatePayment = (
  paymentId: string,
  payload: UpdatePaymentPayload,
) =>
  apiRequest<{ message: string; payment: AdminPayment }>(
    `/payments/${paymentId}`,
    {
      method: "PUT",
      auth: true,
      body: payload,
    },
  );

export const markPaymentPaid = (
  paymentId: string,
  transactionReference?: string,
) =>
  apiRequest<{ message: string; payment: AdminPayment }>(
    withQuery(`/payments/${paymentId}/mark-paid`, {
      transaction_reference: transactionReference,
    }),
    {
      method: "POST",
      auth: true,
    },
  );

export const markPaymentFailed = (paymentId: string) =>
  apiRequest<{ message: string; payment: AdminPayment }>(
    `/payments/${paymentId}/mark-failed`,
    {
      method: "POST",
      auth: true,
    },
  );

export const deletePayment = (paymentId: string) =>
  apiRequest<{ message: string }>(`/payments/${paymentId}`, {
    method: "DELETE",
    auth: true,
  });

// User Management APIs
export const fetchUsers = (
  params: PaginationParams & { role?: "customer" | "cleaner" | "admin" } = {},
) =>
  apiRequest<{ message: string; users: AdminUser[]; total: number }>(
    withQuery("/users/", { limit: 50, offset: 0, ...params }),
    { auth: true },
  );

export const fetchUser = (userId: string) =>
  apiRequest<{ message: string; user: AdminUser }>(`/users/${userId}`, {
    auth: true,
  });

export const updateUser = (
  userId: string,
  payload: { full_name?: string; email?: string; phone?: string },
) =>
  apiRequest<{ message: string; user: AdminUser }>(`/users/${userId}`, {
    method: "PUT",
    auth: true,
    body: payload.phone
      ? { ...payload, phone: normalizeIndianPhone(payload.phone) }
      : payload,
  });

export const deleteUser = (userId: string) =>
  apiRequest<{ message: string }>(`/users/${userId}`, {
    method: "DELETE",
    auth: true,
  });

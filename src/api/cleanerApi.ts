import { apiRequest, withQuery, type PaginationParams } from "./client";
import type {
  CleanerProfile,
  CleanerNotification,
  Assignment,
  CleanerBookingDetail,
  AvailabilityPayload,
  AssignmentActionPayload,
  CompleteAssignmentPayload,
  WebPushPublicKeyResponse,
  WebPushSubscriptionPayload,
} from "../types/cleanerTypes";

// Cleaner Profile APIs
export const fetchCleanerProfile = () =>
  apiRequest<{ message: string; cleaner: CleanerProfile }>(
    "/services/cleaner/profile",
    { auth: true },
  );

export const updateCleanerAvailability = (payload: AvailabilityPayload) =>
  apiRequest<{ message: string; cleaner: CleanerProfile }>(
    "/services/cleaner/availability",
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

// Assignment APIs
export const fetchCleanerAssignments = (
  status?: string,
  params: PaginationParams = {},
) => {
  return apiRequest<{
    message: string;
    assignments: Assignment[];
    total: number;
  }>(
    withQuery("/services/cleaner/assignments", {
      status,
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );
};

export const fetchCleanerAssignment = (assignmentId: string) =>
  apiRequest<{ message: string; assignment: Assignment }>(
    `/services/cleaner/assignments/${assignmentId}`,
    { auth: true },
  );

export const fetchCleanerBooking = (bookingId: string) =>
  apiRequest<{ message: string; booking: CleanerBookingDetail }>(
    `/cleaner/bookings/${bookingId}`,
    { auth: true },
  );

export const acceptAssignment = (
  assignmentId: string,
  payload: AssignmentActionPayload,
) =>
  apiRequest<{ message: string; assignment: Assignment }>(
    `/services/cleaner/assignments/${assignmentId}/accept`,
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  );

export const rejectAssignment = (
  assignmentId: string,
  payload: AssignmentActionPayload,
) =>
  apiRequest<{ message: string; assignment: Assignment }>(
    `/services/cleaner/assignments/${assignmentId}/reject`,
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  );

export const startAssignment = (
  assignmentId: string,
  payload: AssignmentActionPayload,
) =>
  apiRequest<{ message: string; assignment: Assignment }>(
    `/services/cleaner/assignments/${assignmentId}/start`,
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  );

export const completeAssignment = (
  assignmentId: string,
  payload: CompleteAssignmentPayload,
) =>
  apiRequest<{ message: string; assignment: Assignment }>(
    `/services/cleaner/assignments/${assignmentId}/complete`,
    {
      method: "POST",
      auth: true,
      body: payload,
    },
  );

// Legacy alias for jobs endpoint
export const fetchCleanerJobs = () =>
  apiRequest<{ message: string; assignments: Assignment[]; total: number }>(
    withQuery("/auth/cleaner/jobs", { limit: 50, offset: 0 }),
    { auth: true },
  );

export const fetchCleanerPushPublicKey = () =>
  apiRequest<WebPushPublicKeyResponse>("/cleaner/push/public-key", {
    auth: true,
  });

export const saveCleanerPushSubscription = (
  payload: WebPushSubscriptionPayload,
) =>
  apiRequest<{
    message: string;
    subscription: { id: string; is_active: boolean };
  }>("/cleaner/push/subscriptions", {
    method: "POST",
    auth: true,
    body: payload,
  });

export const deleteCleanerPushSubscription = (endpoint: string) =>
  apiRequest<{ message: string }>("/cleaner/push/subscriptions", {
    method: "DELETE",
    auth: true,
    body: { endpoint },
    retryOnUnauthorized: false,
  });

export const fetchCleanerNotifications = (
  params: PaginationParams & { unread_only?: boolean } = {},
) =>
  apiRequest<{
    message: string;
    notifications: CleanerNotification[];
    total: number;
  }>(
    withQuery("/cleaner/notifications", {
      unread_only: false,
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );

export const markCleanerNotificationRead = (notificationId: string) =>
  apiRequest<{ message: string; notification: CleanerNotification }>(
    `/cleaner/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      auth: true,
    },
  );

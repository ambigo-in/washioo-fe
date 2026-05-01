import { apiRequest } from "./client";
import type {
  CleanerProfile,
  Assignment,
  AvailabilityPayload,
  AssignmentActionPayload,
  CompleteAssignmentPayload,
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
export const fetchCleanerAssignments = (status?: string) => {
  const query = status ? `?status=${status}` : "";
  return apiRequest<{
    message: string;
    assignments: Assignment[];
    total: number;
  }>(`/services/cleaner/assignments${query}`, { auth: true });
};

export const fetchCleanerAssignment = (assignmentId: string) =>
  apiRequest<{ message: string; assignment: Assignment }>(
    `/services/cleaner/assignments/${assignmentId}`,
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
    "/auth/cleaner/jobs",
    { auth: true },
  );

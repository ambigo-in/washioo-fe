import type { BookingStatus, Address, AssignmentSummary } from "./apiTypes";

export interface CleanerProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  vehicle_type: string | null;
  government_id_number: string | null;
  service_radius_km: number | null;
  approval_status: "pending" | "approved" | "rejected" | "suspended";
  availability_status: "offline" | "available" | "busy";
  rating: number;
  total_jobs_completed: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  cleaner_id: string;
  assignment_status: "assigned" | "accepted" | "rejected" | "completed";
  assigned_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cleaner_notes: string | null;
  booking_id: string;
  assigned_by_admin: string;
  cleaner: CleanerProfile;
  booking: {
    id: string;
    booking_reference: string;
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    service_name: string;
    service_category_id: string;
    scheduled_date: string;
    scheduled_time: string;
    booking_status: BookingStatus;
    estimated_price: number;
    final_price: number | null;
    special_instructions: string | null;
    address: Address;
    assignment: AssignmentSummary | null;
    created_at: string;
  };
}

export interface CleanerPayload {
  user_id: string;
  vehicle_type?: string;
  government_id_number?: string;
  service_radius_km?: number;
  approval_status?: "pending" | "approved" | "rejected" | "suspended";
  availability_status?: "offline" | "available" | "busy";
}

export interface AvailabilityPayload {
  availability_status: "offline" | "available" | "busy";
}

export interface AssignmentActionPayload {
  cleaner_notes?: string;
}

export interface CompleteAssignmentPayload extends AssignmentActionPayload {
  final_price?: number;
}

export interface AssignBookingPayload {
  cleaner_id: string;
  cleaner_notes?: string;
}

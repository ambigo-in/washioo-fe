import type {
  BookingStatus,
  Address,
  AssignmentSummary,
  PaymentStatus,
} from "./apiTypes";

export interface CleanerProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  vehicle_type: string | null;
  aadhaar_number_masked?: string | null;
  driving_license_number_masked?: string | null;
  has_aadhaar?: boolean;
  has_driving_license?: boolean;
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
  assignment_status:
    | "assigned"
    | "accepted"
    | "in_progress"
    | "rejected"
    | "completed"
    | "cancelled";
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

export interface CleanerBookingDetail {
  id: string;
  booking_reference: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  service_name: string | null;
  service_category_id: string;
  scheduled_date: string;
  scheduled_time: string;
  booking_status: BookingStatus;
  estimated_price: number;
  final_price: number | null;
  special_instructions: string | null;
  address: Address;
  assignment: AssignmentSummary | null;
  vehicle_details: {
    make: string | null;
    model: string | null;
    license_plate: string | null;
  };
  payment: {
    payment_status: PaymentStatus;
    amount: number;
    payment_method?: string | null;
    transaction_reference?: string | null;
    collected_by_cleaner?: boolean;
    paid_at?: string | null;
  };
  created_at: string;
}

export interface CleanerPayload {
  user_id: string;
  vehicle_type?: string;
  aadhaar_number?: string;
  driving_license_number?: string;
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

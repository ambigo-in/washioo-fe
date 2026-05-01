export type UserRole = "customer" | "cleaner" | "admin";

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string;
  email: string | null;
  is_verified: boolean;
  is_active: boolean;
  roles: UserRole[];
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  service_name: string;
  description: string | null;
  base_price: number;
  estimated_duration_minutes: number | null;
  is_active: boolean;
}

export interface Address {
  id: string;
  address_label: string | null;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
}

export interface AddressPayload {
  address_label?: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

export type BookingStatus =
  | "pending"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface AssignmentSummary {
  id: string;
  cleaner_id: string;
  assignment_status: "assigned" | "accepted" | "rejected" | "completed";
  assigned_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cleaner_notes: string | null;
}

export interface CustomerBooking {
  id: string;
  booking_reference: string;
  service_name: string;
  scheduled_date: string;
  scheduled_time: string;
  booking_status: BookingStatus;
  estimated_price: number;
  final_price: number | null;
  special_instructions: string | null;
  address: Address;
  assignment: AssignmentSummary | null;
  created_at: string;
}

export interface BookingPayload {
  service_category_id: string;
  scheduled_date: string;
  scheduled_time: string;
  special_instructions?: string | null;
  address_id?: string;
  address?: AddressPayload;
}


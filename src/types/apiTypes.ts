export type UserRole = "customer" | "cleaner" | "admin";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  url?: string | null;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string;
  email: string | null;
  is_verified: boolean;
  is_active: boolean;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  roles: UserRole[];
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  service_name: string;
  description: string | null;
  base_price: number;
  estimated_duration_minutes: number | null;
  allow_extra_payment?: boolean;
  max_extra_amount?: number | null;
  extra_payment_instructions?: string | null;
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
  location_verified?: boolean;
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
  location_verified?: boolean;
  is_default?: boolean;
}

export type CustomerVehicleType = "bike" | "car";

export interface CustomerVehicle {
  id: string;
  customer_id: string;
  vehicle_type: CustomerVehicleType;
  make: string | null;
  model: string | null;
  license_plate: string | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomerVehiclePayload {
  vehicle_type: CustomerVehicleType;
  make?: string | null;
  model?: string | null;
  license_plate?: string | null;
  is_default?: boolean;
}

export type BookingStatus =
  | "pending"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type LegacyPaymentStatus = "pending" | "paid" | "failed";

export type PaymentType = "cash" | "upi";

export type PaymentStatus = "pending_collection" | "collected" | "split_done";

export type CleanerHandoverStatus = "pending" | "settled";

export type CustomerBookingPaymentStatus = "pending" | "done" | "failed";

export interface PaymentRecord {
  id: string;
  booking_id: string;
  customer_id: string;
  payment_method: string | null;
  transaction_reference: string | null;
  amount: number;
  payment_status: LegacyPaymentStatus;
  collected_by_cleaner: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  customer_id?: string;
  collected_amount: number | null;
  payment_type: PaymentType | null;
  collected_by: string | null;
  collected_at: string | null;
  cleaner_share: number | null;
  admin_share: number | null;
  split_updated_by: string | null;
  split_updated_at: string | null;
  status: PaymentStatus;
  cleaner_handover_status?: CleanerHandoverStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CleanerPaymentCollectRequest {
  amount: number;
  payment_type: PaymentType;
}

export interface AdminPaymentSplitRequest {
  cleaner_share: number;
  admin_share: number;
}

export interface CleanerEarningsSummary {
  cleaner_id?: string;
  total_earned: number;
  admin_due: number;
  settled: number;
  admin_total?: number;
  pending_payout?: number;
  last_updated: string | null;
}

export interface CustomerPaymentStatus {
  booking_id?: string;
  status: PaymentStatus;
  payment_type: PaymentType | null;
  message?: string;
}

export interface AssignmentSummary {
  id: string;
  cleaner_id: string;
  cleaner_name?: string | null;
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
  expires_at?: string | null;
  auto_assigned?: boolean;
  assignment_rank?: number | null;
  assignment_score?: number | null;
  distance_km?: number | null;
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
  vehicle_details?: {
    id?: string | null;
    make: string | null;
    model: string | null;
    license_plate: string | null;
  };
  payment?: {
    payment_status: CustomerBookingPaymentStatus;
    legacy_payment_status?: LegacyPaymentStatus;
    payment_type?: PaymentType | null;
    amount: number;
    collected_amount?: number | null;
    cleaner_share?: number | null;
    admin_share?: number | null;
    cleaner_handover_status?: "pending" | "settled";
    payment_method?: string | null;
    transaction_reference?: string | null;
    paid_at?: string | null;
  };
  created_at: string;
}

export interface CreatedBooking {
  id: string;
  booking_reference: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  booking_status: BookingStatus;
  estimated_price: number;
  assignment?: AssignmentSummary | null;
  created_at: string;
}

export interface BookingPayload {
  service_category_id: string;
  scheduled_date: string;
  scheduled_time: string;
  special_instructions?: string | null;
  address_id?: string;
  address?: AddressPayload;
  vehicle_id?: string | null;
}

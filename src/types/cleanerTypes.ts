import type {
  BookingStatus,
  Address,
  AssignmentSummary,
  LegacyPaymentStatus,
  PaymentStatus,
  PaymentType,
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
  aadhaar_number?: string | null;
  driving_license_number?: string | null;
  identity_data_status?: "full_available" | "masked_legacy_data" | null;
  has_aadhaar?: boolean;
  has_driving_license?: boolean;
  service_radius_km: number | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_location_at?: string | null;
  last_available_at?: string | null;
  auto_assign_enabled?: boolean;
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
  assigned_by_admin: string | null;
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
    payment?: {
      payment_status: PaymentStatus;
      legacy_payment_status?: LegacyPaymentStatus;
      payment_type?: PaymentType | null;
      amount: number;
      collected_amount?: number | null;
      cleaner_share?: number | null;
      admin_share?: number | null;
      cleaner_handover_status?: "pending" | "settled";
      payment_method?: string | null;
      transaction_reference?: string | null;
      collected_by_cleaner?: boolean;
      paid_at?: string | null;
    };
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
    legacy_payment_status?: LegacyPaymentStatus;
    payment_type?: PaymentType | null;
    amount: number;
    collected_amount?: number | null;
    cleaner_share?: number | null;
    admin_share?: number | null;
    cleaner_handover_status?: "pending" | "settled";
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
  payment_method?: "UPI" | "Cash";
  payment_type?: PaymentType;
  collected_amount?: number;
  transaction_reference?: string;
  collected_by_cleaner?: boolean;
}

export interface AssignBookingPayload {
  cleaner_id: string;
  cleaner_notes?: string;
}

export interface WebPushPublicKeyResponse {
  message: string;
  web_push: {
    enabled: boolean;
    public_key: string | null;
  };
}

export interface WebPushSubscriptionPayload {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface CleanerNotification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  url?: string | null;
  is_read: boolean;
  created_at: string;
}

import type {
  BookingStatus,
  Address,
  AssignmentSummary,
  PaymentRecord,
  PaymentStatus,
  PaymentType,
} from "./apiTypes";
import type { PaginationParams } from "../api/client";

export type AdminPayment = PaymentRecord;

export interface AdminUser {
  id: string;
  full_name: string | null;
  phone: string;
  email: string | null;
  is_verified: boolean;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

export interface AdminServiceCategory {
  id: string;
  service_name: string;
  description: string | null;
  base_price: number;
  estimated_duration_minutes: number | null;
  allow_extra_payment: boolean;
  max_extra_amount: number | null;
  extra_payment_instructions: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ServiceCategoryPayload {
  service_name: string;
  description?: string;
  base_price: number;
  estimated_duration_minutes?: number;
  allow_extra_payment?: boolean;
  max_extra_amount?: number | null;
  extra_payment_instructions?: string | null;
  is_active?: boolean;
}

export interface AdminBooking {
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
  payment?: {
    payment_status: PaymentStatus;
    legacy_payment_status?: string;
    payment_type?: PaymentType | null;
    payment_method?: string | null;
    amount: number;
    collected_amount?: number | null;
    cleaner_share?: number | null;
    admin_share?: number | null;
    cleaner_handover_status?: "pending" | "settled";
  };
  created_at: string;
}

export interface AdminBookingFilters {
  status?: BookingStatus;
}

export interface CleanerFilters extends PaginationParams {
  approval_status?: "pending" | "approved" | "rejected" | "suspended";
  availability_status?: "offline" | "available" | "busy";
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  activeCleaners: number;
  totalRevenue: number;
  todayBookings: number;
  weekBookings: number;
}

export type CleanupTarget =
  | "otp_codes"
  | "refresh_tokens"
  | "notifications"
  | "assignment_attempts"
  | "push_subscriptions"
  | "audit_logs";

export interface CleanupPreviewItem {
  key: CleanupTarget;
  label: string;
  eligible_records: number;
}

export interface CleanupPreviewResponse {
  message: string;
  items: CleanupPreviewItem[];
}

export interface CleanupResultResponse {
  message: string;
  target?: CleanupTarget;
  deleted_count: number;
  results?: Record<CleanupTarget, number>;
}

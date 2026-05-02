export interface SendOtpResponse {
  message: string;
  user_exist?: boolean;
}

export type AccountType = "customer" | "cleaner" | "admin";

export interface SignUpPayload {
  full_name: string;
  phone_number: string;
  email?: string;
  otp_code: string;
  aadhaar_number?: string;
  driving_license_number?: string;
}

export interface SignInPayload {
  phone_number: string;
  otp_code: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  account_type: AccountType;
  user?: import("./apiTypes").UserProfile;
  cleaner?: import("./cleanerTypes").CleanerProfile;
  is_new_user?: boolean;
}


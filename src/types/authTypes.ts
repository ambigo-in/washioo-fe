export interface SendOtpResponse {
  message: string;
  account_type?: AccountType;
  roles?: AccountType[];
  user_exist?: boolean;
}

export interface AppConfigResponse {
  cleaner: {
    driving_license_required: boolean;
  };
}

export type AccountType = "customer" | "cleaner" | "admin";

export interface SignUpPayload {
  full_name: string;
  phone_number: string;
  email?: string;
  otp_code: string;
  terms_accepted?: boolean;
  aadhaar_number?: string;
  driving_license_number?: string;
}

export interface SignInPayload {
  phone_number: string;
  otp_code: string;
  terms_accepted?: boolean;
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
  terms_accepted?: boolean;
}


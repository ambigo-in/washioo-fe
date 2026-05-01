export interface SendOtpResponse {
  message: string;
  user_exist: boolean;
}

export interface SignUpPayload {
  full_name: string;
  phone_number: string;
  email?: string;
  otp_code: string;
  role: "customer" | "cleaner" | "admin";
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
  is_new_user?: boolean;
}


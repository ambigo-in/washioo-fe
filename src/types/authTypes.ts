export interface SendOtpResponse {
  message: string;
  user_exist: boolean;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

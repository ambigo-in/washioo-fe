import { apiRequest } from "./client";
import type {
  AuthResponse,
  SendOtpResponse,
  SignInPayload,
  SignUpPayload,
} from "../types/authTypes";
import type { UserProfile } from "../types/apiTypes";

export const sendOtp = (phone_number: string) =>
  apiRequest<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    body: { phone_number },
  });

export const signUp = (payload: SignUpPayload) =>
  apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: payload,
  });

export const signIn = (payload: SignInPayload) =>
  apiRequest<AuthResponse>("/auth/signin", {
    method: "POST",
    body: payload,
  });

export const getCurrentUser = () =>
  apiRequest<{ message: string; user: UserProfile }>("/auth/me", {
    auth: true,
  });

export const logoutUser = (refresh_token: string) =>
  apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    auth: true,
    body: { refresh_token },
    retryOnUnauthorized: false,
  });

export const updateProfile = (payload: {
  full_name?: string;
  email?: string;
  phone?: string;
}) =>
  apiRequest<{ message: string; user: UserProfile }>("/auth/profile", {
    method: "PATCH",
    auth: true,
    body: payload,
  });

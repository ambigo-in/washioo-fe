import { apiRequest } from "./client";
import type {
  AccountType,
  AuthResponse,
  SendOtpResponse,
  SignInPayload,
  SignUpPayload,
} from "../types/authTypes";
import type { UserProfile } from "../types/apiTypes";

export const sendOtp = (phone_number: string, accountType: AccountType = "customer") =>
  apiRequest<SendOtpResponse>(`/auth/${accountType}/send-otp`, {
    method: "POST",
    body: { phone_number },
  });

export const signUp = (
  payload: SignUpPayload,
  accountType: Exclude<AccountType, "admin"> = "customer",
) =>
  apiRequest<AuthResponse>(`/auth/${accountType}/signup`, {
    method: "POST",
    body: payload,
  });

export const signIn = (payload: SignInPayload, accountType: AccountType = "customer") =>
  apiRequest<AuthResponse>(`/auth/${accountType}/signin`, {
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
  apiRequest<{ message: string; user: UserProfile }>("/users/me", {
    method: "PATCH",
    auth: true,
    body: payload,
  });

export const createAdmin = (payload: {
  full_name: string;
  phone_number: string;
  email?: string;
}) =>
  apiRequest<{ message: string; admin: UserProfile }>("/auth/admin/create", {
    method: "POST",
    auth: true,
    body: payload,
  });

export const updateAdmin = (
  adminId: string,
  payload: { full_name?: string; email?: string; phone?: string },
) =>
  apiRequest<{ message: string; admin: UserProfile }>(`/auth/admin/${adminId}`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });

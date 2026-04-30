import { type AuthResponse, type SendOtpResponse } from "../types/authTypes";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const sendOtp = async (
  phone_number: string,
): Promise<SendOtpResponse> => {
  const response = await fetch(`${API_BASE}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number }),
  });

  if (!response.ok) throw new Error("OTP send failed");
  return response.json();
};

export const signUp = async (payload: any): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Signup failed");
  return response.json();
};

export const signIn = async (payload: any): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Signin failed");
  return response.json();
};

export const logoutUser = async (refresh_token: string) => {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
};

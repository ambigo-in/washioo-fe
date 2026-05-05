import type { UserRole } from "../types/apiTypes";

type AccessTokenPayload = {
  active_role?: UserRole;
  role?: UserRole;
  roles?: UserRole[];
  type?: string;
};

export const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
};

export const getAccessTokenPayload = (): AccessTokenPayload | null => {
  const token = getAccessToken();
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const getTokenActiveRole = () => {
  const payload = getAccessTokenPayload();
  return payload?.active_role ?? payload?.role ?? null;
};

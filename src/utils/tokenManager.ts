import type { UserRole } from "../types/apiTypes";

type AccessTokenPayload = {
  active_role?: UserRole;
  exp?: number;
  role?: UserRole;
  roles?: UserRole[];
  type?: string;
};

let cachedAccessToken: string | null = null;
let cachedAccessPayload: AccessTokenPayload | null = null;

export const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  cachedAccessToken = access;
  cachedAccessPayload = null;
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  cachedAccessToken = null;
  cachedAccessPayload = null;
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
  if (token === cachedAccessToken && cachedAccessPayload) {
    return cachedAccessPayload;
  }

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as AccessTokenPayload;
    cachedAccessToken = token;
    cachedAccessPayload = parsed;
    return parsed;
  } catch {
    cachedAccessToken = null;
    cachedAccessPayload = null;
    return null;
  }
};

export const getTokenActiveRole = () => {
  const payload = getAccessTokenPayload();
  return payload?.active_role ?? payload?.role ?? null;
};

export const shouldRefreshAccessToken = (bufferSeconds = 60) => {
  const payload = getAccessTokenPayload();
  if (!payload?.exp) return false;

  const expiresAt = payload.exp * 1000;
  return expiresAt - Date.now() <= bufferSeconds * 1000;
};

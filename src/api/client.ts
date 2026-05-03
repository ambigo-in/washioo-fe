import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../utils/tokenManager";

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_PREFIX = "/washioo-api";
const API_BASE_URL = rawApiBaseUrl.replace(/\/washioo-api\/?$/, "").replace(/\/$/, "");
const apiUrl = (path: string) => `${API_BASE_URL}${API_PREFIX}${path}`;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export const withQuery = (
  path: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const readErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") return fallback;

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((entry) => {
        if (entry && typeof entry === "object" && "msg" in entry) {
          return String((entry as { msg: unknown }).msg);
        }
        return null;
      })
      .filter(Boolean)
      .join(", ");
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" ? message : fallback;
};

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const refreshTokens = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(apiUrl("/auth/refresh-token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    clearTokens();
    return false;
  }

  saveTokens(payload.access_token, payload.refresh_token);
  return true;
};

export const apiRequest = async <T>(
  path: string,
  {
    method = "GET",
    body,
    auth = false,
    retryOnUnauthorized = true,
  }: RequestOptions = {},
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(apiUrl(path), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiRequest<T>(path, {
        method,
        body,
        auth,
        retryOnUnauthorized: false,
      });
    }
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(
      readErrorMessage(payload, "Something went wrong. Please try again."),
      response.status,
      payload,
    );
  }

  return payload as T;
};

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};


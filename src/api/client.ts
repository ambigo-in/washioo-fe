import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  shouldRefreshAccessToken,
} from "../utils/tokenManager";

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_PREFIX = "/washioo-api";
const API_BASE_URL = rawApiBaseUrl
  .replace(/\/washioo-api\/?$/, "")
  .replace(/\/$/, "");
const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${API_PREFIX}${normalizedPath}`;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
  dedupe?: boolean;
  priority?: "normal" | "background";
  signal?: AbortSignal;
  timeoutMs?: number;
};

type QueuedRequest<T> = {
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
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
  if (detail && typeof detail === "object") {
    const detailMessage = (detail as { message?: unknown }).message;
    if (typeof detailMessage === "string") return detailMessage;

    const errorCode = (detail as { error_code?: unknown }).error_code;
    if (typeof errorCode === "string") return errorCode;
  }

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

let refreshRequest: Promise<boolean> | null = null;
const readRequestCache = new Map<string, Promise<unknown>>();
const requestQueue: QueuedRequest<unknown>[] = [];
let activeQueuedRequests = 0;

const configuredMaxConcurrentReads = Number(
  import.meta.env.VITE_MAX_CONCURRENT_API_READS,
);
const MAX_CONCURRENT_API_READS =
  Number.isFinite(configuredMaxConcurrentReads) && configuredMaxConcurrentReads > 0
    ? configuredMaxConcurrentReads
    : 4;
const OVERLOAD_RETRY_STATUSES = new Set([429, 503]);
const configuredRequestTimeoutMs = Number(
  import.meta.env.VITE_API_REQUEST_TIMEOUT_MS,
);
const DEFAULT_REQUEST_TIMEOUT_MS =
  Number.isFinite(configuredRequestTimeoutMs) &&
  configuredRequestTimeoutMs > 0
    ? configuredRequestTimeoutMs
    : 15000;

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const createRequestSignal = (
  externalSignal?: AbortSignal,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  let timeoutId: number | null = null;
  const abort = () => controller.abort();

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener("abort", abort, { once: true });
  }

  if (timeoutMs > 0) {
    timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId != null) window.clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abort);
    },
  };
};

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

const parseRetryAfterMs = (value: string | null) => {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

  const retryDate = Date.parse(value);
  if (Number.isNaN(retryDate)) return null;
  return Math.max(0, retryDate - Date.now());
};

const runNextQueuedRequest = () => {
  if (
    activeQueuedRequests >= MAX_CONCURRENT_API_READS ||
    requestQueue.length === 0
  ) {
    return;
  }

  const queued = requestQueue.shift();
  if (!queued) return;

  activeQueuedRequests += 1;
  queued
    .run()
    .then(queued.resolve)
    .catch(queued.reject)
    .finally(() => {
      activeQueuedRequests -= 1;
      runNextQueuedRequest();
    });
};

const enqueueReadRequest = <T>(run: () => Promise<T>) => {
  if (activeQueuedRequests < MAX_CONCURRENT_API_READS) {
    activeQueuedRequests += 1;
    return run().finally(() => {
      activeQueuedRequests -= 1;
      runNextQueuedRequest();
    });
  }

  return new Promise<T>((resolve, reject) => {
    requestQueue.push({
      run: run as () => Promise<unknown>,
      resolve: resolve as (value: unknown) => void,
      reject,
    });
    runNextQueuedRequest();
  });
};

const refreshTokens = async () => {
  if (refreshRequest) return refreshRequest;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshRequest = (async () => {
    let response: Response;
    const requestSignal = createRequestSignal(undefined, DEFAULT_REQUEST_TIMEOUT_MS);
    try {
      response = await fetch(apiUrl("/auth/refresh-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: requestSignal.signal,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw new ApiError(
          "Session refresh timed out. Please try again.",
          408,
          null,
        );
      }
      throw new ApiError(
        "Session refresh is temporarily unavailable. Please try again.",
        503,
        null,
      );
    } finally {
      requestSignal.cleanup();
    }

    const payload = await parseResponse(response);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearTokens();
        return false;
      }
      throw new ApiError(
        readErrorMessage(payload, "Session refresh is temporarily unavailable. Please try again."),
        response.status,
        payload,
      );
    }

    const tokens = payload as { access_token?: string; refresh_token?: string };
    if (!tokens.access_token || !tokens.refresh_token) {
      clearTokens();
      return false;
    }

    saveTokens(tokens.access_token, tokens.refresh_token);
    return true;
  })().finally(() => {
    refreshRequest = null;
  });

  return refreshRequest;
};

export const apiRequest = async <T>(
  path: string,
  {
    method = "GET",
    body,
    auth = false,
    retryOnUnauthorized = true,
    dedupe = method === "GET",
    priority = "normal",
    signal,
    timeoutMs,
  }: RequestOptions = {},
): Promise<T> => {
  if (auth && shouldRefreshAccessToken()) {
    try {
      await refreshTokens();
    } catch {
      // Keep using the current access token when refresh is temporarily unavailable.
      // If the access token is already expired, the 401 retry path below will handle it.
    }
  }

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? {}
    : {
        "Content-Type": "application/json",
      };

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  const requestKey = `${method}:${auth ? "auth" : "public"}:${path}`;
  const shouldQueue = method === "GET" && auth;
  const shouldDedupe = method === "GET" && dedupe;

  if (shouldDedupe && readRequestCache.has(requestKey)) {
    return readRequestCache.get(requestKey) as Promise<T>;
  }

  const runFetch = async () => {
    const maxAttempts = method === "GET" ? 3 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const requestSignal = createRequestSignal(signal, timeoutMs);
      let response: Response;

      try {
        response = await fetch(apiUrl(path), {
          method,
          headers,
          body:
            body === undefined
              ? undefined
              : isFormData
                ? body
                : JSON.stringify(body),
          signal: requestSignal.signal,
        });
      } catch (error) {
        if (isAbortError(error)) {
          throw new ApiError("Request timed out or was cancelled.", 408, null);
        }
        throw error;
      } finally {
        requestSignal.cleanup();
      }

      if (
        attempt < maxAttempts &&
        OVERLOAD_RETRY_STATUSES.has(response.status)
      ) {
        const retryAfterMs = parseRetryAfterMs(response.headers.get("Retry-After"));
        const fallbackMs = priority === "background" ? 1500 : 600;
        await sleep(retryAfterMs ?? fallbackMs * attempt);
        continue;
      }

      return response;
    }

    throw new ApiError("Request could not be completed.", 503, null);
  };

  const responsePromise = shouldQueue
    ? enqueueReadRequest(runFetch)
    : runFetch();

  const requestPromise = (async (): Promise<T> => {
    const response = await responsePromise;

    if (response.status === 401 && auth && retryOnUnauthorized) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return apiRequest<T>(path, {
          method,
          body,
          auth,
          retryOnUnauthorized: false,
          dedupe,
          priority,
          signal,
          timeoutMs,
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
  })();

  if (shouldDedupe) {
    readRequestCache.set(requestKey, requestPromise);
    requestPromise.then(
      () => readRequestCache.delete(requestKey),
      () => readRequestCache.delete(requestKey),
    );
  }

  return requestPromise;
};

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

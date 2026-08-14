/* eslint-disable */
import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    skipUnwrap?: boolean;
    skipAuthRedirect?: boolean;
  }
  interface InternalAxiosRequestConfig {
    _retryCount?: number;
    skipAuthRedirect?: boolean;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const TIMEOUT = 15_000;
const MAX_RETRIES = 1;

const RETRYABLE_METHODS = new Set(["get", "head", "options"]);
const LOGOUT_PATH = "/buyer/auth/logout";
const ADMIN_LOGOUT_PATH = "/admin/auth/logout";
const DEVICE_ID_KEY = "device_id";

function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

// ─── Detect current panel from URL ────────────────────────────────────────
function isAdminPanel(): boolean {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return (
    p.startsWith("/admin-dashboard") ||
    p.startsWith("/settings") ||
    p.startsWith("/automation")
  );
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly errors: { field: string; message: string }[];
  readonly raw: unknown;

  constructor(opts: {
    message: string;
    status?: number | null;
    code?: string;
    errors?: { field: string; message: string }[];
    raw?: unknown;
  }) {
    super(opts.message);
    this.name   = "ApiError";
    this.status = opts.status ?? null;
    this.code   = opts.code ?? "UNKNOWN_ERROR";
    this.errors = opts.errors ?? [];
    this.raw    = opts.raw ?? null;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const ax  = error as any;
  const res = ax?.response;

  if (!res) {
    const isTimeout = ax?.code === "ECONNABORTED";
    return new ApiError({
      message : isTimeout ? "Request timed out." : "Network error. Please check your connection.",
      code    : ax?.code ?? "NETWORK_ERROR",
      raw     : error,
    });
  }

  return new ApiError({
    message : res.data?.message ?? res.data?.error ?? res.statusText ?? "Something went wrong.",
    status  : res.status,
    code    : res.data?.code ?? `HTTP_${res.status}`,
    errors  : Array.isArray(res.data?.errors) ? res.data.errors : [],
    raw     : error,
  });
}

let _logoutInProgress = false;

export const forceClientLogout = (reason: "security" | "expired" = "expired"): void => {
  if (typeof window === "undefined" || _logoutInProgress) return;

  const currentPath = window.location.pathname;

  // Already on a login page — don't redirect again
  if (
    currentPath.startsWith("/login") ||
    currentPath.startsWith("/admin/login")
  ) return;

  _logoutInProgress = true;

  const adminPanel = isAdminPanel();

  // Call correct logout endpoint to clear the right cookie
  const logoutEndpoint = adminPanel ? ADMIN_LOGOUT_PATH : LOGOUT_PATH;
  axios
    .post(`${BASE_URL}${logoutEndpoint}`, {}, { withCredentials: true })
    .catch(() => {});

  try { sessionStorage.clear(); } catch {}

  // Redirect to correct login page
  let targetUrl: string;
  if (adminPanel) {
    targetUrl = reason === "security"
      ? "/admin/login?error=security_violation"
      : `/admin/login?from=${encodeURIComponent(currentPath)}`;
  } else {
    targetUrl = reason === "security"
      ? "/login?error=security_violation"
      : `/login?from=${encodeURIComponent(currentPath)}`;
  }

  setTimeout(() => {
    window.location.replace(targetUrl);
    setTimeout(() => { _logoutInProgress = false; }, 1000);
  }, 100);
};

const apiClient = axios.create({
  baseURL         : BASE_URL,
  timeout         : TIMEOUT,
  withCredentials : true,
  headers         : { Accept: "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    config._retryCount ??= 0;

    const fingerprint = getDeviceFingerprint();
    if (fingerprint) setHeader(config, "x-device-fingerprint", fingerprint);

    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
      if (match) setHeader(config, "X-XSRF-TOKEN", decodeURIComponent(match[1]));
    }

    return config;
  },
  (err) => Promise.reject(normalizeError(err)),
);

function setHeader(config: InternalAxiosRequestConfig, key: string, value: string) {
  if (config.headers && typeof (config.headers as any).set === "function") {
    (config.headers as any).set(key, value);
  } else if (config.headers) {
    (config.headers as any)[key] = value;
  }
}

apiClient.interceptors.response.use(
  (response) => {
    const skipUnwrap = response.config?.skipUnwrap === true;
    if (!skipUnwrap && response.data?.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },

  async (error) => {
    const originalReq = error.config as InternalAxiosRequestConfig | undefined;
    if (!originalReq) return Promise.reject(normalizeError(error));

    const normalized = normalizeError(error);

    // Auth/login endpoints pe 401 se logout trigger mat karo
    const isAuthEndpoint =
      originalReq.url?.includes("/login") ||
      originalReq.url?.includes("/auth") ||
      originalReq.url?.includes("/verify") ||
      originalReq.url?.includes("/register");

    if (
      normalized.status === 401 &&
      !originalReq.skipAuthRedirect &&
      !isAuthEndpoint
    ) {
      const isSecurityViolation =
        normalized.code === "DEVICE_MISMATCH" ||
        normalized.message.toLowerCase().includes("mismatch");

      forceClientLogout(isSecurityViolation ? "security" : "expired");
      return Promise.reject(normalized);
    }

    const method = (originalReq.method ?? "get").toLowerCase();
    const isRetryableMethod = RETRYABLE_METHODS.has(method);
    const isTransient = !normalized.status || normalized.status === 503;
    const underLimit  = (originalReq._retryCount ?? 0) < MAX_RETRIES;

    if (isTransient && isRetryableMethod && underLimit) {
      originalReq._retryCount = (originalReq._retryCount ?? 0) + 1;
      const delay = 300 * 2 ** originalReq._retryCount;
      await new Promise((r) => setTimeout(r, delay));
      return apiClient.request(originalReq);
    }

    return Promise.reject(normalized);
  },
);

async function request<T>(
  method : string,
  path   : string,
  body?  : unknown,
  options: Omit<AxiosRequestConfig, "method" | "url" | "data"> = {},
): Promise<T> {
  const response = await apiClient.request<T>({ method, url: path, data: body, ...options });
  return response.data as T;
}

export const get   = <T>(path: string, opts?: Omit<AxiosRequestConfig, "method"|"url"|"data">) => request<T>("GET",    path, undefined, opts);
export const post  = <T>(path: string, body?: unknown, opts?: Omit<AxiosRequestConfig, "method"|"url"|"data">) => request<T>("POST",   path, body, opts);
export const put   = <T>(path: string, body?: unknown, opts?: Omit<AxiosRequestConfig, "method"|"url"|"data">) => request<T>("PUT",    path, body, opts);
export const patch = <T>(path: string, body?: unknown, opts?: Omit<AxiosRequestConfig, "method"|"url"|"data">) => request<T>("PATCH",  path, body, opts);
export const del   = <T>(path: string, body?: unknown, opts?: Omit<AxiosRequestConfig, "method"|"url"|"data">) => request<T>("DELETE", path, body, opts);

export default apiClient;
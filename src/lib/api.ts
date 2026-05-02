import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { tokenStorage } from "./storage";
import type { LoginResponse } from "@/types/api";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://saas-gym-production-b94b.up.railway.app";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshTokensOnce(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) return null;
      const { data } = await axios.post<LoginResponse>(
        `${baseURL}/api/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      tokenStorage.setUser(data.user);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;
    const url = original?.url || "";

    if (
      status === 401 &&
      !original._retry &&
      !url.includes("/api/auth/login") &&
      !url.includes("/api/auth/refresh")
    ) {
      original._retry = true;
      const newToken = await refreshTokensOnce();
      if (newToken) {
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };
        return api(original);
      }
      tokenStorage.clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

interface BackendError {
  error?: string;
  message?: string;
  errorCode?: string;
  statusCode?: number;
  errors?: Record<string, string[]> | string[] | null;
}

export function extractErrorMessage(err: unknown, fallback = "Algo salió mal."): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[api] error", err.response?.status, raw);
    }
    if (typeof raw === "string" && raw.trim()) return raw;
    const data = raw as BackendError | undefined;
    if (data) {
      if (typeof data.error === "string" && data.error) return data.error;
      if (typeof data.message === "string" && data.message) return data.message;
      if (data.errors) {
        const flat = Array.isArray(data.errors)
          ? data.errors
          : Object.values(data.errors).flat();
        if (flat.length) return flat.join(" · ");
      }
      if (typeof data.errorCode === "string" && data.errorCode) return data.errorCode;
    }
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS } from './endpoints';
import type { ApiError } from '@/types/api';

/** Type-safe helper to extract the DRF `detail` field from an Axios error. */
export function getApiErrorDetail(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data = error.response?.data as ApiError | undefined;
  return typeof data?.detail === 'string' ? data.detail : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance — same-origin requests; the middleware + rewrite layer in
// Next.js proxies /api/* to the Django backend and injects the Authorization
// header from the httpOnly auth cookie.
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─────────────────────────────────────────────────────────────────────────────
// Response interceptor — transparent token refresh on 401
// ─────────────────────────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest.url?.includes(
      ENDPOINTS.AUTH.REFRESH,
    );

    // If 401 on the refresh endpoint itself → session is dead
    if (is401 && isRefreshEndpoint) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // If 401 on any other request and not already retried
    if (is401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the BFF refresh endpoint — cookies are updated server-side
        await axios.post(ENDPOINTS.AUTH.REFRESH);
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Convenience wrapper for GET requests (replaces legacy lib/apiClient.ts)
// ─────────────────────────────────────────────────────────────────────────────

export async function apiFetch<T>(
  endpoint: string,
  options?: object,
): Promise<T> {
  const response = await apiClient.get(`/api/${endpoint}`, options);
  return response.data;
}

export default apiClient;

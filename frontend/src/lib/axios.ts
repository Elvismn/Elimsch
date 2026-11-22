import axios, { AxiosError } from 'axios';
import { API_TIMEOUT_MS, STORAGE_KEYS } from '@/config/app';
import { authBus } from '@/lib/authBus';
import type { ApiResponse, NormalizedError } from '@/types/api';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// Request: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Response: normalize errors + emit 401 for session-expired
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const normalized = normalizeError(error);

    // Session expired — only when we actually had a token,
    // and NOT for a /auth/login attempt (bad credentials).
    const isLoginAttempt = error.config?.url?.includes('/auth/login');
    const hadToken = Boolean(localStorage.getItem(STORAGE_KEYS.token));
    if (normalized.status === 401 && hadToken && !isLoginAttempt) {
      authBus.emitUnauthorized();
    }

    return Promise.reject(normalized);
  },
);

function normalizeError(error: AxiosError<ApiResponse<unknown>>): NormalizedError {
  if (error.response) {
    const { status, data } = error.response;
    return {
      status,
      message: data?.message || defaultMessageFor(status),
      errors: data?.errors ?? null,
      original: error,
    };
  }
  if (error.request) {
    return {
      status: 0,
      message: 'Network error — please check your connection.',
      errors: null,
      original: error,
    };
  }
  return {
    status: 0,
    message: error.message || 'Unexpected error',
    errors: null,
    original: error,
  };
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request.';
    case 401:
      return 'You are not signed in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Not found.';
    case 409:
      return 'This conflicts with an existing record.';
    case 429:
      return 'Too many attempts. Please try again later.';
    default:
      return status >= 500 ? 'Something went wrong on our end.' : 'Unexpected error.';
  }
}

/** Unwrap the universal `{ success, data, message, errors }` envelope. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  if (!res.data.success) {
    throw {
      status: 200,
      message: res.data.message || 'Request failed',
      errors: res.data.errors ?? null,
      original: res,
    } satisfies NormalizedError;
  }
  return res.data.data;
}
import axios from 'axios';
import { sanitizePayload, sanitizeText } from './sanitize.js';

// Must match bizzyqcu-server: PORT defaults to 5000, routes are mounted under /api/v1.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const AUTH_TOKEN_KEY = 'authToken';

// Pages that are reachable while signed out; a 401 here must not trigger a redirect loop.
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/seller-login-form',
  '/seller-login',
  '/seller-auth',
  '/seller-signup',
  '/seller-register',
  '/seller-signup/enterprise',
  '/seller-signup/individual',
  '/seller-signup/organization',
];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens and sanitizing payloads
apiClient.interceptors.request.use(
  (config) => {
    // 1. Auth header
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Request payload sanitization (skip FormData, Blobs, or explicit skip flag)
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    const isBinary = typeof Blob !== 'undefined' && (config.data instanceof Blob || config.data instanceof ArrayBuffer);

    if (config.data && !isFormData && !isBinary && !config.skipSanitization) {
      if (typeof config.data === 'object') {
        config.data = sanitizePayload(config.data);
      } else if (typeof config.data === 'string') {
        try {
          const parsed = JSON.parse(config.data);
          config.data = JSON.stringify(sanitizePayload(parsed));
        } catch {
          config.data = sanitizeText(config.data);
        }
      }
    }

    // 3. Query params sanitization
    if (config.params && typeof config.params === 'object' && !config.skipSanitization) {
      config.params = sanitizePayload(config.params);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Server error shapes (bizzyqcu-server):
 *   AppError         -> { success: false, message }
 *   Validation (400) -> { success: false, message: 'Validation failed', errors: [{ field, message }] }
 * Normalise both onto the thrown error so UI code can use error.apiMessage / error.fieldErrors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    error.apiMessage =
      data?.message ||
      (error.response ? 'Something went wrong. Please try again.' : 'Cannot reach the server. Please check your connection.');

    // { fieldName: 'message' } - the server validates { body, query, params } so zod paths
    // arrive as "body.qcuIdNumber"; strip that prefix and keep the rest (e.g. "items.0.quantity").
    error.fieldErrors = Array.isArray(data?.errors)
      ? data.errors.reduce((acc, { field, message }) => {
          const key = typeof field === 'string' ? field.replace(/^(body|query|params)\./, '') : field;
          if (key && !acc[key]) acc[key] = message;
          return acc;
        }, {})
      : {};

    if (error.response?.status === 401) {
      const hadToken = typeof localStorage !== 'undefined' ? !!localStorage.getItem(AUTH_TOKEN_KEY) : false;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }

      // Dispatch events to notify other open tabs and in-memory listeners
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: AUTH_TOKEN_KEY,
              oldValue: hadToken ? 'token' : null,
              newValue: null,
              storageArea: typeof localStorage !== 'undefined' ? localStorage : null,
            })
          );
        }
      } catch {
        // Safe fallback in test or non-browser environments
      }

      if (hadToken && typeof window !== 'undefined' && !PUBLIC_PATHS.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Convenience helpers for UI code */
export const getErrorMessage = (error) => error?.apiMessage || error?.message || 'Something went wrong.';
export const getFieldErrors = (error) => error?.fieldErrors || {};

export default apiClient;

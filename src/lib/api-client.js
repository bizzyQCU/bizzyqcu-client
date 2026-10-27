import axios from 'axios';

// Must match bizzyqcu-server: PORT defaults to 5000, routes are mounted under /api/v1.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const AUTH_TOKEN_KEY = 'authToken';

// Pages that are reachable while signed out; a 401 here must not trigger a redirect loop.
const PUBLIC_PATHS = ['/', '/login', '/signup', '/seller-register', '/seller-auth', '/seller-signup'];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (server expects `Authorization: Bearer <token>`)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // { fieldName: 'message' } - dotted paths from zod are kept as-is (e.g. "items.0.quantity")
    error.fieldErrors = Array.isArray(data?.errors)
      ? data.errors.reduce((acc, { field, message }) => {
          if (field && !acc[field]) acc[field] = message;
          return acc;
        }, {})
      : {};

    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      if (hadToken && !PUBLIC_PATHS.includes(window.location.pathname)) {
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

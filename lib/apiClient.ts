/**
 * Central API Client for Backend Integration
 *
 * This client handles all communication with the backend API:
 * - Automatically attaches Supabase access tokens
 * - Handles 401/403 errors globally
 * - Provides typed API methods
 */

import { supabase } from './supabase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export interface ApiError extends Error {
  status: number;
  details?: unknown;
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error implements ApiError {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Event emitter for auth errors
 */
type AuthErrorListener = (error: ApiClientError) => void;
const authErrorListeners: Set<AuthErrorListener> = new Set();

export function onAuthError(listener: AuthErrorListener): () => void {
  authErrorListeners.add(listener);
  return () => authErrorListeners.delete(listener);
}

function notifyAuthError(error: ApiClientError): void {
  authErrorListeners.forEach((listener) => listener(error));
}

/**
 * Get the current access token from Supabase session
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    // Fall back to localStorage token for backward compatibility
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}

/**
 * Build request headers with authentication
 */
async function buildHeaders(customHeaders?: HeadersInit): Promise<Headers> {
  const headers = new Headers(customHeaders);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = await getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  let data: ApiResponse<T>;

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { ok: response.ok, data: text as unknown as T };
  }

  // Handle authentication errors globally
  if (response.status === 401 || response.status === 403) {
    const error = new ApiClientError(
      data.error || (response.status === 401 ? 'Unauthorized' : 'Forbidden'),
      response.status,
      data.details
    );
    notifyAuthError(error);
    throw error;
  }

  // Handle other errors
  if (!response.ok) {
    throw new ApiClientError(
      data.error || `Request failed with status ${response.status}`,
      response.status,
      data.details
    );
  }

  return data;
}

/**
 * Make an API request
 */
async function request<T>(
  method: string,
  endpoint: string,
  options?: {
    body?: unknown;
    headers?: HeadersInit;
    skipAuth?: boolean;
  }
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
  const headers = options?.skipAuth
    ? new Headers(options.headers)
    : await buildHeaders(options?.headers);

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    // Network or other errors
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * API Client with typed methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T = unknown>(endpoint: string, options?: { headers?: HeadersInit; skipAuth?: boolean }) =>
    request<T>('GET', endpoint, options),

  /**
   * POST request
   */
  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: HeadersInit; skipAuth?: boolean }
  ) => request<T>('POST', endpoint, { ...options, body }),

  /**
   * PUT request
   */
  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: HeadersInit; skipAuth?: boolean }
  ) => request<T>('PUT', endpoint, { ...options, body }),

  /**
   * PATCH request
   */
  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: HeadersInit; skipAuth?: boolean }
  ) => request<T>('PATCH', endpoint, { ...options, body }),

  /**
   * DELETE request
   */
  delete: <T = unknown>(
    endpoint: string,
    options?: { headers?: HeadersInit; skipAuth?: boolean }
  ) => request<T>('DELETE', endpoint, options),
};

/**
 * Backend API endpoints helper
 */
export const endpoints = {
  // Auth endpoints
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    refreshToken: '/api/auth/refresh',
    profile: '/api/auth/profile',
    changePassword: '/api/auth/change-password',
    passwordReset: '/api/auth/password-reset',
    passwordResetConfirm: '/api/auth/password-reset-confirm',
    oauthCallback: '/api/auth/oauth/callback',
  },
  // Donation endpoints
  donations: {
    checkout: '/api/donations/checkout',
    history: '/api/donations',
    recurring: '/api/donations/recurring',
    cancel: (id: string) => `/api/donations/recurring/${id}/cancel`,
  },
  // Intake endpoints
  intakes: {
    submit: '/api/intakes',
    list: '/api/intakes',
    get: (id: string) => `/api/intakes/${id}`,
  },
  // Provider endpoints
  providers: {
    submit: '/api/providers',
    list: '/api/providers',
    get: (id: string) => `/api/providers/${id}`,
  },
  // Volunteer endpoints
  volunteers: {
    submit: '/api/volunteers',
    list: '/api/volunteers',
    get: (id: string) => `/api/volunteers/${id}`,
    hours: '/api/volunteers/hours',
    tasks: '/api/volunteers/tasks',
  },
  // Profile endpoints
  profile: {
    get: '/api/profile',
    update: '/api/profile',
    donationHistory: '/api/profile/donations',
    receipts: '/api/profile/receipts',
    volunteerHours: '/api/profile/volunteer-hours',
  },
  // Admin endpoints
  admin: {
    users: '/api/admin/users',
    donations: '/api/admin/donations',
    intakes: '/api/admin/intakes',
    providers: '/api/admin/providers',
    volunteers: '/api/admin/volunteers',
    reports: '/api/admin/reports',
  },
};

export default api;

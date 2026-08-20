/**
 * High-Performance API Client with Request Deduplication, Retries & Offline Fallback
 */

import { sanitizeInput, getAuthToken, setAuthToken, getRefreshToken, clearUserSession } from './authCookie';

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When accessing over Cloudflare Tunnel (*.trycloudflare.com) or external hostnames,
    // route requests relatively via Next.js reverse-proxy rewrites to prevent CORS and SSL/Mixed-Content errors.
    if (hostname && (hostname.endsWith('.trycloudflare.com') || (hostname !== 'localhost' && hostname !== '127.0.0.1'))) {
      return '/api/v1';
    }
  }
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return '/api/v1';
}

interface FetchOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
  dedupe?: boolean;
}

// In-flight request deduplication store
const inFlightRequests = new Map<string, Promise<any>>();

// Module-level deduplication for token refresh requests
let globalRefreshPromise: Promise<string> | null = null;

/**
 * Perform fetch with automatic deduplication, retry exponential backoff, and auth header injection
 */
export async function fetchWithRetry<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const { retries = isGet ? 1 : 0, backoffMs = 250, dedupe = isGet, headers = {}, ...rest } = options;

  const requestKey = `${options.method || 'GET'}:${url}`;

  // Request Deduplication — return in-flight request if identical request is pending
  if (dedupe && inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey) as Promise<T>;
  }

  const executeFetch = async (attempt: number): Promise<T> => {
    try {
      let authToken = getAuthToken();

      const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(headers as Record<string, string>),
      };

      let response = await fetch(url, {
        credentials: options.credentials || 'include',
        ...rest,
        headers: reqHeaders,
      });

      // Token Refresh Interceptor
      if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
        try {
          if (!globalRefreshPromise) {
            globalRefreshPromise = (async () => {
              try {
                const refreshToken = getRefreshToken();
                const res = await fetch(`${getApiUrl()}/auth/refresh`, {
                  method: 'POST',
                  credentials: options.credentials || 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: refreshToken || undefined }),
                });
                if (!res.ok) {
                  clearUserSession();
                  throw new Error('Session expired');
                }
                const result = await res.json();
                if (!result.success || !result.data?.token) {
                  clearUserSession();
                  throw new Error('Session expired');
                }
                setAuthToken(result.data.token, 7);
                return result.data.token;
              } finally {
                globalRefreshPromise = null;
              }
            })();
          }

          const newToken = await globalRefreshPromise;

          // Retry the request with the new access token
          reqHeaders['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            credentials: options.credentials || 'include',
            ...rest,
            headers: reqHeaders,
          });
        } catch (refreshError) {
          globalRefreshPromise = null;
          clearUserSession();
          throw new Error('Session expired. Please reconnect your wallet.');
        }
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          if (errorBody?.error?.message) {
            errorMessage = errorBody.error.message;
          } else if (errorBody?.message) {
            errorMessage = errorBody.message;
          } else {
            errorMessage = JSON.stringify(errorBody);
          }
        } catch (e) {
          // ignore JSON parsing errors
        }
        throw new Error(errorMessage);
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      if (attempt < retries) {
        const delay = backoffMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return executeFetch(attempt + 1);
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Unable to connect to API backend at ${getApiUrl()}. Please check if the API server is running.`);
      }
      throw error;
    }
  };

  const requestPromise = executeFetch(0).finally(() => {
    if (dedupe) {
      inFlightRequests.delete(requestKey);
    }
  });

  if (dedupe) {
    inFlightRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
}

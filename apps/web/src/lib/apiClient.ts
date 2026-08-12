/**
 * High-Performance API Client with Request Deduplication, Retries & Offline Fallback
 */

import { sanitizeInput, getCookie, setCookie, deleteCookie } from './authCookie';

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:4000/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
}

interface FetchOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
  dedupe?: boolean;
}

// In-flight request deduplication store
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Perform fetch with automatic deduplication, retry exponential backoff, and auth header injection
 */
export async function fetchWithRetry<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 2, backoffMs = 1000, dedupe = true, headers = {}, ...rest } = options;

  const requestKey = `${options.method || 'GET'}:${url}`;

  // Request Deduplication — return in-flight request if identical request is pending
  if (dedupe && inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey) as Promise<T>;
  }

  let refreshPromise: Promise<string> | null = null;

  const executeFetch = async (attempt: number): Promise<T> => {
    try {
      let authToken = getCookie('jlt_auth_token');

      const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
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
          if (!refreshPromise) {
            refreshPromise = (async () => {
              const res = await fetch(`${getApiUrl()}/auth/refresh`, {
                method: 'POST',
                credentials: options.credentials || 'include',
                headers: { 'Content-Type': 'application/json' },
              });
              if (!res.ok) {
                deleteCookie('jlt_auth_token');
                throw new Error('Session expired');
              }
              const result = await res.json();
              if (!result.success || !result.data?.token) {
                deleteCookie('jlt_auth_token');
                throw new Error('Session expired');
              }
              setCookie('jlt_auth_token', result.data.token, { days: 7 });
              return result.data.token;
            })();
          }

          const newToken = await refreshPromise;
          refreshPromise = null;

          // Retry the request with the new access token
          reqHeaders['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            credentials: options.credentials || 'include',
            ...rest,
            headers: reqHeaders,
          });
        } catch (refreshError) {
          refreshPromise = null;
          deleteCookie('jlt_auth_token');
          // Invalidate React Query cache if window exists
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
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

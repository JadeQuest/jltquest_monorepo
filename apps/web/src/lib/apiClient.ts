/**
 * High-Performance API Client with Request Deduplication, Retries & Offline Fallback
 */

import { sanitizeInput, getCookie } from './authCookie';

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

  const executeFetch = async (attempt: number): Promise<T> => {
    try {
      const authToken = getCookie('jlt_auth_token');

      const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(headers as Record<string, string>),
      };

      const response = await fetch(url, {
        ...rest,
        headers: reqHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (attempt < retries) {
        const delay = backoffMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return executeFetch(attempt + 1);
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

import type { ApiResponse } from '@jlt/types';

interface CacheEntry<T> {
  expiresAt: number;
  response: ApiResponse<T>;
}

interface GetOptions {
  cacheTtlMs?: number;
  signal?: AbortSignal;
}

export class ApiClient {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(private baseUrl: string) {}

  async get<T>(path: string, options: GetOptions = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const cacheTtlMs = options.cacheTtlMs ?? 30_000;
    const cached = this.cache.get(url);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.response as ApiResponse<T>;
    }

    const res = await fetch(url, {
      signal: options.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`GET ${path} failed with ${res.status}`);
    }

    const response = (await res.json()) as ApiResponse<T>;
    if (cacheTtlMs > 0) {
      this.cache.set(url, {
        expiresAt: Date.now() + cacheTtlMs,
        response,
      });
    }

    return response;
  }
}

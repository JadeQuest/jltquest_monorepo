import type { ApiResponse } from '@jlt/types';

export class ApiClient {
  constructor(private baseUrl: string) {}

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`);
    return res.json();
  }
}

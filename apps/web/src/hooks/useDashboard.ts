import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';
import type { ApiResponse, UserDashboardDto } from '@jlt/types';

export type DashboardData = UserDashboardDto;

export function useDashboard() {
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  return useQuery({
    queryKey: ['dashboard', address],
    queryFn: async (): Promise<UserDashboardDto> => {
      const response = await fetchWithRetry<ApiResponse<UserDashboardDto>>(`${getApiUrl()}/users/me`);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch dashboard');
      }
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
    staleTime: 30_000,
    retry: 1,
  });
}

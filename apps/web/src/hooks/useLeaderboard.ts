import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';
import type { ApiResponse, LeaderboardEntryDto, LeaderboardCategory as CategoryType } from '@jlt/types';

export type LeaderboardCategory = CategoryType;
export type LeaderboardEntry = LeaderboardEntryDto;

export function useLeaderboard(type: LeaderboardCategory = 'total_gp', limit = 20) {
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', type, limit],
    queryFn: async (): Promise<LeaderboardEntryDto[]> => {
      const response = await fetchWithRetry<ApiResponse<LeaderboardEntryDto[]>>(
        `${getApiUrl()}/leaderboard?type=${type}&limit=${limit}`
      );
      return response.data || [];
    },
    enabled: isConnected && !!address && !!token,
    staleTime: 30_000,
    retry: 1,
  });

  return {
    leaderboard: leaderboardQuery.data || [],
    isLoading: leaderboardQuery.isLoading,
    refetch: leaderboardQuery.refetch,
  };
}

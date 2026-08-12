import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  walletAddress: string;
  maskedAddress: string;
  level: number;
  levelTier: string;
  xp: number;
  gp: number;
  jlt: number;
  currentStreak: number;
  avatarUrl: string;
}

export function useLeaderboard(type: 'gp' | 'xp' | 'streak' = 'gp', limit = 20) {
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', type, limit],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: LeaderboardEntry[] }>(
        `${getApiUrl()}/leaderboard?type=${type}&limit=${limit}`
      );
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
  });

  return {
    leaderboard: leaderboardQuery.data || [],
    isLoading: leaderboardQuery.isLoading,
    refetch: leaderboardQuery.refetch,
  };
}

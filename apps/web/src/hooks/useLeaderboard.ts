import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

export type LeaderboardCategory =
  | 'gp'
  | 'jlt'
  | 'level'
  | 'streak'
  | 'pass'
  | 'total_gp'
  | 'total_jlt'
  | 'highest_streak'
  | 'season_rank';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  walletAddress: string;
  maskedAddress: string;
  level: number;
  levelTier: string;
  xp: number;
  totalLifetimeXp: number;
  gp: number;
  totalGp: number;
  jlt: number;
  totalJlt: number;
  currentStreak: number;
  longestStreak: number;
  seasonRpXp: number;
  seasonName: string;
  avatarUrl: string;
}

export function useLeaderboard(type: LeaderboardCategory = 'total_gp', limit = 20) {
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

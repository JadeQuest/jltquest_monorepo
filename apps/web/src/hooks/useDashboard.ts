import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

export interface DashboardData {
  user: {
    id: string;
    walletAddress: string;
    level: number;
    xp: number;
    gp: number;
    jlt: number;
    streak: number;
  };
  leveling: {
    currentXp: number;
    nextLevelXp: number;
    progress: number;
  };
  socialConnections: Record<string, { connected: boolean; handle?: string }>;
}

export function useDashboard() {
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');
  
  return useQuery({
    queryKey: ['dashboard', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: DashboardData; error: string | null }>(`${getApiUrl()}/users/me`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch dashboard');
      }
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
  });
}


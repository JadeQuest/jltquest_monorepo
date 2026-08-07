import { useQuery } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface DashboardData {
  user: {
    id: string;
    walletAddress: string;
    level: number;
    xp: number;
    gp: number;
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
  const token = getCookie('jlt_auth_token');
  
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: DashboardData; error: string | null }>(`${API_URL}/users/me`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch dashboard');
      }
      return response.data;
    },
    enabled: !!token,
  });
}

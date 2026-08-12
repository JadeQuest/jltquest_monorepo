import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

export interface Quest {
  id: string;
  code: string;
  name: string;
  description: string;
  gpReward: number;
  xpReward: number;
  rpXpReward?: number;
  fragmentReward?: number;
  completed: boolean;
  canClaim: boolean;
  completedCount: number;
  frequency: string;
  category: string;
  isHidden: boolean;
}

export function useQuests() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const questsQuery = useQuery({
    queryKey: ['quests', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: Quest[] }>(`${getApiUrl()}/quests`);
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
  });

  const claimMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: string }>(`${getApiUrl()}/quests/${questId}/claim`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error || 'Quest claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    quests: questsQuery.data,
    isLoading: questsQuery.isLoading,
    claim: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
  };
}

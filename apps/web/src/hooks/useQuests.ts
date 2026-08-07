import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Quest {
  id: string;
  name: string;
  description: string;
  gpReward: number;
  xpReward: number;
  completed: boolean;
  completedCount: number;
  frequency: string;
}

export function useQuests() {
  const queryClient = useQueryClient();
  const token = getCookie('jlt_auth_token');

  const questsQuery = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: Quest[] }>(`${API_URL}/quests`);
      return response.data;
    },
    enabled: !!token,
  });

  const claimMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: string }>(`${API_URL}/quests/${questId}/claim`, {
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
    claim: claimMutation.mutate,
    isClaiming: claimMutation.isPending,
  };
}

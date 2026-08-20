import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';
import type { ApiResponse, QuestDto, QuestClaimResultDto } from '@jlt/types';

export type Quest = QuestDto;

export function useQuests() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const questsQuery = useQuery({
    queryKey: ['quests', address],
    queryFn: async (): Promise<QuestDto[]> => {
      const response = await fetchWithRetry<ApiResponse<QuestDto[]>>(`${getApiUrl()}/quests`);
      return response.data || [];
    },
    enabled: isConnected && !!address && !!token,
    staleTime: 30_000,
    retry: 1,
  });

  const claimMutation = useMutation({
    mutationFn: async (questId: string): Promise<QuestClaimResultDto> => {
      const response = await fetchWithRetry<ApiResponse<QuestClaimResultDto>>(`${getApiUrl()}/quests/${questId}/claim`, {
        method: 'POST',
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Quest claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    quests: questsQuery.data || [],
    isLoading: questsQuery.isLoading,
    claim: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
  };
}

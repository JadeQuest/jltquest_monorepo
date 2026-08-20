import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import type {
  ApiResponse,
  SocialOAuthUrlDto,
  SocialCallbackResultDto,
  SocialDisconnectResultDto,
  SocialQuestDto,
  SocialQuestClaimResultDto
} from '@jlt/types';

export type SocialQuest = SocialQuestDto;

export function useSocial() {
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async ({ platform, payload }: { platform: string; payload?: any }): Promise<SocialCallbackResultDto | null> => {
      const response = await fetchWithRetry<ApiResponse<SocialCallbackResultDto>>(`${getApiUrl()}/social/${platform}/callback`, {
        method: 'POST',
        body: JSON.stringify(payload || {}),
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Connection failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: string): Promise<SocialDisconnectResultDto | null> => {
      const response = await fetchWithRetry<ApiResponse<SocialDisconnectResultDto>>(`${getApiUrl()}/social/${platform}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Disconnect failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const getOAuthUrl = async (platform: string): Promise<SocialOAuthUrlDto | null> => {
    const response = await fetchWithRetry<ApiResponse<SocialOAuthUrlDto>>(`${getApiUrl()}/social/${platform}/oauth-url`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get link');
    }
    return response.data;
  };

  const socialQuestsQuery = useQuery({
    queryKey: ['socialQuests'],
    queryFn: async (): Promise<SocialQuestDto[]> => {
      const response = await fetchWithRetry<ApiResponse<SocialQuestDto[]>>(`${getApiUrl()}/social/quests`);
      return response.data || [];
    },
  });

  const claimQuestMutation = useMutation({
    mutationFn: async (questId: string): Promise<SocialQuestClaimResultDto | null> => {
      const response = await fetchWithRetry<ApiResponse<SocialQuestClaimResultDto>>(`${getApiUrl()}/social/quests/${questId}/claim`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['socialQuests'] });
    },
  });

  return {
    connect: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    disconnect: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
    getOAuthUrl,
    socialQuests: socialQuestsQuery.data || [],
    isLoadingSocialQuests: socialQuestsQuery.isLoading,
    claimQuest: claimQuestMutation.mutateAsync,
    isClaimingQuest: claimQuestMutation.isPending,
  };
}

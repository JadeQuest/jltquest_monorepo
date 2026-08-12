import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';

export function useSocial() {
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async ({ platform, payload }: { platform: string; payload?: any }) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error: any }>(`${getApiUrl()}/social/${platform}/callback`, {
        method: 'POST',
        body: JSON.stringify(payload || {}),
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Connection failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error: any }>(`${getApiUrl()}/social/${platform}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Disconnect failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const getOAuthUrl = async (platform: string) => {
    const response = await fetchWithRetry<{ success: boolean; data: { oauthUrl: string; type?: string; url?: string; webUrl?: string }; error: any }>(`${getApiUrl()}/social/${platform}/oauth-url`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get link');
    }
    return response.data;
  };

  const socialQuestsQuery = useQuery({
    queryKey: ['socialQuests'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: any[] }>(`${getApiUrl()}/social/quests`);
      return response.data;
    },
  });

  const claimQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error: any }>(`${getApiUrl()}/social/quests/${questId}/claim`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Claim failed');
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
    socialQuests: socialQuestsQuery.data,
    isLoadingSocialQuests: socialQuestsQuery.isLoading,
    claimQuest: claimQuestMutation.mutateAsync,
    isClaimingQuest: claimQuestMutation.isPending,
  };
}

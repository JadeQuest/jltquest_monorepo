import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function useSocial() {
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async ({ platform, payload }: { platform: string; payload?: any }) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error: any }>(`${API_URL}/social/callback/${platform}`, {
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
      const response = await fetchWithRetry<{ success: boolean; data: any; error: any }>(`${API_URL}/social/disconnect/${platform}`, {
        method: 'POST',
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
    const response = await fetchWithRetry<{ success: boolean; data: { oauthUrl: string; type?: string; url?: string; webUrl?: string }; error: any }>(`${API_URL}/social/oauth/${platform}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get link');
    }
    return response.data;
  };

  return {
    connect: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    disconnect: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
    getOAuthUrl,
  };
}

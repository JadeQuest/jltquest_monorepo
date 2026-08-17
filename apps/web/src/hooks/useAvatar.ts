import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';

export interface AvatarVariant {
  id: string;
  type: string;
  imageUrl: string;
  modelUrl?: string;
  unlocked: boolean;
  active: boolean;
  unlockDescription?: string;
  isPurchasable: boolean;
  costGp: number;
  costJlt: number;
}

export interface Avatar {
  id: string;
  name: string;
  characterKey: string;
  variants: AvatarVariant[];
}

export function useAvatar() {
  const queryClient = useQueryClient();

  const avatarsQuery = useQuery({
    queryKey: ['avatars'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: Avatar[] }>(`${getApiUrl()}/avatars`);
      return response.data;
    },
  });

  const selectAvatarMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/avatars/select`, {
        method: 'POST',
        body: JSON.stringify({ variantId }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Selection failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const unlockAvatarMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/avatars/unlock`, {
        method: 'POST',
        body: JSON.stringify({ variantId }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Unlock failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    avatars: avatarsQuery.data,
    isLoading: avatarsQuery.isLoading,
    selectAvatar: selectAvatarMutation.mutateAsync,
    isSelecting: selectAvatarMutation.isPending,
    unlockAvatar: unlockAvatarMutation.mutateAsync,
    isUnlocking: unlockAvatarMutation.isPending,
  };
}

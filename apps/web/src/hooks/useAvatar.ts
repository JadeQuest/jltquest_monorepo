import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
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
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const avatarsQuery = useQuery({
    queryKey: ['avatars', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: Avatar[] }>(`${getApiUrl()}/avatars`);
      return response.data;
    },
    enabled: !!address,
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
    onMutate: async (variantId: string) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      await queryClient.cancelQueries({ queryKey: ['avatars'] });

      const prevDashboard = queryClient.getQueryData(['dashboard', address]);
      const prevAvatars = queryClient.getQueryData<Avatar[]>(['avatars']);

      // Find the chosen variant from current cache
      let targetVariant: AvatarVariant | undefined;
      let targetAvatarName: string = 'Avatar';
      if (prevAvatars) {
        for (const av of prevAvatars) {
          const match = av.variants.find((v) => v.id === variantId);
          if (match) {
            targetVariant = match;
            targetAvatarName = av.name;
            break;
          }
        }
      }

      // Optimistically update all matching dashboard queries immediately
      if (targetVariant) {
        queryClient.setQueriesData({ queryKey: ['dashboard'] }, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            user: {
              ...old.user,
              activeAvatar: {
                variantId: targetVariant!.id,
                type: targetVariant!.type,
                imageUrl: targetVariant!.imageUrl,
                modelUrl: targetVariant!.modelUrl,
                name: targetAvatarName,
                characterKey: targetVariant!.type || 'avatar',
              },
            },
          };
        });
      }

      // Optimistically update avatars cache
      queryClient.setQueriesData({ queryKey: ['avatars'] }, (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((avatar: Avatar) => ({
          ...avatar,
          variants: avatar.variants.map((v) => ({
            ...v,
            active: v.id === variantId,
          })),
        }));
      });

      return { prevDashboard, prevAvatars };
    },
    onError: (_err, _variantId, context) => {
      if (context?.prevDashboard) {
        queryClient.setQueriesData({ queryKey: ['dashboard'] }, context.prevDashboard);
      }
      if (context?.prevAvatars) {
        queryClient.setQueriesData({ queryKey: ['avatars'] }, context.prevAvatars);
      }
    },
    onSuccess: (data) => {
      if (data?.activeAvatar) {
        queryClient.setQueriesData({ queryKey: ['dashboard'] }, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            user: {
              ...old.user,
              activeAvatar: data.activeAvatar,
            },
          };
        });
      }
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

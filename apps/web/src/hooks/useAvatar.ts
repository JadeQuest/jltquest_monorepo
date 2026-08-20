import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { hasAuthToken } from '@/lib/authCookie';
import type { ApiResponse, AvatarDto, AvatarVariantDto, AvatarSelectResultDto, AvatarUnlockResultDto } from '@jlt/types';

export type AvatarVariant = AvatarVariantDto;
export type Avatar = AvatarDto;

export function useAvatar() {
  const { isConnected, address } = useAccount();
  const queryClient = useQueryClient();

  const avatarsQuery = useQuery({
    queryKey: ['avatars', address],
    queryFn: async (): Promise<AvatarDto[]> => {
      const response = await fetchWithRetry<ApiResponse<AvatarDto[]>>(`${getApiUrl()}/avatars`);
      return response.data || [];
    },
    enabled: isConnected && !!address && hasAuthToken(),
    staleTime: 60_000,
    retry: 1,
  });

  const selectAvatarMutation = useMutation({
    mutationFn: async (variantId: string): Promise<AvatarSelectResultDto | null> => {
      const response = await fetchWithRetry<ApiResponse<AvatarSelectResultDto>>(`${getApiUrl()}/avatars/select`, {
        method: 'POST',
        body: JSON.stringify({ variantId }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Selection failed');
      }
      return response.data;
    },
    onMutate: async (variantId: string) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      await queryClient.cancelQueries({ queryKey: ['avatars'] });

      const prevDashboard = queryClient.getQueryData(['dashboard', address]);
      const prevAvatars = queryClient.getQueryData<AvatarDto[]>(['avatars']);

      // Find the chosen variant from current cache
      let targetVariant: AvatarVariantDto | undefined;
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
        return old.map((avatar: AvatarDto) => ({
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
    mutationFn: async (variantId: string): Promise<AvatarUnlockResultDto | null> => {
      const response = await fetchWithRetry<ApiResponse<AvatarUnlockResultDto>>(`${getApiUrl()}/avatars/unlock`, {
        method: 'POST',
        body: JSON.stringify({ variantId }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Unlock failed');
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

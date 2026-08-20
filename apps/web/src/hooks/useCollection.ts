import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';
import type { ApiResponse, CollectionDto, CardItemDto, MergeFragmentsResultDto } from '@jlt/types';

export type Card = CardItemDto;
export type CollectionData = CollectionDto;

export const useCollection = () => {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ['collection', address],
    queryFn: async (): Promise<CollectionDto | null> => {
      const response = await fetchWithRetry<ApiResponse<CollectionDto>>(`${getApiUrl()}/collection`);
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
    staleTime: 30_000,
    retry: 1,
  });

  const mergeMutation = useMutation({
    mutationFn: async (): Promise<CardItemDto | undefined> => {
      const response = await fetchWithRetry<ApiResponse<MergeFragmentsResultDto>>(`${getApiUrl()}/collection/merge`, {
        method: 'POST',
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to merge fragments');
      }
      return response.data.cardAwarded;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    data: queryData || null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    isMerging: mergeMutation.isPending,
    mergeFragments: mergeMutation.mutateAsync,
    refresh: refetch,
  };
};

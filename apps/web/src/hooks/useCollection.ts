import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  acquiredAt: string;
}

export interface CollectionData {
  fragments: number;
  cards: Card[];
}

export const useCollection = () => {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ['collection', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: CollectionData }>(`${getApiUrl()}/collection`);
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
  });

  const mergeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/collection/merge`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to merge fragments');
      }
      return response.data.cardAwarded;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
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

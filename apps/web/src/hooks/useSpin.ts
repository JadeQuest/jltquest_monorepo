import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getAuthToken, hasAuthToken } from '@/lib/authCookie';
import { getApiUrl, fetchWithRetry } from '@/lib/apiClient';
import type { ApiResponse, SpinStatusDto, SpinResultDto, SpinPurchaseResultDto } from '@jlt/types';

export type SpinStatus = SpinStatusDto;
export type SpinResult = SpinResultDto;

export const useSpin = () => {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();

  const {
    data: spinStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ['spinStatus', address],
    queryFn: async (): Promise<SpinStatusDto> => {
      const token = getAuthToken();
      if (!address || !token) throw new Error('Not connected');
      const response = await fetchWithRetry<ApiResponse<SpinStatusDto>>(`${getApiUrl()}/spin/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch spin status');
      }
      return response.data;
    },
    enabled: isConnected && !!address && hasAuthToken(),
    staleTime: 30_000,
    retry: 1,
  });

  const spinMutation = useMutation({
    mutationFn: async (useFreeSpin: boolean = true): Promise<SpinResultDto> => {
      const token = getAuthToken();
      if (!address || !token) throw new Error('Not connected');
      const response = await fetchWithRetry<ApiResponse<SpinResultDto>>(`${getApiUrl()}/spin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useFreeSpin }),
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Spin failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Optimistically update the spin status
      queryClient.setQueryData(['spinStatus', address], (old: SpinStatusDto | undefined) => {
        if (!old) return old;
        return {
          ...old,
          availableFreeSpins: old.availableFreeSpins - 1 + (data.freeSpinAwarded || 0),
          totalSpins: old.totalSpins + 1,
        };
      });

      // Invalidate dashboard to update GP/XP balance
      queryClient.invalidateQueries({ queryKey: ['dashboard', address] });
    },
  });

  const purchaseSpinMutation = useMutation({
    mutationFn: async (): Promise<SpinPurchaseResultDto | null> => {
      const token = getAuthToken();
      if (!address || !token) throw new Error('Not connected');
      const response = await fetchWithRetry<ApiResponse<SpinPurchaseResultDto>>(`${getApiUrl()}/spin/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Purchase failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spinStatus', address] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', address] });
    },
  });

  return {
    spinStatus,
    isLoadingStatus,
    statusError,
    spin: spinMutation.mutateAsync,
    isSpinning: spinMutation.isPending,
    purchaseSpin: purchaseSpinMutation.mutateAsync,
    isPurchasing: purchaseSpinMutation.isPending,
  };
};

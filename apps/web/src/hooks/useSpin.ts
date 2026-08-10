import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getCookie } from '@/lib/authCookie';
import { getApiUrl, fetchWithRetry } from '@/lib/apiClient';

export interface SpinStatus {
  availableFreeSpins: number;
  lastFreeSpinAt: string | null;
  totalSpins: number;
}

export interface SpinResult {
  outcome: string;
  gpAwarded: number;
  xpAwarded: number;
  fragmentsAwarded: number;
  freeSpinAwarded: number;
}

export const useSpin = () => {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const {
    data: spinStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ['spinStatus', address],
    queryFn: async (): Promise<SpinStatus> => {
      if (!address || !token) throw new Error('Not connected');
      const response = await fetchWithRetry<{ success: boolean; data: SpinStatus }>(`${getApiUrl()}/spin/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
    retry: 1,
  });

  const spinMutation = useMutation({
    mutationFn: async (useFreeSpin: boolean = true): Promise<SpinResult> => {
      if (!address || !token) throw new Error('Not connected');
      const response = await fetchWithRetry<{ success: boolean; data: SpinResult }>(`${getApiUrl()}/spin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useFreeSpin }),
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Optimistically update the spin status
      queryClient.setQueryData(['spinStatus', address], (old: SpinStatus | undefined) => {
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

  return {
    spinStatus,
    isLoadingStatus,
    statusError,
    spin: spinMutation.mutateAsync,
    isSpinning: spinMutation.isPending,
  };
};

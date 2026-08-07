import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

export interface CheckInStatus {
  streak: number;
  canClaim: boolean;
  nextRewardGp: number;
  nextRewardXp: number;
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');

  const statusQuery = useQuery({
    queryKey: ['checkInStatus', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: CheckInStatus }>(`${getApiUrl()}/checkin/status`);
      return response.data;
    },
    enabled: isConnected && !!address && !!token,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: string }>(`${getApiUrl()}/checkin/claim`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error || 'Claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkInStatus'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    claim: claimMutation.mutate,
    isClaiming: claimMutation.isPending,
  };
}

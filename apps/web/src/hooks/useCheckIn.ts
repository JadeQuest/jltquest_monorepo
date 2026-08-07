import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface CheckInStatus {
  streak: number;
  canClaim: boolean;
  nextRewardGp: number;
  nextRewardXp: number;
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  const token = getCookie('jlt_auth_token');

  const statusQuery = useQuery({
    queryKey: ['checkInStatus'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: CheckInStatus }>(`${API_URL}/checkin/status`);
      return response.data;
    },
    enabled: !!token,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: string }>(`${API_URL}/checkin/claim`, {
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

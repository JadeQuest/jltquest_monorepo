import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { hasAuthToken } from '@/lib/authCookie';
import type { ApiResponse, CheckInStatusDto, CheckInClaimResultDto } from '@jlt/types';

export type CheckInStatus = CheckInStatusDto;

export function useCheckIn() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();

  const statusQuery = useQuery({
    queryKey: ['checkInStatus', address],
    queryFn: async (): Promise<CheckInStatusDto | null> => {
      const response = await fetchWithRetry<ApiResponse<CheckInStatusDto>>(`${getApiUrl()}/checkin/status`);
      return response.data;
    },
    enabled: isConnected && !!address && hasAuthToken(),
    staleTime: 30_000,
    retry: 1,
  });

  const claimMutation = useMutation({
    mutationFn: async (): Promise<CheckInClaimResultDto | null> => {
      const response = await fetchWithRetry<ApiResponse<CheckInClaimResultDto>>(`${getApiUrl()}/checkin/claim`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Claim failed');
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
    claimAsync: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
  };
}

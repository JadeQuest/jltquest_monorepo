import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { hasAuthToken } from '@/lib/authCookie';
import type { ApiResponse, InviteStatsDto, RedeemInviteResultDto, ClaimMilestoneResultDto } from '@jlt/types';

export type Invite = any;
export type InviteStats = InviteStatsDto;

export function useInvites() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();

  const invitesQuery = useQuery({
    queryKey: ['invites', address],
    queryFn: async (): Promise<InviteStatsDto | null> => {
      const response = await fetchWithRetry<ApiResponse<InviteStatsDto>>(`${getApiUrl()}/invites`);
      return response.data;
    },
    enabled: isConnected && !!address && hasAuthToken(),
    staleTime: 30_000,
    retry: 1,
  });

  const redeemInviteMutation = useMutation({
    mutationFn: async (code: string): Promise<RedeemInviteResultDto> => {
      const response = await fetchWithRetry<ApiResponse<RedeemInviteResultDto>>(`${getApiUrl()}/invites/redeem`, {
        method: 'POST',
        body: JSON.stringify({ inviteCode: code, code }),
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Redeem failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const claimMilestoneMutation = useMutation({
    mutationFn: async ({ inviteeCount, levelReached }: { inviteeCount: number; levelReached: number }): Promise<ClaimMilestoneResultDto> => {
      const response = await fetchWithRetry<ApiResponse<ClaimMilestoneResultDto>>(`${getApiUrl()}/invites/claim-milestone`, {
        method: 'POST',
        body: JSON.stringify({ inviteeCount, levelReached }),
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    invites: invitesQuery.data,
    stats: invitesQuery.data,
    redemptions: invitesQuery.data?.redemptions || [],
    isLoading: invitesQuery.isLoading,
    redeemInvite: redeemInviteMutation.mutateAsync,
    isRedeeming: redeemInviteMutation.isPending,
    claimMilestone: claimMilestoneMutation.mutateAsync,
    isClaimingMilestone: claimMilestoneMutation.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';

export interface Invite {
  id: string;
  code: string;
  status: string;
  rewardClaimed: boolean;
  createdAt: string;
}

export function useInvites() {
  const queryClient = useQueryClient();

  const invitesQuery = useQuery({
    queryKey: ['invites'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: Invite[] }>(`${getApiUrl()}/invites`);
      return response.data;
    },
  });

  const redeemInviteMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/invites/redeem`, {
        method: 'POST',
        body: JSON.stringify({ inviteCode: code, code }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Redeem failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const claimMilestoneMutation = useMutation({
    mutationFn: async ({ inviteeCount, levelReached }: { inviteeCount: number, levelReached: number }) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/invites/claim-milestone`, {
        method: 'POST',
        body: JSON.stringify({ inviteeCount, levelReached }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Claim failed');
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
    isLoading: invitesQuery.isLoading,
    redeemInvite: redeemInviteMutation.mutateAsync,
    isRedeeming: redeemInviteMutation.isPending,
    claimMilestone: claimMilestoneMutation.mutateAsync,
    isClaimingMilestone: claimMilestoneMutation.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { hasAuthToken } from '@/lib/authCookie';
import type {
  ApiResponse,
  RarePassStatusDto,
  RarePassLevelConfigDto,
  RarePassRewardItemDto,
  RarePassMissionDto,
  RarePassClaimResultDto,
  RarePassMissionClaimResultDto,
  RarePassPurchaseResultDto
} from '@jlt/types';

export type RarePassStatus = RarePassStatusDto;
export type RarePassRewardItem = RarePassRewardItemDto;
export type RarePassLevelConfig = RarePassLevelConfigDto;
export type RarePassMission = RarePassMissionDto;

export function useRarePass() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const isEnabled = isConnected && !!address && hasAuthToken();

  const statusQuery = useQuery({
    queryKey: ['rarepassStatus', address],
    queryFn: async (): Promise<RarePassStatusDto | null> => {
      const response = await fetchWithRetry<ApiResponse<RarePassStatusDto>>(`${getApiUrl()}/rarepass/status`);
      return response.data;
    },
    enabled: isEnabled,
    staleTime: 30_000,
    retry: 1,
  });

  const rewardsQuery = useQuery({
    queryKey: ['rarepassRewards', address],
    queryFn: async (): Promise<RarePassLevelConfigDto[]> => {
      const response = await fetchWithRetry<ApiResponse<RarePassLevelConfigDto[]>>(`${getApiUrl()}/rarepass/rewards`);
      return response.data || [];
    },
    enabled: isEnabled,
    staleTime: 60_000,
    retry: 1,
  });

  const missionsQuery = useQuery({
    queryKey: ['rarepassMissions', address],
    queryFn: async (): Promise<RarePassMissionDto[]> => {
      const response = await fetchWithRetry<ApiResponse<RarePassMissionDto[]>>(`${getApiUrl()}/rarepass/missions`);
      return response.data || [];
    },
    enabled: isEnabled,
    staleTime: 30_000,
    retry: 1,
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string): Promise<RarePassClaimResultDto> => {
      const response = await fetchWithRetry<ApiResponse<RarePassClaimResultDto>>(`${getApiUrl()}/rarepass/claim`, {
        method: 'POST',
        body: JSON.stringify({ rewardId }),
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rarepassRewards'] });
      queryClient.invalidateQueries({ queryKey: ['rarepassStatus'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const claimMissionMutation = useMutation({
    mutationFn: async (missionId: string): Promise<RarePassMissionClaimResultDto> => {
      const response = await fetchWithRetry<ApiResponse<RarePassMissionClaimResultDto>>(`${getApiUrl()}/rarepass/missions/${missionId}/claim`, {
        method: 'POST',
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Mission claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rarepassMissions'] });
      queryClient.invalidateQueries({ queryKey: ['rarepassStatus'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const buyPremiumMutation = useMutation({
    mutationFn: async (): Promise<RarePassPurchaseResultDto> => {
      const response = await fetchWithRetry<ApiResponse<RarePassPurchaseResultDto>>(`${getApiUrl()}/rarepass/buy-premium`, {
        method: 'POST',
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Purchase failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rarepassStatus'] });
      queryClient.invalidateQueries({ queryKey: ['rarepassRewards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    status: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,
    rewards: rewardsQuery.data || [],
    isLoadingRewards: rewardsQuery.isLoading,
    missions: missionsQuery.data || [],
    isLoadingMissions: missionsQuery.isLoading,
    claimReward: claimRewardMutation.mutateAsync,
    isClaimingReward: claimRewardMutation.isPending,
    claimMission: claimMissionMutation.mutateAsync,
    isClaimingMission: claimMissionMutation.isPending,
    buyPremium: buyPremiumMutation.mutateAsync,
    isBuyingPremium: buyPremiumMutation.isPending,
  };
}

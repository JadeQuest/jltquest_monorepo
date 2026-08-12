import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';

export interface RarePassStatus {
  hasPass: boolean;
  type: 'PREMIUM' | 'FREE';
  progress: number;
}

export interface RarePassReward {
  id: string;
  level: number;
  type: string;
  amount: number;
  isPremium: boolean;
  claimed: boolean;
}

export interface RarePassMission {
  id: string;
  description: string;
  progress: number;
  total: number;
  completed: boolean;
  claimed: boolean;
  points: number;
}

export function useRarePass() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['rarepassStatus'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: RarePassStatus }>(`${getApiUrl()}/rarepass/status`);
      return response.data;
    },
  });

  const rewardsQuery = useQuery({
    queryKey: ['rarepassRewards'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: RarePassReward[] }>(`${getApiUrl()}/rarepass/rewards`);
      return response.data;
    },
  });

  const missionsQuery = useQuery({
    queryKey: ['rarepassMissions'],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: RarePassMission[] }>(`${getApiUrl()}/rarepass/missions`);
      return response.data;
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async ({ level, isPremium }: { level: number; isPremium: boolean }) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/rarepass/claim`, {
        method: 'POST',
        body: JSON.stringify({ level, isPremium }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Claim failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rarepassRewards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const claimMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/rarepass/missions/${missionId}/claim`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Mission claim failed');
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
    mutationFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/rarepass/buy-premium`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Purchase failed');
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
    rewards: rewardsQuery.data,
    isLoadingRewards: rewardsQuery.isLoading,
    missions: missionsQuery.data,
    isLoadingMissions: missionsQuery.isLoading,
    claimReward: claimRewardMutation.mutateAsync,
    isClaimingReward: claimRewardMutation.isPending,
    claimMission: claimMissionMutation.mutateAsync,
    isClaimingMission: claimMissionMutation.isPending,
    buyPremium: buyPremiumMutation.mutateAsync,
    isBuyingPremium: buyPremiumMutation.isPending,
  };
}

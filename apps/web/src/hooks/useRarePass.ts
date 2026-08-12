import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { getCookie } from '@/lib/authCookie';

export interface RarePassStatus {
  season: {
    id: string;
    name: string;
    startAt: string;
    endAt: string;
    maxLevel: number;
  };
  progression: {
    totalRpXp: number;
    currentLevel: number;
    xpInCurrentLevel: number;
    xpRequiredForNext: number;
    progress: number;
    isPremium: boolean;
  };
}

export interface RarePassRewardItem {
  id: string;
  track: 'FREE' | 'PREMIUM';
  rewardType: 'GP' | 'XP' | 'FRAGMENT' | 'SPIN' | 'CARD' | 'AVATAR';
  amount: number | null;
  metadata?: any;
  isClaimed: boolean;
  isClaimable: boolean;
}

export interface RarePassLevelConfig {
  level: number;
  requiredRpXp: number;
  rewards: RarePassRewardItem[];
}

export interface RarePassMission {
  id: string;
  code: string;
  name: string;
  description: string;
  rpXpReward: number;
  type: 'DAILY' | 'WEEKLY' | 'SEASONAL';
  targetCount: number;
  progress: number;
  completed: boolean;
  canClaim: boolean;
}

export function useRarePass() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const token = getCookie('jlt_auth_token');
  const isEnabled = isConnected && !!address && !!token;

  const statusQuery = useQuery({
    queryKey: ['rarepassStatus', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: RarePassStatus }>(`${getApiUrl()}/rarepass/status`);
      return response.data;
    },
    enabled: isEnabled,
  });

  const rewardsQuery = useQuery({
    queryKey: ['rarepassRewards', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: RarePassLevelConfig[] }>(`${getApiUrl()}/rarepass/rewards`);
      return response.data;
    },
    enabled: isEnabled,
  });

  const missionsQuery = useQuery({
    queryKey: ['rarepassMissions', address],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: RarePassMission[] }>(`${getApiUrl()}/rarepass/missions`);
      return response.data;
    },
    enabled: isEnabled,
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: any; error?: any }>(`${getApiUrl()}/rarepass/claim`, {
        method: 'POST',
        body: JSON.stringify({ rewardId }),
      });
      if (!response.success) {
        throw new Error(response.error?.message || response.error || 'Claim failed');
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

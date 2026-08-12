import { useQuery } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';

export interface LevelRequirement {
  level: number;
  xpRequired: number;
  rewards: {
    type: string;
    amount: number;
  }[];
}

export function useLevel(level: number) {
  const levelQuery = useQuery({
    queryKey: ['levelRequirement', level],
    queryFn: async () => {
      const response = await fetchWithRetry<{ success: boolean; data: LevelRequirement }>(`${getApiUrl()}/levels/${level}/requirement`);
      return response.data;
    },
    enabled: !!level,
  });

  return {
    requirement: levelQuery.data,
    isLoading: levelQuery.isLoading,
  };
}

import { useQuery } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import type { ApiResponse, LevelRequirementDto } from '@jlt/types';

export type LevelRequirement = LevelRequirementDto;

export function useLevel(level: number) {
  const levelQuery = useQuery({
    queryKey: ['levelRequirement', level],
    queryFn: async (): Promise<LevelRequirementDto | null> => {
      const response = await fetchWithRetry<ApiResponse<LevelRequirementDto>>(`${getApiUrl()}/levels/${level}/requirement`);
      return response.data;
    },
    enabled: !!level,
  });

  return {
    requirement: levelQuery.data,
    isLoading: levelQuery.isLoading,
  };
}

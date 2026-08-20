import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import type { ApiResponse, ConvertGpResultDto } from '@jlt/types';

export function useConvertGp() {
  const queryClient = useQueryClient();

  const convertMutation = useMutation({
    mutationFn: async (gpAmount: number): Promise<ConvertGpResultDto> => {
      const response = await fetchWithRetry<ApiResponse<ConvertGpResultDto>>(`${getApiUrl()}/users/convert-gp`, {
        method: 'POST',
        body: JSON.stringify({ gpAmount }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Conversion failed');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    convertGp: convertMutation.mutateAsync,
    isConverting: convertMutation.isPending,
  };
}

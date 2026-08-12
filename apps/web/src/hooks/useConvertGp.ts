import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';

export function useConvertGp() {
  const queryClient = useQueryClient();

  const convertMutation = useMutation({
    mutationFn: async (gpAmount: number) => {
      const response = await fetchWithRetry<{
        success: boolean;
        data: {
          convertedGp: number;
          jltReceived: number;
          newGpBalance: number;
          newJltBalance: number;
        };
        error?: string;
      }>(`${getApiUrl()}/users/convert-gp`, {
        method: 'POST',
        body: JSON.stringify({ gpAmount }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Conversion failed');
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

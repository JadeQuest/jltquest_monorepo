import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { setCookie, deleteCookie } from '@/lib/authCookie';

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      const response = await fetchWithRetry<{ success: boolean; data: { token: string; userId: string }; error: string | null }>(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ walletAddress }),
      });
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      setCookie('jlt_auth_token', data.token, { days: 1 });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const logout = () => {
    deleteCookie('jlt_auth_token');
    queryClient.clear();
  };

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}

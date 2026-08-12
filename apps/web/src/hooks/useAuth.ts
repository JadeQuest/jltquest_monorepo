import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { setCookie, deleteCookie } from '@/lib/authCookie';

export interface LoginParams {
  walletAddress: string;
  signature: string;
  message: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ walletAddress, signature, message }: LoginParams) => {
      const response = await fetchWithRetry<{ success: boolean; data: { token: string; refreshToken?: string; userId: string }; error: string | null }>(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ walletAddress, signature, message }),
      });
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Save access token and refresh token
      setCookie('jlt_auth_token', data.token, { days: 7 });
      if (data.refreshToken) {
        setCookie('jlt_refresh_token', data.refreshToken, { days: 30 });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetchWithRetry(`${getApiUrl()}/auth/logout`, {
        method: 'POST',
      }).catch(() => {});
    },
    onSuccess: () => {
      deleteCookie('jlt_auth_token');
      deleteCookie('jlt_refresh_token');
      queryClient.clear();
    }
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

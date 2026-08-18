import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { setAuthToken, setRefreshToken, clearUserSession } from '@/lib/authCookie';

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
      setAuthToken(data.token, 7);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken, 30);
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
      clearUserSession();
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

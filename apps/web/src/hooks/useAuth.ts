import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry, getApiUrl } from '@/lib/apiClient';
import { setAuthToken, setRefreshToken, clearUserSession } from '@/lib/authCookie';
import type { ApiResponse, LoginResponseData, LogoutResponseData } from '@jlt/types';

export interface LoginParams {
  walletAddress: string;
  signature: string;
  message: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ walletAddress, signature, message }: LoginParams): Promise<Omit<LoginResponseData, 'refreshToken'>> => {
      const response = await fetchWithRetry<ApiResponse<Omit<LoginResponseData, 'refreshToken'>>>(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ walletAddress, signature, message }),
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data: any) => {
      // Save access token and refresh token
      setAuthToken(data.token, 7);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken, 30);
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await fetchWithRetry<ApiResponse<LogoutResponseData>>(`${getApiUrl()}/auth/logout`, {
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

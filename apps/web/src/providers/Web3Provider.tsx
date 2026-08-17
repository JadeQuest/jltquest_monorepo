'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60_000, // 2 minutes stale time
            gcTime: 10 * 60_000,   // 10 minutes cache time
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            retry: 1,
            structuralSharing: true,
          },
        },
      }),
  );

  // Suppress uncaught browser extension rejections (MetaMask/Phantom inpage.js) from triggering Next.js dev error overlay
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = reason?.message || String(reason || '');
      const stack = typeof reason?.stack === 'string' ? reason.stack : '';

      if (
        msg.includes('Failed to connect to MetaMask') ||
        msg.includes('UserRejectedRequestError') ||
        msg.includes('User rejected') ||
        msg.includes('user denied') ||
        msg.includes('-32002') ||
        msg.includes('4001') ||
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://')
      ) {
        event.preventDefault(); // Prevent Next.js development overlay popup
        console.warn('Handled Web3 wallet extension rejection:', msg);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

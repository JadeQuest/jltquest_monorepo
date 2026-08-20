'use client';

import { useEffect } from 'react';

/**
 * Global listener to intercept unhandled promise rejections originating from
 * browser extension inpage scripts (e.g. MetaMask, Phantom, Coinbase, Rabby).
 * Prevents Next.js development error modal from popping up for user rejections or extension locks.
 */
export function WalletExtensionErrorHandler() {
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
        msg.includes('rejected the request') ||
        msg.includes('-32002') ||
        msg.includes('4001') ||
        msg.includes('Failed to execute inlined telemetry script') ||
        msg.includes('telemetry script') ||
        msg.includes('initCCA') ||
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

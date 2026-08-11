'use client';

import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

import { getCookie } from '@/lib/authCookie';

interface HeaderStatusProps {
  coins?: number;
  tokens?: number;
  onToggleMobileMenu?: () => void;
  onConnectClick?: () => void;
}

const HeaderStatusComponent: React.FC<HeaderStatusProps> = ({
  coins = 0,
  tokens = 0,
  onToggleMobileMenu,
  onConnectClick,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { login, isLoggingIn } = useAuth();
  const { data: dashboardData } = useDashboard();
  
  useEffect(() => {
    if (isConnected && address && !getCookie('jlt_auth_token')) {
      login(address).catch(console.error);
    }
  }, [isConnected, address]);

  const displayCoins = (!isConnected || !address) ? '-' : (dashboardData?.user?.gp ?? coins);
  const displayTokens = (!isConnected || !address) ? '-' : (dashboardData?.user?.jlt ?? tokens);

  const formatAddress = React.useCallback((addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }, []);

  return (
    <header className="sticky top-0 z-30 shrink-0 w-full flex items-center justify-between lg:justify-end gap-4 px-4 sm:px-8 py-4 bg-transparent select-none transition-all duration-200">
      {/* Mobile Left Brand & Hamburger Menu */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleMobileMenu}
          type="button"
          className="p-2.5 rounded-xl glass-pill border border-white/10 text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/jltcolor.svg" alt="JLT Logo" width={36} height={36} className="w-9 h-9 object-contain" />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
        {isConnected && address && (
          <>
            {/* Item 3: Coins Badge */}
            <div className="glass-pill px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 shadow-md">
              <div className="w-6 h-6 sm:w-7 sm:h-7 relative flex items-center justify-center shrink-0">
                <img
                  src="/optimized/coin.webp"
                  alt="Gold Coins Badge"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white font-gilroyBold text-sm sm:text-base font-bold tracking-wide">
                {displayCoins}
              </span>
            </div>

            {/* Item 3.5: Tokens Badge */}
            <div className="glass-pill px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 shadow-md">
              <div className="w-6 h-6 sm:w-7 sm:h-7 relative flex items-center justify-center shrink-0">
                <img
                  src="/jltcolor.svg"
                  alt="JLT Token Badge"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white font-gilroyBold text-sm sm:text-base font-bold tracking-wide">
                {displayTokens}
              </span>
            </div>
          </>
        )}

        {/* Item 4: Custom Centered Connect Wallet Trigger */}
        {(!isConnected && !address) ? (
          <button
            onClick={onConnectClick}
            type="button"
            className="glass-pill px-3 py-1.5 sm:px-5 sm:py-2.5 flex items-center gap-2 sm:gap-3 cursor-pointer hover:border-purple-400/50 hover:bg-white/10 transition-all shadow-lg"
          >
            <img
              src="/Rectangle 11989.svg"
              alt="Wallet Icon"
              width={28}
              height={28}
              className="w-5 h-5 sm:w-7 sm:h-7 rounded-md object-cover"
            />
            <span className="text-white font-gilroyMedium text-xs sm:text-base font-medium tracking-wide">
              Connect Wallet
            </span>
          </button>
        ) : (
          <button
            onClick={onConnectClick}
            type="button"
            className="glass-pill px-3 py-1.5 sm:px-5 sm:py-2.5 flex items-center gap-2 sm:gap-3 cursor-pointer hover:border-purple-400/50 transition-all shadow-lg"
          >
            <img
              src="/Rectangle 11989.svg"
              alt="Wallet Avatar"
              width={28}
              height={28}
              className="w-5 h-5 sm:w-7 sm:h-7 rounded-md object-cover"
            />
            <span className="text-white font-gilroyMedium text-xs sm:text-base font-medium tracking-wide">
              {formatAddress(address || '')}
            </span>
            {chain && (
              <span className="hidden md:inline text-purple-300 font-gilroyRegular text-xs sm:text-sm">
                ({chain.name})
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export const HeaderStatus = React.memo(HeaderStatusComponent);

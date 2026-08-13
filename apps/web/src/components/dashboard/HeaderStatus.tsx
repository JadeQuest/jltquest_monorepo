'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { isUserRejectedError } from '@/lib/web3Error';
import { getCookie } from '@/lib/authCookie';
import { ConvertGPModal } from './ConvertGPModal';
import { RefreshCw, Sparkles } from 'lucide-react';

interface HeaderStatusProps {
  coins?: number;
  tokens?: number;
  onToggleMobileMenu?: () => void;
  onConnectClick?: () => void;
}

const TIER_BADGES: Record<string, string> = {
  Bronze: '🥉 Bronze',
  Silver: '🥈 Silver',
  Gold: '🥇 Gold',
  Platinum: '💎 Platinum',
  Diamond: '👑 Diamond',
  Elite: '🌌 Elite',
};

const HeaderStatusComponent: React.FC<HeaderStatusProps> = ({
  coins = 0,
  tokens = 0,
  onToggleMobileMenu,
  onConnectClick,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { login } = useAuth();
  const { data: dashboardData } = useDashboard();
  
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const isSigningRef = React.useRef(false);

  useEffect(() => {
    const handleLogin = async () => {
      if (isConnected && address && !getCookie('jlt_auth_token') && !isSigningRef.current) {
        isSigningRef.current = true;
        const timestamp = Date.now();
        const message = `Welcome to JadeQuest!\n\nSign this message to secure your session.\nTimestamp: ${timestamp}`;
        try {
          const signature = await signMessageAsync({ message });
          await login({ walletAddress: address, signature, message });
        } catch (err: unknown) {
          if (isUserRejectedError(err)) {
            console.log('User cancelled wallet signature prompt.');
          } else {
            console.error('Wallet signature login failed:', err);
          }
        } finally {
          isSigningRef.current = false;
        }
      }
    };
    handleLogin();
  }, [isConnected, address, signMessageAsync, login]);

  const displayCoins = (!isConnected || !address) ? '-' : (dashboardData?.user?.gp ?? coins);
  const displayTokens = (!isConnected || !address) ? '-' : (dashboardData?.user?.jlt ?? tokens);
  const levelTier = dashboardData?.user?.levelTier || 'Bronze';
  const level = dashboardData?.user?.level || 1;

  const formatAddress = React.useCallback((addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }, []);

  return (
    <>
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

              {/* Coins Badge */}
              <div className="glass-pill px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 shadow-md">
                <div className="w-6 h-6 sm:w-7 sm:h-7 relative flex items-center justify-center shrink-0">
                  <img
                    src="/optimized/coin.avif"
                    alt="Gold Coins Badge"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white font-gilroyBold text-sm sm:text-base font-bold tracking-wide">
                  {displayCoins} GP
                </span>
              </div>



              {/* Tokens Badge */}
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
                <span className="text-white font-gilroyBold text-sm sm:text-base font-bold tracking-wide mr-1">
                  {displayTokens} JLT
                </span>
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(true)}
                  className="p-1 rounded-md text-amber-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Convert GP to JLT"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Custom Centered Connect Wallet Trigger */}
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

      {/* GP to JLT Conversion Modal */}
      {isConvertModalOpen && (
        <ConvertGPModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
        />
      )}
    </>
  );
};

export const HeaderStatus = React.memo(HeaderStatusComponent);

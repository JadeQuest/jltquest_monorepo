'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface HeaderStatusProps {
  level?: number;
  multiplier?: string;
  coins?: number;
  onToggleMobileMenu?: () => void;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  level = 1,
  multiplier = '2X',
  coins = 500,
  onToggleMobileMenu,
}) => {
  return (
    <header className="w-full flex items-center justify-between lg:justify-end gap-4 px-3 sm:px-6 py-2 z-20 select-none">
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
        <img src="/jltcolor.svg" alt="JLT Logo" className="w-9 h-9 object-contain" />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-6">
        {/* Item 1: Level */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 relative flex items-center justify-center shrink-0">
            <img
              src="/Level.svg"
              alt="Lv. 1 Badge"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-gilroyBold text-sm sm:text-lg font-bold tracking-wide">
            Lv. {level}
          </span>
        </div>

        {/* Item 2: Multiplier */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 relative flex items-center justify-center shrink-0">
            <img
              src="/TopLevel.svg"
              alt="2X Multiplier Badge"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-gilroyBold text-sm sm:text-lg font-bold tracking-wide">
            {multiplier}
          </span>
        </div>

        {/* Item 3: Coins */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 relative flex items-center justify-center shrink-0">
            <img
              src="/Coin.svg"
              alt="500 Gold Coins Badge"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-gilroyBold text-sm sm:text-lg font-bold tracking-wide">
            {coins}
          </span>
        </div>

        {/* Item 4: RainbowKit Connect Wallet Button */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="glass-pill px-3 py-1.5 sm:px-5 sm:py-2.5 flex items-center gap-2 sm:gap-3 cursor-pointer hover:border-purple-400/50 hover:bg-white/10 transition-all shadow-lg"
                      >
                        <img
                          src="/Rectangle 11989.svg"
                          alt="Wallet Icon"
                          className="w-5 h-5 sm:w-7 sm:h-7 rounded-md object-cover"
                        />
                        <span className="text-white font-gilroyMedium text-xs sm:text-base font-medium tracking-wide">
                          Connect Wallet
                        </span>
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-all text-red-300 font-gilroyMedium text-xs sm:text-base font-medium tracking-wide"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2 sm:gap-3">
                      {chain.hasIcon && chain.iconUrl && (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="glass-pill p-1.5 sm:p-2.5 flex items-center justify-center cursor-pointer hover:border-purple-400/50 transition-all shadow-lg"
                          title={chain.name}
                        >
                          <img
                            src={chain.iconUrl}
                            alt={chain.name ?? 'Chain icon'}
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                          />
                        </button>
                      )}
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="glass-pill px-3 py-1.5 sm:px-5 sm:py-2.5 flex items-center gap-2 sm:gap-3 cursor-pointer hover:border-purple-400/50 transition-all shadow-lg"
                      >
                        <img
                          src={account.ensAvatar || '/Rectangle 11989.svg'}
                          alt="Wallet Avatar"
                          className="w-5 h-5 sm:w-7 sm:h-7 rounded-md object-cover"
                        />
                        <span className="text-white font-gilroyMedium text-xs sm:text-base font-medium tracking-wide">
                          {account.displayName}
                        </span>
                        {account.displayBalance ? (
                          <span className="hidden md:inline text-white/70 font-gilroyRegular text-xs sm:text-sm">
                            ({account.displayBalance})
                          </span>
                        ) : null}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
};


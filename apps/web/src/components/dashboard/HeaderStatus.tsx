'use client';

import React from 'react';

interface HeaderStatusProps {
  level?: number;
  multiplier?: string;
  coins?: number;
  walletAddress?: string;
  onToggleMobileMenu?: () => void;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  level = 1,
  multiplier = '2X',
  coins = 500,
  walletAddress = '0X9586.eth',
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

        {/* Item 4: Wallet Button */}
        <div className="glass-pill px-3 py-1.5 sm:px-5 sm:py-2.5 flex items-center gap-2 sm:gap-3 cursor-pointer hover:border-purple-400/50 transition-all shadow-lg">
          <img
            src="/Rectangle 11989.svg"
            alt="Wallet Avatar"
            className="w-5 h-5 sm:w-7 sm:h-7 rounded-md object-cover"
          />
          <span className="text-white font-gilroyMedium text-xs sm:text-base font-medium tracking-wide">
            {walletAddress}
          </span>
        </div>
      </div>
    </header>
  );
};

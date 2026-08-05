'use client';

import React from 'react';

interface HeaderStatusProps {
  level?: number;
  multiplier?: string;
  coins?: number;
  walletAddress?: string;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  level = 1,
  multiplier = '2X',
  coins = 500,
  walletAddress = '0X9586.eth',
}) => {
  return (
    <header className="w-full flex items-center justify-end gap-6 px-6 py-2 z-20 select-none">
      <div className="flex items-center gap-7">
        {/* Item 1: Level */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
            <img
              src="/Level.svg"
              alt="Lv. 1 Badge"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-gilroyBold text-lg font-bold tracking-wide">
            Lv. {level}
          </span>
        </div>

        {/* Item 2: Multiplier */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
            <img
              src="/TopLevel.svg"
              alt="2X Multiplier Badge"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-gilroyBold text-lg font-bold tracking-wide">
            {multiplier}
          </span>
        </div>

        {/* Item 3: Coins */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
            <img
              src="/Coin.svg"
              alt="500 Gold Coins Badge"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-gilroyBold text-lg font-bold tracking-wide">
            {coins}
          </span>
        </div>

        {/* Item 4: Wallet Button */}
        <div className="glass-pill px-5 py-2.5 flex items-center gap-3 cursor-pointer hover:border-purple-400/50 transition-all shadow-lg">
          <img
            src="/Rectangle 11989.svg"
            alt="Wallet Avatar"
            className="w-7 h-7 rounded-md object-cover"
          />
          <span className="text-white font-gilroyMedium text-base font-medium tracking-wide">
            {walletAddress}
          </span>
        </div>
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import { useAccount } from 'wagmi';

export const QuestBanner: React.FC = () => {
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <div className="glass-panel w-full py-5 px-8 flex items-center justify-center relative overflow-hidden select-none cursor-pointer group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#340073]/30 via-[#7B2CBF]/40 to-[#FFA28D]/30 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="w-full flex items-center justify-center gap-3 sm:gap-8 z-10">
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-transparent via-[#7B2CBF] to-[#FFA28D] opacity-70 group-hover:opacity-100 transition-opacity" />

        <h3 className="text-white font-gilroyBold text-base sm:text-2xl font-bold tracking-wide text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          Login &amp; Verify to Unlock Quests
        </h3>

        <div className="hidden sm:block flex-1 h-px bg-gradient-to-l from-transparent via-[#7B2CBF] to-[#FFA28D] opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

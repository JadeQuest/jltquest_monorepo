'use client';

import React from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useCheckIn } from '@/hooks/useCheckIn';

const StreakCardComponent: React.FC = () => {
  const { status } = useCheckIn();
  const { isConnected, address } = useAccount();
  const streak = (!isConnected || !address) ? 0 : (status?.streak ?? 0);
  return (
    <div className="daily-card-panel p-6 flex items-center justify-between h-[260px] relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-orange-600/25 rounded-full blur-3xl group-hover:bg-orange-500/35 transition-all duration-500" />

      {/* Left text block */}
      <div className="flex flex-col gap-1 z-10 pl-2">
        <div className="text-white font-gilroyBold text-5xl font-extrabold tracking-tight">
          {streak}
        </div>
        <div className="text-purple-200 font-gilroyBold text-xl font-bold tracking-wide">
          {streak === 1 ? 'Day' : 'Days'}
        </div>
      </div>

      {/* South-East Flame graphic - Slightly larger (w-[215px] h-[260px]) */}
      <div className="absolute -right-5 -bottom-7 w-[215px] h-[260px] flex items-center justify-center animate-flame z-10 pointer-events-none">
        <Image
          src="/optimized/flame.avif"
          alt="Flame Badge"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(234,88,12,0.7)]"
        />

        {/* Sparkle animations over flame */}
        <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        <div className="absolute top-10 right-8 w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
      </div>
    </div>
  );
};

export const StreakCard = React.memo(StreakCardComponent);


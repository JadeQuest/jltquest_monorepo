'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/hooks/useDashboard';

const LevelCardComponent: React.FC = () => {
  const { data: dashboardData } = useDashboard();
  const { isConnected, address } = useAccount();

  const level = (!isConnected || !address) ? '-' : (dashboardData?.user?.level ?? 1);
  const progress = (!isConnected || !address) ? 0 : (dashboardData?.leveling?.progress ?? 0);

  const currentXp = (!isConnected || !address) ? 0 : (dashboardData?.leveling?.currentXp ?? 0);
  const nextLevelXp = (!isConnected || !address) ? 0 : (dashboardData?.leveling?.nextLevelXp ?? 0);

  const getLevelTier = (lvl: number | string) => {
    if (typeof lvl !== 'number') return 'Bronze';
    if (lvl <= 5) return 'Bronze';
    if (lvl <= 10) return 'Silver';
    if (lvl <= 20) return 'Gold';
    if (lvl <= 30) return 'Platinum';
    return 'Diamond';
  };

  const tier = getLevelTier(level);

  return (
    <div className="daily-card-panel p-6 flex flex-col justify-between h-[260px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />

      <div className="flex items-center gap-6">
        <div className="w-32 h-32 relative flex items-center justify-center shrink-0 animate-float">
          <img
            src="/optimized/container-level.webp"
            alt="Level Medal"
            width={128}
            height={128}
            className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          {level !== '-' ? (
            <>
              <div className="text-white font-gilroyBold text-4xl font-extrabold tracking-tight">
                Lv. {level}
              </div>
              <div className="text-[#00F0FF] font-gilroyBold text-base font-semibold tracking-wide uppercase">
                {tier} Tier
              </div>
            </>
          ) : (
            <div className="text-white font-gilroyBold text-2xl font-bold tracking-tight">
              Bronze Tier
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-auto">
        <div className="flex justify-between items-center px-1 text-xs sm:text-sm text-gray-400 font-gilroyMedium tracking-wide">
          <span>0 XP</span>
          <span className="text-white/80">{currentXp} XP</span>
          <span>{nextLevelXp} XP</span>
        </div>
        <div className="w-full h-3.5 bg-black/40 rounded-full p-0.5 relative overflow-visible border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full shadow-[0_0_10px_#FFA28D]"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-transform hover:scale-110"
            style={{ left: `${progress}%` }}
          >
            <img
              src="/optimized/slide-coin.webp"
              alt="Slide Coin Indicator"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const LevelCard = React.memo(LevelCardComponent);

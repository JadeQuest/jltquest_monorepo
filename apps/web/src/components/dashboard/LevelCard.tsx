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

  const getLevelInfo = (lvl: number | string) => {
    if (typeof lvl !== 'number') return { tier: 'Starter', badge: '/badge/starter-badge.avif' };
    if (lvl <= 5) return { tier: 'Starter', badge: '/badge/starter-badge.avif' };
    if (lvl <= 10) return { tier: 'Bronze', badge: '/badge/bronze-badge.avif' };
    if (lvl <= 15) return { tier: 'Silver', badge: '/badge/silver-badge.avif' };
    if (lvl <= 20) return { tier: 'Gold', badge: '/badge/gold-badge.avif' };
    if (lvl <= 25) return { tier: 'Platinum', badge: '/badge/platinum-badge.avif' };
    return { tier: 'Diamond', badge: '/badge/diamond-badge.avif' };
  };

  const { tier, badge } = getLevelInfo(level);

  return (
    <div className="daily-card-panel p-6 flex flex-col justify-between h-[260px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />

      <div className="flex items-center gap-6">
        <div className="w-32 h-32 relative flex items-center justify-center shrink-0 animate-float">
          <img
            src={badge}
            alt={`${tier} Medal`}
            width={128}
            height={128}
            className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          {level !== '-' ? (
            <>
              <span className="text-[#9D4EDD] text-xs font-semibold tracking-wider uppercase font-gilroySemiBold">Current Tier</span>
              <h2 className="text-white text-2xl font-bold tracking-tight font-gilroyBold leading-none">{tier} Tier</h2>
              <span className="text-gray-400 text-sm font-medium font-gilroyMedium">Level {level}</span>
            </>
          ) : (
            <>
              <span className="text-gray-500 text-xs font-semibold tracking-wider uppercase font-gilroySemiBold">Status</span>
              <h2 className="text-gray-400 text-2xl font-bold tracking-tight font-gilroyBold leading-none">Not Connected</h2>
              <span className="text-gray-500 text-sm font-medium font-gilroyMedium">Connect wallet to view level</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-gray-400 font-gilroyMedium">Progress to next level</span>
          <span className="text-white font-semibold font-gilroySemiBold">
            {level !== '-' ? `${currentXp} / ${nextLevelXp} XP` : '-'}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full relative">
          <div
            className="h-full bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full shadow-[0_0_10px_#FFA28D]"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-transform hover:scale-110"
            style={{ left: `${progress}%` }}
          >
            <img
              src="/icon/slide-coin.avif"
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

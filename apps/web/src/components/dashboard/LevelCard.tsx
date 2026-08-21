'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/hooks/useDashboard';
import { LevelDetailsModal } from './LevelDetailsModal';

const LevelCardComponent: React.FC = () => {
  const { data: dashboardData } = useDashboard();
  const { isConnected, address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const level = (!isConnected || !address) ? '-' : (dashboardData?.user?.level ?? 1);

  const getLevelInfo = (lvl: number | string) => {
    if (typeof lvl !== 'number') return { tier: 'Starter', badge: '/badge/starter-badge.webp' };
    if (lvl <= 5) return { tier: 'Starter', badge: '/badge/starter-badge.webp' };
    if (lvl <= 10) return { tier: 'Bronze', badge: '/badge/bronze-badge.webp' };
    if (lvl <= 15) return { tier: 'Silver', badge: '/badge/silver-badge.webp' };
    if (lvl <= 20) return { tier: 'Gold', badge: '/badge/gold-badge.webp' };
    if (lvl <= 25) return { tier: 'Platinum', badge: '/badge/platinum-badge.webp' };
    return { tier: 'Diamond', badge: '/badge/diamond-badge.webp' };
  };

  const { tier, badge } = getLevelInfo(level);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="daily-card-panel p-4 sm:p-6 flex flex-col justify-center items-center h-[180px] sm:h-[260px] relative overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-colors"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />

        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <div className="w-16 h-16 sm:w-32 sm:h-32 relative flex items-center justify-center shrink-0 animate-float">
            <img
              src={badge}
              alt={`${tier} Medal`}
              width={128}
              height={128}
              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-110"
            />
          </div>

          <div className="flex flex-col justify-center items-center text-center">
            {level !== '-' ? (
              <>
                <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight font-gilroyBold leading-none">{tier} Tier</h2>
                <span className="text-gray-400 text-sm sm:text-sm font-medium font-gilroyMedium mt-1">Level {level}</span>
              </>
            ) : (
              <>
                <h2 className="text-gray-400 text-xl sm:text-2xl font-bold tracking-tight font-gilroyBold leading-none">Not Connected</h2>
                <span className="text-gray-500 text-sm sm:text-sm font-medium font-gilroyMedium mt-1">Connect wallet</span>
              </>
            )}
          </div>
        </div>
      </div>

      <LevelDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tier={tier}
        badge={badge}
      />
    </>
  );
};

export const LevelCard = React.memo(LevelCardComponent);


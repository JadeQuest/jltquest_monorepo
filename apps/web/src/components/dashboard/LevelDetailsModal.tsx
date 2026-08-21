'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/hooks/useDashboard';

import { createPortal } from 'react-dom';

interface LevelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  badge: string;
}

export const LevelDetailsModal: React.FC<LevelDetailsModalProps> = ({
  isOpen,
  onClose,
  tier,
  badge,
}) => {
  const { data: dashboardData } = useDashboard();
  const { isConnected, address } = useAccount();

  if (!isOpen || typeof window === 'undefined') return null;

  const level = (!isConnected || !address) ? '-' : (dashboardData?.user?.level ?? 1);
  const progress = (!isConnected || !address) ? 0 : (dashboardData?.leveling?.progress ?? 0);
  const currentXp = (!isConnected || !address) ? 0 : (dashboardData?.leveling?.currentXp ?? 0);
  const nextLevelXp = (!isConnected || !address) ? 0 : (dashboardData?.leveling?.nextLevelXp ?? 0);

  return createPortal(
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col relative shadow-[0_0_50px_rgba(123,44,191,0.35)] border border-white/10 rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="w-32 h-32 relative flex items-center justify-center shrink-0 animate-float">
            <img
              src={badge}
              alt={`${tier} Medal`}
              width={128}
              height={128}
              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            />
          </div>

            <div className="flex flex-col items-center justify-center text-center">
              {level !== '-' ? (
                <>
                  <span className="text-[#9D4EDD] text-sm font-semibold tracking-wider uppercase font-gilroySemiBold">Current Tier</span>
                  <h2 className="text-white text-3xl font-bold tracking-tight font-gilroyBold leading-none mt-1">{tier} Tier</h2>
                  <span className="text-gray-400 text-base font-medium font-gilroyMedium mt-2">Level {level}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-500 text-sm font-semibold tracking-wider uppercase font-gilroySemiBold">Status</span>
                  <h2 className="text-gray-400 text-3xl font-bold tracking-tight font-gilroyBold leading-none mt-1">Not Connected</h2>
                  <span className="text-gray-500 text-base font-medium font-gilroyMedium mt-2">Connect wallet to view level</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-8">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-400 font-gilroyMedium">Progress to next level</span>
              <span className="text-white font-semibold font-gilroySemiBold">
                {level !== '-' ? `${currentXp} / ${nextLevelXp} XP` : '-'}
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full relative mt-1">
              <div
                className="h-full bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full shadow-[0_0_10px_#FFA28D]"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-transform hover:scale-110"
                style={{ left: `${progress}%` }}
              >
                <img
                  src="/icon/slide-coin.webp"
                  alt="Slide Coin Indicator"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
};

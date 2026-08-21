import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useLeaderboard, LeaderboardEntry, LeaderboardCategory } from '@/hooks/useLeaderboard';
import { Trophy, Star, Flame, Zap, Award, Copy } from 'lucide-react';
import { JLTLoader } from '@/components/common/JLTLoader';
import { gsap, prefersReducedMotion, MotionEases } from '@/lib/animations';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const getLevelInfo = (lvl: number) => {
  if (lvl <= 5) return { tier: 'Starter', badge: '/badge/starter-badge.webp', color: 'text-gray-400 border-gray-400/30 bg-gray-900/30' };
  if (lvl <= 10) return { tier: 'Bronze', badge: '/badge/bronze-badge.webp', color: 'text-amber-600 border-amber-600/30 bg-amber-950/20' };
  if (lvl <= 15) return { tier: 'Silver', badge: '/badge/silver-badge.webp', color: 'text-gray-300 border-gray-300/30 bg-gray-900/30' };
  if (lvl <= 20) return { tier: 'Gold', badge: '/badge/gold-badge.webp', color: 'text-yellow-400 border-yellow-400/40 bg-yellow-950/30' };
  if (lvl <= 25) return { tier: 'Platinum', badge: '/badge/platinum-badge.webp', color: 'text-cyan-300 border-cyan-400/40 bg-cyan-950/30' };
  return { tier: 'Diamond', badge: '/badge/diamond-badge.webp', color: 'text-purple-300 border-purple-400/40 bg-purple-950/30' };
};

const LEADERBOARD_TABS: { id: LeaderboardCategory; label: string }[] = [
  { id: 'gp', label: 'GP' },
  { id: 'jlt', label: 'JLT' },
  { id: 'level', label: 'Level' },
  { id: 'streak', label: 'Streak' },
  { id: 'pass', label: 'Pass' },
];

export const LeaderboardCardComponent: React.FC = () => {
  const [activeType, setActiveType] = useState<LeaderboardCategory>('gp');
  const { leaderboard, isLoading } = useLeaderboard(activeType, 20);
  const listRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !listRef.current || isLoading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.lb-row-anim',
        { opacity: 0, x: -12, scale: 0.98 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.03,
          ease: MotionEases.powerOut,
          force3D: true,
          overwrite: 'auto',
          clearProps: 'transform,opacity',
        }
      );
    }, listRef);

    return () => ctx.revert();
  }, [activeType, leaderboard, isLoading]);

  return (
    <div className="daily-card-panel p-4 sm:p-6 flex flex-col min-h-[calc(100vh-140px)] relative overflow-hidden select-none shadow-2xl border border-white/10">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-white font-gilroyBold text-xl font-bold tracking-tight">Global Leaderboard</h3>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex w-full sm:w-fit bg-black/40 border border-white/10 rounded-xl p-1 gap-0.5 sm:gap-1">
          {LEADERBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveType(tab.id)}
              className={`flex-1 sm:flex-none px-1 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-gilroyBold transition-all cursor-pointer text-center whitespace-nowrap ${activeType === tab.id
                  ? 'bg-purple-500/30 text-white border border-purple-400/40 shadow-[0_0_12px_#7B2CBF]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div ref={listRef} className="mt-4 flex-grow flex flex-col gap-2.5">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <JLTLoader variant="inline" size="md" text="Loading leaderboard..." />
          </div>
        ) : leaderboard.length > 0 ? (
          leaderboard.map((user: LeaderboardEntry) => {
            const { tier: tierName, color: tierColor, badge: tierBadge } = getLevelInfo(user.level);

            return (
              <div
                key={user.id}
                className="lb-row-anim will-change-transform flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 hover:border-purple-500/30 transition-all hover:bg-white/5 gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Rank Badge */}
                  <span
                    className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-gilroyBold text-xs font-bold ${user.rank === 1
                        ? 'bg-amber-400 text-black shadow-[0_0_10px_#F59E0B]'
                        : user.rank === 2
                          ? 'bg-gray-300 text-black shadow-[0_0_10px_#E5E7EB]'
                          : user.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-white/10 text-gray-400'
                      }`}
                  >
                    #{user.rank}
                  </span>

                  {/* Avatar */}
                  <img
                    src={user.avatarUrl}
                    onError={(e) => {
                      e.currentTarget.src = '/avatar.webp';
                    }}
                    alt="User Avatar"
                    className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                  />

                  {/* User Address & Level Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0">
                    <div 
                      className="flex items-center gap-1.5 text-white hover:text-purple-300 transition-colors cursor-pointer group min-w-0"
                      onClick={() => user.walletAddress && navigator.clipboard.writeText(user.walletAddress)}
                      title="Copy Wallet Address"
                    >
                      <span className="font-gilroyBold text-xs sm:text-sm tracking-wide font-mono truncate">
                        {user.walletAddress || user.maskedAddress}
                      </span>
                      <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-purple-300 font-gilroyMedium text-[10px] sm:text-xs sm:border-l border-white/10 sm:pl-3 shrink-0">
                        Lvl {user.level}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-gilroyBold px-1.5 py-0.5 rounded border flex items-center gap-1 shrink-0 ${tierColor}`}>
                        <img src={tierBadge} alt={tierName} className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain drop-shadow-sm" />
                        {tierName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Column */}
                <div className="flex items-center gap-2 shrink-0">
                  {(activeType === 'gp' || activeType === 'total_gp') && (
                    <span className="text-amber-400 font-gilroyBold text-xs sm:text-sm flex items-center gap-1.5">
                      <img src="/icon/coin.webp" alt="GP" className="w-4 h-4 object-contain shrink-0" />
                      {user.totalGp.toLocaleString()} GP
                    </span>
                  )}
                  {(activeType === 'jlt' || activeType === 'total_jlt') && (
                    <span className="text-[#00F0FF] font-gilroyBold text-xs sm:text-sm flex items-center gap-1.5">
                      <img src="/jltcolor.svg" alt="JLT" className="w-4 h-4 object-contain shrink-0" />
                      {user.totalJlt.toLocaleString()} JLT
                    </span>
                  )}
                  {activeType === 'level' && (
                    <span className="text-cyan-300 font-gilroyBold text-xs sm:text-sm flex items-center gap-1.5">
                      <img src="/Level.svg" alt="Level" className="w-4 h-4 object-contain shrink-0" />
                      {user.totalLifetimeXp.toLocaleString()} XP
                    </span>
                  )}
                  {(activeType === 'streak' || activeType === 'highest_streak') && (
                    <span className="text-orange-400 font-gilroyBold text-xs sm:text-sm flex items-center gap-1.5">
                      <img src="/Flame.svg" alt="Streak" className="w-4 h-4 object-contain shrink-0" />
                      {user.longestStreak} Days
                    </span>
                  )}
                  {(activeType === 'pass' || activeType === 'season_rank') && (
                    <span className="text-purple-300 font-gilroyBold text-xs sm:text-sm flex items-center gap-1.5">
                      <img src="/Push Pass.svg" alt="Pass" className="w-4 h-4 object-contain shrink-0" />
                      {user.seasonRpXp.toLocaleString()} RP XP
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-gray-500 font-gilroyMedium">
            No rankings recorded yet for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export const LeaderboardCard = React.memo(LeaderboardCardComponent);

import React, { useState } from 'react';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { Trophy, Medal, Star, Flame, Zap, ShieldAlert } from 'lucide-react';
import { JLTLoader } from '@/components/common/JLTLoader';

const getLevelInfo = (lvl: number) => {
  if (lvl <= 5) return { tier: 'Starter', badge: '/optimized/container-level.avif', color: 'text-gray-400 border-gray-400/30 bg-gray-900/30' };
  if (lvl <= 10) return { tier: 'Bronze', badge: '/optimized/bronze-badge.avif', color: 'text-amber-600 border-amber-600/30 bg-amber-950/20' };
  if (lvl <= 15) return { tier: 'Silver', badge: '/optimized/silver-badge.avif', color: 'text-gray-300 border-gray-300/30 bg-gray-900/30' };
  if (lvl <= 20) return { tier: 'Gold', badge: '/optimized/gold-badge.avif', color: 'text-yellow-400 border-yellow-400/40 bg-yellow-950/30' };
  if (lvl <= 25) return { tier: 'Platinum', badge: '/optimized/platinum-badge.avif', color: 'text-cyan-300 border-cyan-400/40 bg-cyan-950/30' };
  return { tier: 'Diamond', badge: '/optimized/diamond-badge.avif', color: 'text-purple-300 border-purple-400/40 bg-purple-950/30' };
};

export const LeaderboardCardComponent: React.FC = () => {
  const [activeType, setActiveType] = useState<'gp' | 'xp' | 'streak'>('gp');
  const { leaderboard, isLoading } = useLeaderboard(activeType, 10);

  return (
    <div className="daily-card-panel p-6 flex flex-col justify-between min-h-[420px] relative overflow-hidden select-none shadow-2xl border border-white/10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-gilroyBold text-xl font-bold tracking-tight">Global Leaderboard</h3>
            <p className="text-purple-300 font-gilroyMedium text-xs">Top JLTQuest adventurers & level tiers</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 w-fit">
          {[
            { id: 'gp', label: 'GP Earned', icon: <Medal className="w-3.5 h-3.5" /> },
            { id: 'xp', label: 'Level XP', icon: <Star className="w-3.5 h-3.5" /> },
            { id: 'streak', label: 'Streak 🔥', icon: <Flame className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-gilroyBold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeType === tab.id
                  ? 'bg-purple-500/30 text-white border border-purple-400/40 shadow-[0_0_10px_#7B2CBF]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="mt-4 flex-grow flex flex-col gap-2.5">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <JLTLoader variant="inline" size="md" text="Loading leaderboard..." />
          </div>
        ) : leaderboard.length > 0 ? (
          leaderboard.map((user: LeaderboardEntry) => {
            const { tier: tierName, color: tierColor, badge: tierBadge } = getLevelInfo(user.level);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 hover:border-purple-500/30 transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-gilroyBold text-xs font-bold ${
                      user.rank === 1
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
                    alt="User Avatar"
                    className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                  />

                  {/* User Address & Level */}
                  <div className="flex items-center gap-3">
                    <span className="text-white font-gilroyBold text-sm tracking-wide">
                      {user.maskedAddress}
                    </span>
                    <span className="text-purple-300 font-gilroyMedium text-xs border-l border-white/10 pl-3">
                      Level {user.level}
                    </span>
                    <span className={`text-[10px] font-gilroyBold px-1.5 py-0.5 rounded border flex items-center gap-1 ${tierColor}`}>
                      <img src={tierBadge} alt={tierName} className="w-3.5 h-3.5 object-contain drop-shadow-sm" />
                      {tierName}
                    </span>
                  </div>
                </div>

                {/* Score Column */}
                <div className="flex items-center gap-3">
                  {activeType === 'gp' && (
                    <span className="text-amber-400 font-gilroyBold text-sm flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {user.gp} GP
                    </span>
                  )}
                  {activeType === 'xp' && (
                    <span className="text-[#00F0FF] font-gilroyBold text-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#00F0FF]" />
                      {user.xp} XP
                    </span>
                  )}
                  {activeType === 'streak' && (
                    <span className="text-orange-400 font-gilroyBold text-sm flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      {user.currentStreak} Days
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-gray-500 font-gilroyMedium">
            No rankings available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export const LeaderboardCard = React.memo(LeaderboardCardComponent);

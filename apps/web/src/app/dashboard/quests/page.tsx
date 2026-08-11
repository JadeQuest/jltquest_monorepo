"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';
import { useQuests, Quest } from '@/hooks/useQuests';
import { QuestCard } from '@/components/quests/QuestCard';
import { JLTLoader } from '@/components/common/JLTLoader';
import {
  Target,
  Zap,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowRight,
  Star,
  Gift,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['DAILY', 'WEEKLY', 'EARNING', 'SOCIAL', 'REFERRAL', 'MILESTONE', 'ACHIEVEMENT'] as const;

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  DAILY:       { label: 'Daily',       icon: <Clock className="w-4 h-4" />,        desc: 'Refresh every day' },
  WEEKLY:      { label: 'Weekly',      icon: <Zap className="w-4 h-4" />,          desc: 'Refresh every week' },
  EARNING:     { label: 'Earning',     icon: <Gift className="w-4 h-4" />,          desc: 'Earn GP & XP' },
  SOCIAL:      { label: 'Social',      icon: <Star className="w-4 h-4" />,          desc: 'Connect your socials' },
  REFERRAL:    { label: 'Referral',    icon: <ArrowRight className="w-4 h-4" />,   desc: 'Invite friends' },
  MILESTONE:   { label: 'Milestone',   icon: <Target className="w-4 h-4" />,        desc: 'Long-term goals' },
  ACHIEVEMENT: { label: 'Achievement', icon: <CheckCircle2 className="w-4 h-4" />, desc: 'Special achievements' },
};

/* ─── Skeleton quest card for disconnected / loading state ─── */
function QuestCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="daily-card-panel p-5 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl" />
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-5 w-2/3 bg-white/10 rounded-lg" />
          <div className="h-5 w-16 bg-purple-500/10 rounded-md ml-2" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/6 rounded" />
          <div className="h-3 w-4/5 bg-white/6 rounded" />
        </div>
        <div className="flex gap-4 mt-2">
          <div className="h-4 w-16 bg-yellow-500/10 rounded" />
          <div className="h-4 w-14 bg-purple-500/10 rounded" />
        </div>
      </div>
      <div className="mt-5">
        <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function QuestsPage() {
  const { isConnected } = useAccount();
  const { quests, isLoading, claim, isClaiming } = useQuests();

  const [claimingId, setClaimingId]   = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<string>('DAILY');
  const [showPopup, setShowPopup]     = useState(false);
  const [rewardData, setRewardData]   = useState<{ gpAwarded: number; xpAwarded: number } | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleClaim = async (id: string) => {
    try {
      setClaimingId(id);
      const res = await claim(id);
      setRewardData({ gpAwarded: res.gpAwarded, xpAwarded: res.xpAwarded });
      setShowPopup(true);
    } catch (err: any) {
      alert(err.message || 'Failed to claim quest');
    } finally {
      setClaimingId(null);
    }
  };

  /* ── Derive quest stats (only when data is available) ── */
  const visibleQuests   = quests?.filter(q => !q.isHidden || q.completed) ?? [];
  const completedCount  = visibleQuests.filter(q => q.completed).length;
  const claimableCount  = visibleQuests.filter(q => q.canClaim && !q.completed).length;
  const totalGpAvail    = visibleQuests.filter(q => !q.completed).reduce((s, q) => s + q.gpReward, 0);

  const groupedQuests = visibleQuests.reduce((acc, quest) => {
    const cat = quest.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(quest);
    return acc;
  }, {} as Record<string, Quest[]>);

  /* isLoading is handled inline via skeleton cards — no full-page loader */

  return (
    <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto">

      {/* ════════════════════════════════════════════════════════
          HERO BANNER — matches collection page style
          ════════════════════════════════════════════════════════ */}
      <div className="daily-card-panel p-6 sm:p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-radial from-[#7B2CBF]/20 via-transparent to-transparent pointer-events-none" />

        {/* Left — title + description */}
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-purple-400/20 w-fit">
            <Target className="w-4 h-4 text-[#00F0FF] animate-sparkle" />
            <span className="text-[#00F0FF] font-gilroyMedium text-xs font-semibold uppercase tracking-wider">
              Quest Board
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-gilroyBold text-white tracking-tight drop-shadow-md">
            Quests
          </h1>
          <p className="text-purple-200 font-gilroyRegular text-sm sm:text-base leading-relaxed opacity-90">
            Complete daily check-ins, social tasks, referrals, and milestone challenges to earn GP, XP, and rare creature fragments.
          </p>
        </div>

        {/* Right — quick stats or connect prompt */}
        <div className="w-full lg:w-auto z-10 shrink-0">
          {isConnected && quests ? (
            <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col gap-4 min-w-full lg:min-w-[320px] shadow-xl border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">
                  Quest Progress
                </span>
                <span className="text-2xl font-gilroyBold text-white tracking-wide">
                  {completedCount}
                  <span className="text-purple-400 text-lg font-gilroyRegular"> / {visibleQuests.length}</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FFA28D] via-[#7B2CBF] to-[#00F0FF] transition-all duration-500 shadow-[0_0_12px_#00F0FF]"
                  style={{ width: `${visibleQuests.length > 0 ? Math.round((completedCount / visibleQuests.length) * 100) : 0}%` }}
                />
              </div>

              {claimableCount > 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Zap className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span className="text-purple-200 font-gilroyMedium text-sm">
                    <span className="text-white font-gilroyBold">{claimableCount}</span> quest{claimableCount !== 1 ? 's' : ''} ready to claim!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/30 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-purple-300 font-gilroyMedium text-sm">
                    {totalGpAvail > 0 ? `${totalGpAvail} GP available` : 'All caught up!'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Not connected — prompt */
            <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col gap-4 min-w-full lg:min-w-[300px] shadow-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-gilroyBold text-sm">Wallet Required</p>
                  <p className="text-purple-300 font-gilroyMedium text-xs">Connect to track progress</p>
                </div>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
                <div className="h-full w-0 rounded-full bg-gradient-to-r from-[#FFA28D] via-[#7B2CBF] to-[#00F0FF]" />
              </div>
              <p className="text-purple-400/60 font-gilroyMedium text-xs text-center">— / — quests</p>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          STATS ROW (only when connected & loaded)
          ════════════════════════════════════════════════════════ */}
      {isConnected && quests && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 flex items-center gap-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-gilroyBold text-white mt-0.5">{completedCount}</p>
            </div>
          </div>

          <div className="glass-panel p-5 flex items-center gap-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">Ready to Claim</p>
              <p className="text-2xl font-gilroyBold text-white mt-0.5">{claimableCount}</p>
            </div>
          </div>

          <div className="glass-panel p-5 flex items-center gap-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-[#FCD34D]" />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">GP Available</p>
              <p className="text-2xl font-gilroyBold text-white mt-0.5">{totalGpAvail}</p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          CATEGORY TABS + QUEST GRID
          ════════════════════════════════════════════════════════ */}
      <div className="w-full">
        {/* Tabs */}
        <div className="overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1.5 w-max gap-1 backdrop-blur-md">
            {CATEGORIES.map(cat => {
              const meta  = CATEGORY_META[cat];
              const count = groupedQuests[cat]?.length ?? 0;
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded-lg font-gilroyMedium text-sm font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'glass-btn text-white shadow-[0_0_15px_#7B2CBF]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {meta.label}
                  {isConnected && quests && count > 0 && (
                    <span className={`text-[10px] font-gilroyBold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/8 text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── NOT CONNECTED: plain ghost skeleton grid (no overlay) ── */}
        {!isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 select-none pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <QuestCardSkeleton key={i} delay={i * 60} />
            ))}
          </div>
        )}

        {/* ── CONNECTED: full-page loader while fetching (no text) ── */}
        {isConnected && isLoading && (
          <JLTLoader variant="page" />
        )}

        {/* ── CONNECTED, DATA LOADED ── */}
        {isConnected && !isLoading && quests && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedQuests[activeTab]?.length > 0 ? (
                groupedQuests[activeTab].map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onClaim={handleClaim}
                    isClaiming={claimingId === quest.id}
                  />
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-gray-500 font-gilroyMedium daily-card-panel border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-10 h-10 text-purple-400/30" />
                  <p>No quests available in this category yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          REWARD CLAIMED POPUP
          ════════════════════════════════════════════════════════ */}
      {showPopup && rewardData && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center relative animate-fade-in shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl">
              <div className="absolute inset-0 bg-radial from-[#7B2CBF]/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

              <div className="w-16 h-16 rounded-full glass-panel border border-purple-400/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(123,44,191,0.4)]">
                <CheckCircle2 className="w-8 h-8 text-[#00F0FF]" />
              </div>

              <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">Quest Claimed!</h3>
              <p className="text-purple-200 font-gilroyMedium text-base mb-6">
                You completed a quest and earned rewards!
              </p>

              <div className="flex gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-[#FCD34D] drop-shadow-[0_0_15px_#F59E0B]">
                    +{rewardData.gpAwarded}
                  </span>
                  <span className="text-sm text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">GP</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-[#A78BFA] drop-shadow-[0_0_15px_#7C3AED]">
                    +{rewardData.xpAwarded}
                  </span>
                  <span className="text-sm text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">XP</span>
                </div>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#7B2CBF] hover:shadow-[0_0_25px_#7B2CBF] transition-shadow w-full"
              >
                Awesome
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

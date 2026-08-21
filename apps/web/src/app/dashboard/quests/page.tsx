'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';
import { useQuests, Quest } from '@/hooks/useQuests';
import { useRarePass, RarePassMission } from '@/hooks/useRarePass';
import { QuestCard } from '@/components/quests/QuestCard';
import { JLTLoader } from '@/components/common/JLTLoader';
import { showError } from '@/components/common/AlertModal';
import { gsap, prefersReducedMotion, MotionEases } from '@/lib/animations';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import {
  Target,
  Zap,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowRight,
  Star,
  Gift,
  Sparkles,
  ShieldAlert,
  Flame,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'DAILY',
  'WEEKLY',
  'EARNING',
  'SOCIAL',
  'MILESTONE',
  'ACHIEVEMENT',
] as const;

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  DAILY: { label: 'Daily', icon: <Clock className="w-4 h-4" />, desc: 'Refresh every day' },
  WEEKLY: { label: 'Weekly', icon: <Zap className="w-4 h-4" />, desc: 'Refresh every week' },
  EARNING: { label: 'Earning', icon: <Gift className="w-4 h-4" />, desc: 'Earn GP & XP' },
  SOCIAL: { label: 'Social', icon: <Star className="w-4 h-4" />, desc: 'Connect your socials' },
  MILESTONE: { label: 'Milestone', icon: <Target className="w-4 h-4" />, desc: 'Long-term goals' },
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
  const { quests, isLoading: isLoadingQuests, claim, isClaiming } = useQuests();
  const {
    status: passStatus,
    missions,
    isLoadingMissions,
    claimMission,
    isClaimingMission,
    buyPremium,
    isBuyingPremium,
  } = useRarePass();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('DAILY');
  const [showPopup, setShowPopup] = useState(false);
  const [rewardData, setRewardData] = useState<{
    gpAwarded?: number;
    xpAwarded?: number;
    rpXpAwarded?: number;
    fragmentsAwarded?: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !cardsGridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.quest-card-anim',
        { opacity: 0, y: 16, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: MotionEases.backOut,
          force3D: true,
          overwrite: 'auto',
          clearProps: 'transform,opacity',
        }
      );
    }, cardsGridRef);

    return () => ctx.revert();
  }, [activeTab, quests]);

  const handleClaimQuest = async (id: string) => {
    try {
      setClaimingId(id);
      const res = await claim(id);
      setRewardData({
        gpAwarded: res?.gpAwarded || 0,
        xpAwarded: res?.xpAwarded || 0,
        rpXpAwarded: res?.rpXpAwarded || 0,
        fragmentsAwarded: res?.fragmentsAwarded || 0,
      });
      setShowPopup(true);
    } catch (err: any) {
      showError(err.message || 'Failed to claim quest', 'Claim Failed');
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimMission = async (missionId: string) => {
    try {
      setClaimingId(missionId);
      const res = await claimMission(missionId);
      setRewardData({
        rpXpAwarded: res?.rpXpAwarded || 0,
      });
      setShowPopup(true);
    } catch (err: any) {
      showError(err.message || 'Failed to claim Rare Pass mission', 'Mission Failed');
    } finally {
      setClaimingId(null);
    }
  };

  /* ── Derive quest calculations ── */
  const visibleQuests = quests ?? [];
  const completedCount = visibleQuests.filter((q) => q.completed).length;
  const claimableCount = visibleQuests.filter((q) => q.canClaim && !q.completed).length;

  const totalGpAvail = visibleQuests
    .filter((q) => !q.completed)
    .reduce((sum, q) => sum + (q.gpReward || 0), 0);
  const totalXpAvail = visibleQuests
    .filter((q) => !q.completed)
    .reduce((sum, q) => sum + (q.xpReward || 0), 0);
  const totalRpXpAvail = visibleQuests
    .filter((q) => !q.completed)
    .reduce((sum, q) => sum + (q.rpXpReward || 0), 0);

  const groupedQuests = visibleQuests.reduce((acc, quest: Quest) => {
    const cat = quest.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(quest);
    return acc;
  }, {} as Record<string, Quest[]>);

  const claimablePerCategory = visibleQuests.reduce((acc, quest) => {
    if (quest.canClaim && !quest.completed) {
      acc[quest.category] = (acc[quest.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (missions) {
    const claimableMissions = missions.filter((m) => m.canClaim && !m.completed).length;
    if (claimableMissions > 0) {
      claimablePerCategory['RARE_PASS'] = claimableMissions;
    }
  }

  const firstClaimableCat = Object.keys(claimablePerCategory)[0];

  const handleSelectClaimableTab = () => {
    if (firstClaimableCat) {
      setActiveTab(firstClaimableCat);
    }
  };

  /* Rare Pass Status Calculations */
  const seasonName = passStatus?.season?.name || 'Season 01: Cosmic Origins';
  const passLevel = passStatus?.progression?.currentLevel ?? 1;
  const xpInCurrentLevel = passStatus?.progression?.xpInCurrentLevel ?? 0;
  const xpRequiredForNext = passStatus?.progression?.xpRequiredForNext ?? 100;
  const passProgressPercent = passStatus?.progression?.progress ?? 0;
  const isPremiumPass = passStatus?.progression?.isPremium ?? false;

  return (
    <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto">

      {/* ════════════════════════════════════════════════════════
          RARE PASS SEASON BANNER & HERO BAR
          ════════════════════════════════════════════════════════ */}
      <div className="daily-card-panel p-5 sm:p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-radial from-[#7B2CBF]/25 via-transparent to-transparent pointer-events-none" />

        {/* Left — title + description */}
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-purple-400/20 w-fit">
              <Target className="w-4 h-4 text-[#00F0FF] animate-sparkle" />
              <span className="text-[#00F0FF] font-gilroyMedium text-xs font-semibold uppercase tracking-wider">
                Quest Board
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-gilroyBold text-white tracking-tight drop-shadow-md">
            Quests
          </h1>
          <p className="text-purple-200 font-gilroyRegular text-sm sm:text-base leading-relaxed opacity-90">
            Complete daily check-ins, social tasks, and referrals to earn GP, XP, RP XP, and creature fragments according to JLTQuest tokenomics.
          </p>
        </div>

        {/* Right — quick stats or connect prompt */}
        <div className="w-full lg:w-auto z-10 shrink-0">
          {isConnected && quests ? (
            <div className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col gap-3 sm:gap-4 min-w-full lg:min-w-[340px] shadow-xl border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-[11px] sm:text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">
                  Ready to Claim
                </span>
                <span className="text-2xl font-gilroyBold text-white tracking-wide">
                  {claimableCount}
                </span>
              </div>
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
                  <p className="text-purple-300 font-gilroyMedium text-xs">Connect wallet to track progress</p>
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
          CATEGORY TABS + QUEST / MISSION GRID
          ════════════════════════════════════════════════════════ */}
      <div className="w-full">
        {/* Tabs */}
        <div className="overflow-x-auto pb-2 mb-4 sm:mb-5 hide-scrollbar w-full">
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 sm:p-1.5 w-max gap-1 backdrop-blur-md">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = groupedQuests[cat]?.length ?? 0;
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-gilroyMedium text-[11px] sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${isActive
                    ? 'glass-btn text-white shadow-[0_0_15px_#7B2CBF]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {meta.icon}
                  {meta.label}
                  {isConnected && claimablePerCategory[cat] > 0 ? (
                    <span className="text-[10px] font-gilroyBold px-2 py-0.5 rounded-full bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF] animate-pulse">
                      {claimablePerCategory[cat]} READY
                    </span>
                  ) : isConnected && count > 0 ? (
                    <span className={`text-[10px] font-gilroyBold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/8 text-gray-400'}`}>
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── NOT CONNECTED: plain ghost skeleton grid (no overlay) ── */}
        {!isConnected && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 select-none pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <QuestCardSkeleton key={i} delay={i * 60} />
            ))}
          </div>
        )}

        {/* ── CONNECTED: full-page loader while fetching ── */}
        {isConnected && (isLoadingQuests || (activeTab === 'RARE_PASS' && isLoadingMissions)) && (
          <JLTLoader variant="page" />
        )}

        {/* ── STANDARD QUESTS GRID ── */}
        {isConnected && !isLoadingQuests && !isLoadingMissions && (
          <div className="space-y-6">
            {groupedQuests[activeTab]?.length > 0 && (
              <div ref={cardsGridRef} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {groupedQuests[activeTab].map((quest) => (
                  <div key={quest.id} className="quest-card-anim will-change-transform h-full">
                    <QuestCard
                      quest={quest}
                      onClaim={handleClaimQuest}
                      isClaiming={claimingId === quest.id}
                    />
                  </div>
                ))}
              </div>
            )}

            {!(groupedQuests[activeTab]?.length > 0) && (
              <div className="py-16 text-center text-gray-500 font-gilroyMedium daily-card-panel border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-purple-400/30" />
                <p>No quests available in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          REWARD CLAIMED POPUP
          ════════════════════════════════════════════════════════ */}
      {showPopup && rewardData && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center relative animate-fade-in shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl">
              <div className="absolute inset-0 bg-radial from-[#7B2CBF]/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

              <div className="w-16 h-16 rounded-full glass-panel border border-purple-400/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(123,44,191,0.4)]">
                <CheckCircle2 className="w-8 h-8 text-[#00F0FF]" />
              </div>

              <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">Reward Claimed!</h3>
              <p className="text-purple-200 font-gilroyMedium text-base mb-6">
                Your reward has been granted and credited to your account!
              </p>

              <div className="flex flex-wrap justify-center items-center gap-6 mb-8 w-full">
                {!!rewardData.gpAwarded && rewardData.gpAwarded > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-[#FCD34D] drop-shadow-[0_0_15px_#F59E0B]">
                      +{rewardData.gpAwarded}
                    </span>
                    <span className="text-xs text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">GP</span>
                  </div>
                )}
                {!!rewardData.xpAwarded && rewardData.xpAwarded > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-[#A78BFA] drop-shadow-[0_0_15px_#7C3AED]">
                      +{rewardData.xpAwarded}
                    </span>
                    <span className="text-xs text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">XP</span>
                  </div>
                )}
                {!!rewardData.rpXpAwarded && rewardData.rpXpAwarded > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-[#00F0FF] drop-shadow-[0_0_15px_#00F0FF]">
                      +{rewardData.rpXpAwarded}
                    </span>
                    <span className="text-xs text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">RP XP</span>
                  </div>
                )}
                {!!rewardData.fragmentsAwarded && rewardData.fragmentsAwarded > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_15px_#10B981]">
                      +{rewardData.fragmentsAwarded}
                    </span>
                    <span className="text-xs text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">Fragment</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#7B2CBF] hover:shadow-[0_0_25px_#7B2CBF] transition-shadow w-full cursor-pointer"
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

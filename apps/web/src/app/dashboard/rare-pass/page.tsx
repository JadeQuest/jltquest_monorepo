"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';
import { useRarePass, RarePassLevelConfig, RarePassRewardItem, RarePassMission } from '@/hooks/useRarePass';
import { JLTLoader } from '@/components/common/JLTLoader';
import { showError } from '@/components/common/AlertModal';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Gift,
  Star,
  Crown,
  Layers,
  ArrowRight,
  ShieldAlert,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

const getRewardImage = (type: string, level?: number, track?: 'FREE' | 'PREMIUM') => {
  if (level === 10) {
    if (track === 'PREMIUM') return '/avatar/pass/s1/s1p.webp';
    return '/avatar/pass/s1/s1b.webp';
  }
  if (level === 50) {
    if (track === 'PREMIUM') return '/card/pass/s1/premium.webp';
    return '/card/pass/s1/basic.webp';
  }
  const t = type.toLowerCase();
  if (t === 'gp') return '/icon/coin.webp';
  if (t === 'xp') return '/icon/xp.webp';
  if (t === 'spin') return '/icon/spinIcon.webp';
  if (t === 'fragment') return '/icon/Fragment.webp';
  if (t === 'avatar') return '/avatar/avatar.webp';
  if (t === 'card') {
    if (track === 'PREMIUM') return '/card/pass/s1/premium.webp';
    return '/card/pass/s1/basic.webp';
  }
  return null;
};

const getRewardTitle = (reward: { rewardType: string; amount?: number | null; track?: 'FREE' | 'PREMIUM' }, level?: number) => {
  if (level === 10) {
    if (reward.track === 'PREMIUM') return 'Season 01 Pass';
    return 'Season 01 Pass';
  }
  if (level === 50) {
    if (reward.track === 'PREMIUM') return 'Throne of Creation';
    return 'Cosmic Guardian';
  }
  if (reward.rewardType === 'SPIN') {
    const count = reward.amount || 1;
    return count > 1 ? `+${count} Spins` : '+1 Spin';
  }
  if (reward.rewardType === 'GP') {
    return `${reward.amount ?? 0} GP`;
  }
  if (reward.rewardType === 'XP') {
    return `${reward.amount ?? 0} XP`;
  }
  if (reward.rewardType === 'FRAGMENT') {
    const count = reward.amount || 1;
    return `${count} Fragment${count > 1 ? 's' : ''}`;
  }
  return `${reward.rewardType} ${reward.amount ? `(${reward.amount})` : ''}`;
};

export default function RarePassPage() {
  const { isConnected } = useAccount();
  const {
    status,
    rewards,
    missions,
    isLoadingStatus,
    isLoadingRewards,
    isLoadingMissions,
    claimReward,
    isClaimingReward,
    claimMission,
    isClaimingMission,
    buyPremium,
    isBuyingPremium,
  } = useRarePass();

  interface ClaimModalDetails {
    title: string;
    subtitle?: string;
    track?: 'FREE' | 'PREMIUM';
    level?: number;
    rewardType?: string;
    amount?: number | null;
    name?: string;
    image?: string | null;
    message?: string;
  }

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [claimModalData, setClaimModalData] = useState<ClaimModalDetails | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'missions'>('rewards');
  const [timeLeft, setTimeLeft] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Timer for season end */
  useEffect(() => {
    if (!status?.season?.endAt) return;

    const calculateTimeLeft = () => {
      const end = new Date(status.season.endAt).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) return 'Season Ended';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days}d ${hours}h left`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(interval);
  }, [status?.season?.endAt]);

  /* Auto-scroll to current unlocked level on load */
  useEffect(() => {
    const level = status?.progression?.currentLevel ?? 1;
    if (rewards && level > 1 && scrollRef.current) {
      const columnStep = 176; // 164px width + 12px gap
      const targetScroll = Math.max(0, (level - 2) * columnStep);
      scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [rewards, status?.progression?.currentLevel]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -352 : 352;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleClaimReward = async (reward: RarePassRewardItem, level: number) => {
    try {
      setClaimingId(reward.id);
      const res = await claimReward(reward.id);

      let displayName = getRewardTitle(reward, level);
      let rewardImage = getRewardImage(reward.rewardType, level, reward.track);

      if (level === 50) {
        if (reward.track === 'PREMIUM') {
          displayName = 'Throne of Creation (Mythical Rank)';
          rewardImage = '/card/pass/s1/premium.webp';
        } else {
          displayName = 'Cosmic Guardian (Epic Rank)';
          rewardImage = '/card/pass/s1/basic.webp';
        }
      } else if (level === 10) {
        if (reward.track === 'PREMIUM') {
          displayName = 'Season 01 Premium Pass';
          rewardImage = '/avatar/pass/s1/s1p.webp';
        } else {
          displayName = 'Season 01 Pass';
          rewardImage = '/avatar/pass/s1/s1b.webp';
        }
      } else if (reward.rewardType === 'SPIN') {
        const count = reward.amount || 1;
        displayName = count > 1 ? `+${count} Spins` : '+1 Spin';
      } else if (reward.rewardType === 'GP') {
        displayName = `+${reward.amount || 0} Gold Points (GP)`;
      } else if (reward.rewardType === 'XP') {
        displayName = `+${reward.amount || 0} XP`;
      } else if (reward.rewardType === 'FRAGMENT') {
        const count = reward.amount || 1;
        displayName = count > 1 ? `+${count} Fragments` : '+1 Fragment';
      } else if (reward.rewardType === 'CARD') {
        displayName = res?.grantDetails?.card?.name || 'Exclusive Rare Card';
        if (res?.grantDetails?.card?.imageUrl) {
          rewardImage = res.grantDetails.card.imageUrl;
        }
      } else if (reward.rewardType === 'AVATAR') {
        displayName = res?.grantDetails?.avatar?.name || 'Exclusive 3D Avatar';
      }

      setClaimModalData({
        title: 'Reward Claimed!',
        subtitle: `Level ${level} • ${reward.track === 'PREMIUM' ? '★ Premium Track' : 'Free Track'}`,
        track: reward.track,
        level,
        rewardType: reward.rewardType,
        amount: reward.amount,
        name: displayName,
        image: rewardImage,
        message: `You successfully unlocked ${displayName}! It has been credited to your balance.`,
      });
      setShowPopup(true);
    } catch (err: any) {
      showError(err.message || 'Failed to claim pass reward', 'Claim Failed');
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimMission = async (mission: RarePassMission) => {
    try {
      setClaimingId(mission.id);
      const res = await claimMission(mission.id);
      const rpXpAwarded = res?.rpXpAwarded || mission.rpXpReward || 20;

      setClaimModalData({
        title: 'Mission Completed!',
        subtitle: mission.name,
        rewardType: 'RP XP',
        amount: rpXpAwarded,
        name: `+${rpXpAwarded} Rare Pass XP`,
        image: '/icon/xp.webp',
        message: `Great job! You earned +${rpXpAwarded} RP XP towards Season 01 progression.`,
      });
      setShowPopup(true);
    } catch (err: any) {
      showError(err.message || 'Failed to claim mission', 'Mission Failed');
    } finally {
      setClaimingId(null);
    }
  };

  const handleBuyPremium = async () => {
    try {
      await buyPremium();
      setClaimModalData({
        title: 'Premium Pass Activated!',
        subtitle: 'Season 01: Cosmic Origins',
        track: 'PREMIUM',
        name: 'Premium Track Unlocked',
        image: null,
        message: 'All exclusive premium rewards, avatars, cards, and bonus spins are now unlocked!',
      });
      setShowPopup(true);
    } catch (err: any) {
      showError(err.message || 'Failed to upgrade to Premium Pass', 'Upgrade Failed');
    }
  };

  /* Calculations */
  const seasonName = status?.season?.name || 'Season 01: Cosmic Origins';
  const maxLevel = status?.season?.maxLevel ?? 50;
  const currentLevel = status?.progression?.currentLevel ?? 1;
  const totalRpXp = status?.progression?.totalRpXp ?? 0;
  const xpInCurrentLevel = status?.progression?.xpInCurrentLevel ?? 0;
  const xpRequiredForNext = status?.progression?.xpRequiredForNext ?? 100;
  const progressPercent = status?.progression?.progress ?? 0;
  const isPremium = status?.progression?.isPremium ?? false;

  const isLoading = isLoadingStatus || isLoadingRewards || isLoadingMissions;

  const formatSeasonDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const startDateFormatted = formatSeasonDate(status?.season?.startAt);
  const endDateFormatted = formatSeasonDate(status?.season?.endAt);

  return (
    <div className="flex flex-col gap-8 max-w-[1550px] w-full mx-auto">
      {/* ════════════════════════════════════════════════════════
          RARE PASS HERO / SEASON STATUS BANNER
          ════════════════════════════════════════════════════════ */}
      <div className="daily-card-panel p-6 sm:p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-radial from-[#7B2CBF]/30 via-transparent to-transparent pointer-events-none" />

        {/* Left Section */}
        <div className="flex flex-col gap-2 z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-gilroyBold text-white tracking-tight drop-shadow-md">
            {seasonName}
          </h1>

          <p className="text-purple-200 font-gilroyMedium text-sm sm:text-base leading-relaxed opacity-90">
            {startDateFormatted && endDateFormatted
              ? `Season 01 start from ${startDateFormatted} to ${endDateFormatted}`
              : 'Season 01 start from Aug 1, 2026 to Sep 30, 2026'}
          </p>
        </div>

        {/* Right Section — Pass Level & RP XP Progress */}
        <div className="w-full lg:w-auto z-10 shrink-0">
          {isConnected && status ? (
            <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col gap-4 min-w-full lg:min-w-[340px] shadow-xl border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">
                  Pass Progress
                </span>
                <span className="text-2xl font-gilroyBold text-white tracking-wide">
                  Level {currentLevel}
                  <span className="text-purple-400 text-lg font-gilroyRegular"> / {maxLevel}</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#FFA28D] transition-all duration-500 shadow-[0_0_12px_#00F0FF]"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-gilroyMedium text-purple-200">
                <span>Current Level RP XP:</span>
                <span className="text-[#00F0FF] font-gilroyBold">
                  {xpInCurrentLevel} / {xpRequiredForNext} RP XP
                </span>
              </div>

              {!isPremium && (
                <button
                  onClick={handleBuyPremium}
                  disabled={isBuyingPremium}
                  className="w-full mt-1 py-3 px-4 rounded-xl text-sm font-gilroyBold bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span>{isBuyingPremium ? 'Upgrading...' : 'Unlock Premium Track (50 JLT)'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col gap-4 min-w-full lg:min-w-[300px] shadow-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-gilroyBold text-sm">Wallet Required</p>
                  <p className="text-purple-300 font-gilroyMedium text-xs">Connect wallet to view pass status</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loader */}
      {!isConnected && (
        <div className="daily-card-panel p-12 text-center text-gray-400 font-gilroyMedium rounded-2xl">
          Please connect your wallet to access Rare Pass rewards and missions.
        </div>
      )}

      {isConnected && isLoading && <JLTLoader variant="page" />}

      {/* ════════════════════════════════════════════════════════
          SEASONAL REWARDS TRACK (50 LEVELS)
          ════════════════════════════════════════════════════════ */}
      {isConnected && !isLoading && (rewards || missions) && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-gilroyBold text-white tracking-wide flex items-center gap-2">
                <span>{activeTab === 'rewards' ? 'Season Rewards' : 'Rare Pass Missions'}</span>
              </h2>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-sm text-gray-300 font-gilroyMedium">
                Total Season RP XP: <span className="text-white font-gilroyBold ml-1">{totalRpXp}</span>
              </div>

              {/* Tab Toggles */}
              <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-gilroyBold transition-all ${activeTab === 'rewards'
                    ? 'bg-purple-500/20 text-white border border-purple-500/30 shadow-[0_0_10px_rgba(123,44,191,0.3)]'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Rewards
                </button>
                <button
                  onClick={() => setActiveTab('missions')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-gilroyBold transition-all ${activeTab === 'missions'
                    ? 'bg-cyan-500/20 text-white border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Missions
                </button>
              </div>


            </div>
          </div>

          {activeTab === 'rewards' && rewards && (
            <div className="daily-card-panel p-4 sm:p-6 relative overflow-hidden flex flex-col gap-4 shadow-2xl group/track">

              {/* 3-Tier Container: Left Track Labels + Right Horizontal Scrollable Grid */}
              <div className="flex items-stretch gap-4">
                {/* Pinned Left Track Headers */}
                <div className="hidden sm:flex flex-col justify-between w-[150px] shrink-0 select-none py-1">
                  {/* Top: Premium Header */}
                  <div className={`h-[145px] p-3 rounded-2xl flex flex-col justify-between items-center text-center transition-all relative overflow-hidden ${isPremium
                    ? 'glass-panel bg-amber-500/15 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'glass-panel opacity-90'
                    }`}>
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <Crown className="w-5 h-5 text-amber-300 animate-bounce" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-amber-300 font-gilroyBold text-sm uppercase tracking-wider drop-shadow-sm">
                        Premium Pass
                      </span>
                    </div>

                    {isPremium ? (
                      <span className="text-[11px] font-gilroyBold text-emerald-300 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-400/40">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={handleBuyPremium}
                        disabled={isBuyingPremium}
                        className="w-full py-1.5 text-xs font-gilroyBold glass-btn text-white rounded-xl hover:shadow-[0_0_15px_#FFA28D] transition-all cursor-pointer"
                      >
                        {isBuyingPremium ? 'Upgrading...' : 'Unlock'}
                      </button>
                    )}
                  </div>

                  {/* Center: Milestone Track Label */}
                  <div className="h-[52px] flex items-center justify-center text-center px-1 my-1">
                    <div className="w-full py-1.5 px-2 rounded-xl glass-pill flex items-center justify-center">
                      <span className="text-[11px] font-gilroyBold uppercase tracking-wider text-cyan-300">
                        Level Track
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Free Header */}
                  <div className="h-[145px] p-3 rounded-2xl flex flex-col justify-between items-center text-center glass-panel shadow-[0_0_20px_rgba(0,240,255,0.15)] relative overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                      <Sparkles className="w-5 h-5 text-cyan-300 animate-sparkle" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-cyan-300 font-gilroyBold text-sm uppercase tracking-wider drop-shadow-sm">
                        Free Pass
                      </span>
                    </div>

                    <span className="text-[11px] font-gilroyBold text-cyan-200 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/40">
                      Active
                    </span>
                  </div>
                </div>

                {/* Right Horizontal Scrollable Pass Tiers */}
                <div
                  ref={scrollRef}
                  className="overflow-x-auto pb-1 pt-1 px-1 scroll-smooth flex-grow [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="flex gap-3 w-max min-w-full">
                    {rewards.map((levelConfig: RarePassLevelConfig) => {
                      const isLevelUnlocked = currentLevel >= levelConfig.level;
                      const isCurrentLevel = currentLevel === levelConfig.level;
                      const freeReward = levelConfig.rewards.find((r) => r.track === 'FREE');
                      const premiumReward = levelConfig.rewards.find((r) => r.track === 'PREMIUM');

                      return (
                        <div
                          key={levelConfig.level}
                          className="w-[164px] shrink-0 flex flex-col justify-between items-center select-none"
                        >
                          {/* ══ TOP ROW: PREMIUM REWARD CARD ══ */}
                          <div
                            className={`h-[145px] w-full p-2.5 rounded-2xl flex flex-col justify-between items-center text-center relative transition-all duration-300 ${isPremium && isLevelUnlocked
                              ? 'glass-panel bg-amber-500/10 border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : 'glass-panel opacity-70'
                              }`}
                          >
                            <div className="flex flex-col items-center gap-1 my-auto pt-1">
                              {premiumReward ? (
                                <>
                                  {getRewardImage(premiumReward.rewardType, levelConfig.level, 'PREMIUM') ? (
                                    <img
                                      src={getRewardImage(premiumReward.rewardType, levelConfig.level, 'PREMIUM')!}
                                      alt={premiumReward.rewardType}
                                      className="w-10 h-10 object-contain drop-shadow-md"
                                    />
                                  ) : (
                                    <Star className="w-8 h-8 text-amber-300" />
                                  )}
                                  <p className="text-xs font-gilroyBold text-amber-100 truncate max-w-[140px]" title={getRewardTitle(premiumReward, levelConfig.level)}>
                                    {getRewardTitle(premiumReward, levelConfig.level)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs font-gilroyBold text-amber-100/60">Bonus</p>
                              )}
                            </div>

                            {/* Premium Action / Status Slot */}
                            <div className="w-full h-7 flex items-center justify-center">
                              {premiumReward?.isClaimed ? (
                                <div className="w-full h-full rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-gilroyBold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Claimed
                                </div>
                              ) : !isPremium ? (
                                <div className="w-full h-full rounded-lg bg-amber-500/5 border border-amber-400/10 text-amber-300/60 text-[10px] font-gilroyMedium flex items-center justify-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Premium
                                </div>
                              ) : isPremium && premiumReward && !premiumReward.isClaimed && premiumReward.isClaimable ? (
                                <button
                                  onClick={() => handleClaimReward(premiumReward, levelConfig.level)}
                                  disabled={claimingId === premiumReward.id}
                                  className="w-full h-full rounded-lg text-xs font-gilroyBold glass-btn text-white hover:shadow-[0_0_15px_#FFA28D] hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
                                >
                                  {claimingId === premiumReward.id ? (
                                    <JLTLoader variant="inline" size="sm" text="Claiming..." />
                                  ) : (
                                    'Claim'
                                  )}
                                </button>
                              ) : !isLevelUnlocked ? (
                                <div className="w-full h-full rounded-lg bg-black/40 border border-white/5 text-gray-400 text-[10px] font-gilroyMedium flex items-center justify-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Locked
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-lg bg-black/20 border border-white/5 text-gray-400 text-[10px] font-gilroyMedium flex items-center justify-center">
                                  Locked
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ══ CENTER ROW: PROGRESS LINE & MILESTONE NODE ══ */}
                          <div className="h-[52px] w-full flex items-center justify-center relative my-1">
                            {/* Horizontal Progress Track Line */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-black/80 border-y border-white/10 z-0" />
                            {isLevelUnlocked && (
                              <div
                                className={`absolute top-1/2 -translate-y-1/2 left-0 h-1.5 z-0 ${isCurrentLevel
                                  ? 'right-1/2 bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#FFA28D] shadow-[0_0_8px_#00F0FF]'
                                  : 'right-0 bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#FFA28D]'
                                  }`}
                              />
                            )}

                            {/* Milestone Circle Node - Displaying Level Only */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-gilroyBold text-xs z-10 relative transition-all duration-300 ${isCurrentLevel
                                ? 'bg-gradient-to-br from-[#00F0FF] to-[#7B2CBF] text-white ring-4 ring-cyan-400/40 shadow-[0_0_18px_#00F0FF] scale-110'
                                : isLevelUnlocked
                                  ? 'bg-[#360C9F] text-cyan-200 border-2 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                  : 'bg-black/90 text-gray-400 border-2 border-white/15'
                                }`}
                            >
                              {levelConfig.level}
                            </div>
                          </div>

                          {/* ══ BOTTOM ROW: FREE REWARD CARD ══ */}
                          <div
                            className={`h-[145px] w-full p-2.5 rounded-2xl flex flex-col justify-between items-center text-center relative transition-all duration-300 ${isLevelUnlocked
                              ? 'glass-panel shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                              : 'glass-panel opacity-70'
                              }`}
                          >
                            <div className="flex flex-col items-center gap-1 my-auto pt-1">
                              {freeReward ? (
                                <>
                                  {getRewardImage(freeReward.rewardType, levelConfig.level, 'FREE') ? (
                                    <img
                                      src={getRewardImage(freeReward.rewardType, levelConfig.level, 'FREE')!}
                                      alt={freeReward.rewardType}
                                      className="w-10 h-10 object-contain drop-shadow-md"
                                    />
                                  ) : (
                                    <Gift className="w-8 h-8 text-cyan-300" />
                                  )}
                                  <p className="text-xs font-gilroyBold text-white truncate max-w-[140px]" title={getRewardTitle(freeReward, levelConfig.level)}>
                                    {getRewardTitle(freeReward, levelConfig.level)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs font-gilroyBold text-gray-400">No Reward</p>
                              )}
                            </div>

                            {/* Free Action / Status Slot */}
                            <div className="w-full h-7 flex items-center justify-center">
                              {freeReward?.isClaimed ? (
                                <div className="w-full h-full rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-gilroyBold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Claimed
                                </div>
                              ) : freeReward && !freeReward.isClaimed && freeReward.isClaimable ? (
                                <button
                                  onClick={() => handleClaimReward(freeReward, levelConfig.level)}
                                  disabled={claimingId === freeReward.id}
                                  className="w-full h-full rounded-lg text-xs font-gilroyBold glass-btn text-white hover:shadow-[0_0_12px_#00F0FF] hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
                                >
                                  {claimingId === freeReward.id ? (
                                    <JLTLoader variant="inline" size="sm" text="Claiming..." />
                                  ) : (
                                    'Claim'
                                  )}
                                </button>
                              ) : !isLevelUnlocked ? (
                                <div className="w-full h-full rounded-lg bg-black/40 border border-white/5 text-gray-400 text-[10px] font-gilroyMedium flex items-center justify-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Locked
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-lg bg-black/20 border border-white/5 text-gray-400 text-[10px] font-gilroyMedium flex items-center justify-center">
                                  Locked
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'missions' && missions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missions.map((mission: RarePassMission) => (
                <div key={mission.id} className="daily-card-panel p-5 flex flex-col justify-between min-h-[200px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/20 transition-all duration-500" />

                  <div className="flex-grow flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-gilroyBold text-lg font-bold tracking-tight">{mission.name}</h3>
                      <span className="text-xs px-2.5 py-1 rounded-md ml-2 whitespace-nowrap font-gilroyMedium border bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                        {mission.type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 font-gilroyMedium mb-4 leading-relaxed">{mission.description}</p>

                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex justify-between text-xs text-gray-300 font-gilroyMedium">
                        <span>Progress</span>
                        <span className="text-cyan-300 font-gilroyBold">
                          {mission.progress} / {mission.targetCount}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.round((mission.progress / mission.targetCount) * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center text-[#00F0FF] font-gilroyBold text-sm font-semibold tracking-wide mt-auto pt-1">
                      <Sparkles className="w-4 h-4 mr-1.5 opacity-90" />
                      +{mission.rpXpReward} RP XP
                    </div>
                  </div>

                  <div className="mt-4 relative z-10">
                    <button
                      className={`w-full font-gilroyBold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${mission.completed
                        ? 'bg-black/40 text-gray-500 border border-white/5 cursor-not-allowed'
                        : !mission.canClaim
                          ? 'bg-cyan-900/20 text-cyan-400/50 border border-cyan-500/10 cursor-not-allowed'
                          : 'glass-btn text-white hover:shadow-[0_0_15px_#00F0FF]'
                        }`}
                      disabled={mission.completed || claimingId === mission.id || !mission.canClaim}
                      onClick={() => handleClaimMission(mission)}
                    >
                      {claimingId === mission.id ? (
                        <JLTLoader variant="inline" size="sm" text="Claiming..." />
                      ) : mission.completed ? (
                        'Completed'
                      ) : !mission.canClaim ? (
                        'In Progress'
                      ) : (
                        'Claim Mission'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          CELEBRATORY REWARD CLAIM SUCCESS MODAL
          ════════════════════════════════════════════════════════ */}
      {showPopup && mounted && claimModalData &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center relative shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl">
              <div className="absolute inset-0 bg-radial from-[#7B2CBF]/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

              {/* Central Glowing Icon Badge */}
              <div className="w-16 h-16 rounded-full glass-panel border border-purple-400/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(123,44,191,0.4)]">
                {claimModalData.image ? (
                  <img
                    src={claimModalData.image}
                    alt={claimModalData.name || 'Reward'}
                    className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-[#00F0FF]" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">
                {claimModalData.title || 'Reward Claimed!'}
              </h3>

              {/* Message */}
              <p className="text-purple-200 font-gilroyMedium text-base mb-6 leading-relaxed">
                {claimModalData.message || 'Your reward has been granted and credited to your account!'}
              </p>

              {/* Reward Display */}
              <div className="flex justify-center items-center gap-6 mb-8 w-full">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-white drop-shadow-[0_0_15px_#00F0FF]">
                    {claimModalData.name}
                  </span>
                  {claimModalData.subtitle && (
                    <span className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider mt-1">
                      {claimModalData.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={() => setShowPopup(false)}
                className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#7B2CBF] hover:shadow-[0_0_25px_#7B2CBF] transition-shadow w-full cursor-pointer"
              >
                Awesome
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

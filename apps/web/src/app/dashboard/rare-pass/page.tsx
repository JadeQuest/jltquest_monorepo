"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';
import { useRarePass, RarePassLevelConfig, RarePassRewardItem, RarePassMission } from '@/hooks/useRarePass';
import { JLTLoader } from '@/components/common/JLTLoader';
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
} from 'lucide-react';

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

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [claimedRewardMessage, setClaimedRewardMessage] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Auto-scroll to current unlocked level on load */
  useEffect(() => {
    const level = status?.progression?.currentLevel ?? 1;
    if (rewards && level > 1 && scrollRef.current) {
      const cardWidth = 256; // 240px width + 16px gap
      const targetScroll = Math.max(0, (level - 2) * cardWidth);
      scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [rewards, status?.progression?.currentLevel]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleClaimReward = async (rewardId: string, rewardName: string) => {
    try {
      setClaimingId(rewardId);
      await claimReward(rewardId);
      setClaimedRewardMessage(`Successfully claimed reward: ${rewardName}!`);
      setShowPopup(true);
    } catch (err: any) {
      alert(err.message || 'Failed to claim pass reward');
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimMission = async (missionId: string, missionName: string) => {
    try {
      setClaimingId(missionId);
      const res = await claimMission(missionId);
      setClaimedRewardMessage(`Completed "${missionName}" and earned +${res.rpXpAwarded || 20} RP XP!`);
      setShowPopup(true);
    } catch (err: any) {
      alert(err.message || 'Failed to claim mission');
    } finally {
      setClaimingId(null);
    }
  };

  const handleBuyPremium = async () => {
    try {
      await buyPremium();
      setClaimedRewardMessage('Unlocked Premium Rare Pass! Exclusive rewards are now available.');
      setShowPopup(true);
    } catch (err: any) {
      alert(err.message || 'Failed to upgrade to Premium Pass');
    }
  };

  /* Calculations */
  const seasonName = status?.season?.name || 'Season 01: Cosmic Origins';
  const maxLevel = status?.season?.maxLevel ?? 30;
  const currentLevel = status?.progression?.currentLevel ?? 1;
  const totalRpXp = status?.progression?.totalRpXp ?? 0;
  const xpInCurrentLevel = status?.progression?.xpInCurrentLevel ?? 0;
  const xpRequiredForNext = status?.progression?.xpRequiredForNext ?? 100;
  const progressPercent = status?.progression?.progress ?? 0;
  const isPremium = status?.progression?.isPremium ?? false;

  const isLoading = isLoadingStatus || isLoadingRewards || isLoadingMissions;

  return (
    <div className="flex flex-col gap-8 max-w-[1550px] w-full mx-auto">
      {/* ════════════════════════════════════════════════════════
          RARE PASS HERO / SEASON STATUS BANNER
          ════════════════════════════════════════════════════════ */}
      <div className="daily-card-panel p-6 sm:p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-radial from-[#7B2CBF]/30 via-transparent to-transparent pointer-events-none" />

        {/* Left Section */}
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-cyan-400/20 w-fit">
              <Sparkles className="w-4 h-4 text-[#00F0FF] animate-sparkle" />
              <span className="text-[#00F0FF] font-gilroyMedium text-xs font-semibold uppercase tracking-wider">
                Seasonal Pass Progression
              </span>
            </div>

            <span className={`text-xs font-gilroyBold px-3 py-1 rounded-full border ${isPremium ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-white/10 text-gray-300 border-white/15'}`}>
              {isPremium ? '★ Premium Pass Active' : 'Free Pass Track'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-gilroyBold text-white tracking-tight drop-shadow-md">
            {seasonName}
          </h1>

          <p className="text-purple-200 font-gilroyRegular text-sm sm:text-base leading-relaxed opacity-90">
            Earn Rare Pass XP (RP XP) by completing quests, daily check-ins, spins, and card crafts to level up your pass and unlock exclusive cards, fragments, and 3D avatars.
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

              <div className="text-xs text-gray-400 font-gilroyMedium text-right">
                Total Season RP XP: <span className="text-white font-gilroyBold">{totalRpXp}</span>
              </div>

              {!isPremium && (
                <button
                  onClick={handleBuyPremium}
                  disabled={isBuyingPremium}
                  className="w-full mt-1 py-3 px-4 rounded-xl text-sm font-gilroyBold bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span>{isBuyingPremium ? 'Upgrading...' : 'Unlock Premium Track (200 GP)'}</span>
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
          SEASONAL REWARDS TRACK (30 LEVELS)
          ════════════════════════════════════════════════════════ */}
      {isConnected && !isLoading && rewards && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-gilroyBold text-white tracking-wide flex items-center gap-2">
                <span>Season Rewards Track</span>
                <span className="text-xs font-gilroyMedium px-2.5 py-0.5 rounded-full bg-purple-500/20 text-[#00F0FF] border border-purple-400/30">
                  30 Levels
                </span>
              </h2>
              <p className="text-sm text-purple-300 font-gilroyMedium">
                Level up to unlock Free & Premium track rewards
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-4 text-xs font-gilroyMedium">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-400/50 inline-block" />
                  Free Track
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-400/50 inline-block" />
                  Premium Track
                </div>
              </div>

              {/* Smooth Scroll Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScroll('left')}
                  className="p-2.5 rounded-xl glass-panel border border-white/15 text-white hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.5)] active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="p-2.5 rounded-xl glass-panel border border-white/15 text-white hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.5)] active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-purple-500/40 scrollbar-track-black/40"
          >
            <div className="flex gap-4 w-max min-w-full">
              {rewards.map((levelConfig: RarePassLevelConfig) => {
                const isLevelUnlocked = currentLevel >= levelConfig.level;
                const freeReward = levelConfig.rewards.find((r) => r.track === 'FREE');
                const premiumReward = levelConfig.rewards.find((r) => r.track === 'PREMIUM');

                return (
                  <div
                    key={levelConfig.level}
                    className={`glass-panel p-5 rounded-2xl flex flex-col justify-between w-[240px] shrink-0 border transition-all duration-300 relative ${
                      isLevelUnlocked
                        ? 'border-purple-500/40 shadow-[0_0_15px_rgba(123,44,191,0.2)] bg-black/40'
                        : 'border-white/5 bg-black/60 opacity-80'
                    }`}
                  >
                    {/* Level Badge Header */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-sm font-gilroyBold px-3 py-1 rounded-lg border ${isLevelUnlocked ? 'bg-purple-500/20 text-white border-purple-400/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                        Level {levelConfig.level}
                      </span>
                      <span className="text-[11px] font-gilroyMedium text-purple-300">
                        {levelConfig.requiredRpXp} RP XP
                      </span>
                    </div>

                    {/* Free Track Card Box */}
                    <div className="bg-black/40 p-3 rounded-xl border border-cyan-500/20 flex flex-col gap-1.5 mb-3">
                      <div className="flex justify-between items-center text-[10px] font-gilroyBold uppercase text-cyan-300">
                        <span>Free Reward</span>
                        {freeReward?.isClaimed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-sm font-gilroyBold text-white">
                        {freeReward ? `${freeReward.rewardType} ${freeReward.amount ? `(${freeReward.amount})` : ''}` : 'No Reward'}
                      </p>
                      {freeReward && !freeReward.isClaimed && freeReward.isClaimable && (
                        <button
                          onClick={() => handleClaimReward(freeReward.id, `${freeReward.rewardType} (${freeReward.amount || 1})`)}
                          disabled={claimingId === freeReward.id}
                          className="w-full mt-1 py-1.5 rounded-lg text-xs font-gilroyBold glass-btn text-white hover:shadow-[0_0_10px_#00F0FF] cursor-pointer"
                        >
                          {claimingId === freeReward.id ? 'Claiming...' : 'Claim Free'}
                        </button>
                      )}
                    </div>

                    {/* Premium Track Card Box */}
                    <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${isPremium ? 'bg-amber-500/10 border-amber-400/30' : 'bg-black/50 border-white/5 opacity-60'}`}>
                      <div className="flex justify-between items-center text-[10px] font-gilroyBold uppercase text-amber-300">
                        <span className="flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Premium
                        </span>
                        {premiumReward?.isClaimed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {!isPremium && <Lock className="w-3.5 h-3.5 text-gray-500" />}
                      </div>
                      <p className="text-sm font-gilroyBold text-amber-100">
                        {premiumReward ? `${premiumReward.rewardType} ${premiumReward.amount ? `(${premiumReward.amount})` : ''}` : 'Exclusive Bonus'}
                      </p>
                      {isPremium && premiumReward && !premiumReward.isClaimed && premiumReward.isClaimable && (
                        <button
                          onClick={() => handleClaimReward(premiumReward.id, `Premium ${premiumReward.rewardType}`)}
                          disabled={claimingId === premiumReward.id}
                          className="w-full mt-1 py-1.5 rounded-lg text-xs font-gilroyBold bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-pointer"
                        >
                          {claimingId === premiumReward.id ? 'Claiming...' : 'Claim Premium'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          RARE PASS MISSIONS SECTION
          ════════════════════════════════════════════════════════ */}
      {isConnected && !isLoading && missions && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-gilroyBold text-white tracking-wide">
              Rare Pass Missions
            </h2>
            <p className="text-sm text-purple-300 font-gilroyMedium">
              Complete daily and weekly seasonal missions to earn RP XP
            </p>
          </div>

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
                    className={`w-full font-gilroyBold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      mission.completed
                        ? 'bg-black/40 text-gray-500 border border-white/5 cursor-not-allowed'
                        : !mission.canClaim
                        ? 'bg-cyan-900/20 text-cyan-400/50 border border-cyan-500/10 cursor-not-allowed'
                        : 'glass-btn text-white hover:shadow-[0_0_15px_#00F0FF]'
                    }`}
                    disabled={mission.completed || claimingId === mission.id || !mission.canClaim}
                    onClick={() => handleClaimMission(mission.id, mission.name)}
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
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          CLAIM SUCCESS MODAL
          ════════════════════════════════════════════════════════ */}
      {showPopup && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center relative animate-fade-in shadow-[0_0_40px_rgba(0,240,255,0.3)] border border-cyan-400/20 rounded-2xl">
              <div className="w-16 h-16 rounded-full glass-panel border border-cyan-400/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                <Sparkles className="w-8 h-8 text-[#00F0FF] animate-spin" />
              </div>

              <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">Pass Update!</h3>
              <p className="text-cyan-200 font-gilroyMedium text-base mb-6 leading-relaxed">
                {claimedRewardMessage}
              </p>

              <button
                onClick={() => setShowPopup(false)}
                className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#00F0FF] hover:shadow-[0_0_25px_#00F0FF] transition-shadow w-full cursor-pointer"
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

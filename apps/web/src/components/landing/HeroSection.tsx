'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Sparkles, Trophy, Flame, ShieldCheck, ArrowRight, CheckCircle2, Star, Zap, Gift } from 'lucide-react';

interface ActivityItem {
  id: number;
  user: string;
  avatar: string;
  action: string;
  reward: string;
  color: string;
}

const liveActivities: ActivityItem[] = [
  { id: 1, user: '@Marcus_G', avatar: 'MG', action: 'completed Daily Spin', reward: '+300 Coins', color: 'from-amber-500 to-orange-500' },
  { id: 2, user: '@Elena_R', avatar: 'ER', action: 'unlocked Mythic Pass', reward: 'Rare Drop', color: 'from-purple-500 to-pink-500' },
  { id: 3, user: '@Dushyant_K', avatar: 'DK', action: 'hit 14-day streak', reward: '2.5x Multiplier', color: 'from-[#360C9F] to-[#FFA28D]' },
  { id: 4, user: '@Sarah_V', avatar: 'SV', action: 'climbed to Rank #3', reward: 'Seasonal Trophy', color: 'from-[#7B2CBF] to-emerald-400' },
];

export const HeroSection: React.FC = () => {
  const [claimedBonus, setClaimedBonus] = useState(false);
  const [coinsCount, setCoinsCount] = useState(1250);
  const [floatingCoins, setFloatingCoins] = useState<number[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Interactive Quest state
  const [questProgress, setQuestProgress] = useState(2);
  const [questCompleted, setQuestCompleted] = useState(false);

  // Cycle live activity notifications
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % liveActivities.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const coinTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (coinTimeoutRef.current) clearTimeout(coinTimeoutRef.current);
    };
  }, []);

  const triggerCoinAnimation = React.useCallback(() => {
    setFloatingCoins((prev) => [...prev, Date.now()]);
    if (coinTimeoutRef.current) clearTimeout(coinTimeoutRef.current);
    coinTimeoutRef.current = setTimeout(() => {
      setFloatingCoins((prev) => prev.slice(1));
    }, 1500);
  }, []);

  const handleClaimBonus = React.useCallback(() => {
    if (claimedBonus) return;
    setClaimedBonus(true);
    setCoinsCount((prev) => prev + 150);
    triggerCoinAnimation();
  }, [claimedBonus, triggerCoinAnimation]);

  const handleSimulateQuest = React.useCallback(() => {
    if (questCompleted) return;
    if (questProgress < 3) {
      const nextProgress = questProgress + 1;
      setQuestProgress(nextProgress);
      if (nextProgress === 3) {
        setQuestCompleted(true);
        setCoinsCount((prev) => prev + 300);
        triggerCoinAnimation();
      }
    }
  }, [questCompleted, questProgress, triggerCoinAnimation]);

  const currentActivity = liveActivities[currentActivityIndex];

  return (
    <section className="relative w-full pt-32 pb-24 px-6 bg-[#080411] overflow-hidden min-h-[92vh] flex flex-col justify-center select-none">
      {/* ── Dynamic Ambient Glow Orbs ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[550px] rounded-full bg-radial from-[#360C9F]/40 via-[#340073]/20 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-12 left-[-12%] w-[600px] h-[600px] rounded-full bg-radial from-[#FFA28D]/20 via-transparent to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-8%] w-[650px] h-[650px] rounded-full bg-radial from-[#7B2CBF]/25 via-transparent to-transparent blur-[140px] pointer-events-none" />

      {/* Futuristic Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_10%,#000_75%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── LEFT COLUMN: Hero Copy & Actions ── */}
          <div className="lg:col-span-7 flex flex-col items-start gap-7 text-left">
            
            {/* Live Social Proof Badge + Live Feed Ticker */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="glass-pill px-4 py-2 inline-flex items-center gap-3 animate-fade-in shadow-[0_0_20px_rgba(54,12,159,0.35)]">
                <div className="flex items-center -space-x-2">
                  <div className="h-7 w-7 rounded-full ring-2 ring-[#360C9F] bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-gilroyBold text-white leading-none shadow shrink-0 select-none">
                    DK
                  </div>
                  <div className="h-7 w-7 rounded-full ring-2 ring-[#360C9F] bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-[10px] font-gilroyBold text-white leading-none shadow shrink-0 select-none">
                    JM
                  </div>
                  <div className="h-7 w-7 rounded-full ring-2 ring-[#360C9F] bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-gilroyBold text-white leading-none shadow shrink-0 select-none">
                    AR
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-gilroyMedium text-xs sm:text-sm text-white/90 leading-none">
                    <strong className="text-white font-gilroyBold">1,420 players</strong> online now
                  </span>
                </div>
              </div>

              {/* Cycling Live Activity Pill */}
              <div className="glass-pill px-3.5 py-1.5 hidden sm:inline-flex items-center gap-2 border border-purple-500/30 bg-purple-900/20 text-xs animate-fade-in transition-all duration-500">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-gray-300 font-gilroyRegular">
                  <strong className="text-white font-gilroyBold">{currentActivity.user}</strong> {currentActivity.action}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-gilroyBold text-[10px]">
                  {currentActivity.reward}
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-3">
              <h1 className="font-gilroyBold text-4xl sm:text-6xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                Play daily. Earn real perks.{' '}
                <span className="block mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] via-[#E280FF] to-[#8C52FF] drop-shadow-[0_0_35px_rgba(255,162,141,0.4)]">
                  Your squad is waiting.
                </span>
              </h1>
              <p className="font-gilroyRegular text-gray-300 text-lg sm:text-xl max-w-2xl leading-relaxed mt-2">
                No complex crypto jargon or boring grinds. Complete quick daily missions inside JaxMart, spin for rare passes, and build your reward streak with friends.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full pt-2">
              <Link
                href="/dashboard"
                id="hero-start-quest-btn"
                className="glass-btn px-8 py-4 rounded-xl font-gilroyBold text-white text-lg tracking-wide shadow-[0_0_35px_rgba(54,12,159,0.6)] flex items-center gap-3 group hover:shadow-[0_0_50px_rgba(255,162,141,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Start Your First Quest</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>

              {/* Interactive Demo Bonus Button */}
              <button
                onClick={handleClaimBonus}
                type="button"
                className={`relative px-6 py-4 rounded-xl font-gilroyMedium text-base transition-all duration-300 flex items-center gap-2.5 border ${
                  claimedBonus
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'glass-pill hover:bg-white/10 text-white border-white/15 hover:border-white/30 cursor-pointer active:scale-95 shadow-lg'
                }`}
              >
                {claimedBonus ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>+150 Welcome Coins Claimed!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#FFA28D] animate-spin" style={{ animationDuration: '5s' }} />
                    <span>Claim Demo +150 Coins</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-gray-400 font-gilroyRegular">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FFA28D]" />
                <span>Free to Play Forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFA28D]" />
                <span>JaxMart Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FFA28D]" />
                <span>Daily Leaderboard Prizes</span>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Interactive Quest Showcase ── */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Background Glow Ring */}
            <div className="absolute w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] opacity-25 blur-3xl animate-pulse" />

            {/* Main Interactive Hero Panel */}
            <div className="w-full max-w-md glass-panel p-6 sm:p-7 flex flex-col gap-6 relative z-10 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 hover:border-white/25">
              
              {/* Card Header: Profile & Live Coin Counter */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/Mascot.svg"
                      alt="JLT Mascot"
                      className="w-12 h-12 object-contain rounded-full bg-[#340073]/80 p-1 border border-white/25 shadow-inner"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow">
                      <Flame className="w-2.5 h-2.5 text-white animate-flame" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-gilroyBold text-white text-base">Questor Alex</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#360C9F] text-[10px] font-gilroyBold text-purple-200 border border-purple-400/30">
                        LVL 4
                      </span>
                    </div>
                    <span className="font-gilroyRegular text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 7 Day Streak Active
                    </span>
                  </div>
                </div>

                {/* Coin Counter Pill */}
                <div className="glass-pill px-3.5 py-1.5 flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 relative shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <img src="/Coin.svg" alt="Coin" className="w-5 h-5 object-contain animate-bounce" style={{ animationDuration: '2.5s' }} />
                  <span className="font-gilroyBold text-amber-300 text-sm tracking-wide">{coinsCount.toLocaleString()}</span>
                  
                  {/* Floating +150 Animation */}
                  {floatingCoins.map((id) => (
                    <span
                      key={id}
                      className="absolute -top-7 right-1 font-gilroyBold text-xs text-amber-300 animate-fade-up pointer-events-none drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                    >
                      +150 🪙
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Interactive Quest Box */}
              <div className="daily-card-panel p-4 sm:p-5 flex flex-col gap-3.5 relative overflow-hidden border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#360C9F]/80 text-white shadow">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </span>
                    <span className="font-gilroyBold text-white text-sm tracking-wide">Today's Featured Quest</span>
                  </div>
                  <span className="text-[11px] font-gilroyBold text-[#FFA28D] bg-[#FFA28D]/15 px-2.5 py-0.5 rounded-full border border-[#FFA28D]/40 shadow-sm">
                    2x Bonus
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="font-gilroyBold text-white text-base">Complete 3 JaxMart Daily Spins</h4>
                  <p className="font-gilroyRegular text-xs text-gray-300 leading-relaxed">
                    Spin the daily wheel to unlock instant coins & rare loot boxes.
                  </p>
                </div>

                {/* Progress Bar & Interactive Trigger */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center text-xs font-gilroyMedium">
                    <span className="text-gray-300">Quest Status</span>
                    <span className={`font-gilroyBold ${questCompleted ? 'text-emerald-400' : 'text-white'}`}>
                      {questCompleted ? '🎉 COMPLETED (+300 Coins)' : `${questProgress} / 3 Done`}
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full transition-all duration-500 relative"
                      style={{ width: `${(questProgress / 3) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Interactive Button inside Preview Card */}
                  {!questCompleted ? (
                    <button
                      onClick={handleSimulateQuest}
                      type="button"
                      className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-[#360C9F] to-[#7B2CBF] hover:from-[#4310C2] hover:to-[#8C34D9] text-white font-gilroyBold text-xs tracking-wider uppercase shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Simulate Daily Spin ({questProgress}/3)</span>
                    </button>
                  ) : (
                    <div className="mt-2 w-full py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-gilroyBold text-xs tracking-wider uppercase text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Quest Cleared & Rewarded!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rare Collectibles Row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-gilroyMedium text-xs text-gray-400">Unlockable Loot Passes:</span>
                <div className="flex items-center gap-2.5">
                  <div className="group relative cursor-pointer" title="Mythic Pass">
                    <img src="/Collect1.svg" alt="Pass 1" className="w-9 h-9 object-contain transform group-hover:scale-125 transition-transform duration-200 drop-shadow-[0_0_8px_rgba(255,162,141,0.5)]" />
                  </div>
                  <div className="group relative cursor-pointer" title="Rare Drop">
                    <img src="/Collect2.svg" alt="Pass 2" className="w-9 h-9 object-contain transform group-hover:scale-125 transition-transform duration-200 drop-shadow-[0_0_8px_rgba(123,44,191,0.5)]" />
                  </div>
                  <div className="group relative cursor-pointer" title="Gold Pass">
                    <img src="/Collect3.svg" alt="Pass 3" className="w-9 h-9 object-contain transform group-hover:scale-125 transition-transform duration-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  </div>
                </div>
              </div>

              {/* Floating Human Testimonial Card */}
              <div className="absolute -bottom-6 -left-6 glass-pill p-3.5 max-w-[270px] hidden sm:flex items-start gap-3 border border-white/20 shadow-2xl backdrop-blur-xl animate-float">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-gilroyBold text-xs text-white shrink-0 shadow">
                  DK
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="font-gilroyBold text-white text-xs">Dushyant K.</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="font-gilroyRegular text-[11px] text-gray-300 leading-tight">
                    "Got my first rare pass in 3 days! Easiest daily rewards ever."
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ── BOTTOM STATS BAR ── */}
        <div className="mt-20 pt-10 animated-border-t grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-1 group">
            <span className="font-gilroyBold text-3xl sm:text-4xl text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              50,000+
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Active Quest Players</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <span className="font-gilroyBold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] to-amber-300 tracking-tight group-hover:scale-105 transition-transform duration-200">
              2.4 Million
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Daily Quests Cleared</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <span className="font-gilroyBold text-3xl sm:text-4xl text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              150,000+
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Passes & Rewards Claimed</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <span className="font-gilroyBold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#FFA28D] tracking-tight group-hover:scale-105 transition-transform duration-200">
              99.4%
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Positive Player Feedback</span>
          </div>
        </div>

      </div>
    </section>
  );
};

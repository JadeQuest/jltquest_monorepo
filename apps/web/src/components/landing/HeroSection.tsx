'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Trophy,
  Flame,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Play,
  Layers,
  Gift,
  Copy,
  Check,
} from 'lucide-react';
import { getStoredReferralCode, storeReferralCode } from '@/lib/authCookie';
import { createParticleBurst, createReversibleCounter } from '@/lib/animations';
import { useMagneticButton } from './useMagneticButton';

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

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  alphaSpeed: number;
}

function HeroSectionContent() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dashboardCardRef = useRef<HTMLDivElement>(null);

  // Stat Counter refs
  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);
  const stat3Ref = useRef<HTMLSpanElement>(null);
  const stat4Ref = useRef<HTMLSpanElement>(null);

  // Animate stat counters on scroll into view
  useEffect(() => {
    const triggers: any[] = [];
    if (stat1Ref.current) {
      const t = createReversibleCounter(stat1Ref.current, 50000, { suffix: '+' });
      if (t) triggers.push(t);
    }
    if (stat2Ref.current) {
      const t = createReversibleCounter(stat2Ref.current, 2.4, { decimals: 1, suffix: ' Million' });
      if (t) triggers.push(t);
    }
    if (stat3Ref.current) {
      const t = createReversibleCounter(stat3Ref.current, 150000, { suffix: '+' });
      if (t) triggers.push(t);
    }
    if (stat4Ref.current) {
      const t = createReversibleCounter(stat4Ref.current, 99.4, { decimals: 1, suffix: '%' });
      if (t) triggers.push(t);
    }
    return () => {
      triggers.forEach((tr) => tr && typeof tr.kill === 'function' && tr.kill());
    };
  }, []);

  // Magnetic button refs
  const startQuestBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 14, strength: 0.28 });
  const claimBonusBtnRef = useMagneticButton<HTMLButtonElement>({ maxDistance: 12, strength: 0.24 });

  const [claimedBonus, setClaimedBonus] = useState(false);
  const [coinsCount, setCoinsCount] = useState(1250);
  const [floatingCoins, setFloatingCoins] = useState<number[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Referral code check
  useEffect(() => {
    try {
      const refQuery = searchParams?.get('ref');
      if (refQuery) {
        const cleaned = refQuery.trim().toUpperCase();
        storeReferralCode(cleaned);
        setReferralCode(cleaned);
      } else {
        const stored = getStoredReferralCode();
        if (stored) {
          setReferralCode(stored);
        }
      }
    } catch {
      // Safe fallback
    }
  }, [searchParams]);

  const handleCopyReferral = useCallback(() => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  }, [referralCode]);

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

  const coinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (coinTimeoutRef.current) clearTimeout(coinTimeoutRef.current);
    };
  }, []);

  const triggerCoinAnimation = useCallback(() => {
    setFloatingCoins((prev) => [...prev, Date.now()]);
    if (coinTimeoutRef.current) clearTimeout(coinTimeoutRef.current);
    coinTimeoutRef.current = setTimeout(() => {
      setFloatingCoins((prev) => prev.slice(1));
    }, 1500);
  }, []);

  const handleClaimBonus = useCallback(() => {
    if (claimedBonus) return;
    setClaimedBonus(true);
    setCoinsCount((prev) => prev + 150);
    triggerCoinAnimation();
    if (dashboardCardRef.current) {
      createParticleBurst(dashboardCardRef.current, { count: 22, radius: 85 });
    }
  }, [claimedBonus, triggerCoinAnimation]);

  const handleSimulateQuest = useCallback(() => {
    if (questCompleted) return;
    if (questProgress < 3) {
      const nextProgress = questProgress + 1;
      setQuestProgress(nextProgress);
      if (nextProgress === 3) {
        setQuestCompleted(true);
        setCoinsCount((prev) => prev + 300);
        triggerCoinAnimation();
        if (dashboardCardRef.current) {
          createParticleBurst(dashboardCardRef.current, { count: 28, radius: 100 });
        }
      }
    }
  }, [questCompleted, questProgress, triggerCoinAnimation]);

  // Sparkles canvas particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = section.clientWidth);
    let height = (canvas.height = section.clientHeight);

    const colors = ['#FFA28D', '#8C52FF', '#00F0FF', '#FFD700', '#FFFFFF'];
    const particles: SparkleParticle[] = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        alphaSpeed: 0.006 + Math.random() * 0.008,
      });
    }

    const handleResize = () => {
      if (!canvas || !section) return;
      width = canvas.width = section.clientWidth;
      height = canvas.height = section.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;

        if (p.alpha >= 0.85 || p.alpha <= 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const currentActivity = liveActivities[currentActivityIndex];

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full pt-24 sm:pt-28 md:pt-32 pb-0 px-4 sm:px-6 bg-transparent overflow-hidden min-h-[90svh] flex flex-col justify-between select-none"
    >
      {/* Sparkles Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full bg-radial from-[#360C9F]/30 via-[#340073]/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-16 left-[-10%] w-[550px] h-[550px] rounded-full bg-radial from-[#FFA28D]/15 via-[#7B2CBF]/10 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-8%] w-[600px] h-[600px] rounded-full bg-radial from-[#7B2CBF]/20 via-transparent to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Clean Typography & Interactive CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 sm:gap-8 text-left">
            
            {/* Squad Referral Welcome Banner */}
            {referralCode && (
              <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1E085A]/90 via-[#360C9F]/40 to-[#2A0845]/90 border border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <Gift className="w-5 h-5 animate-bounce" style={{ animationDuration: '2.5s' }} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-xs font-gilroyBold uppercase tracking-wider text-amber-300">
                        Squad Referral Activated
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/70 border border-amber-400/40 text-amber-400 font-mono font-bold text-[11px] tracking-wide">
                        {referralCode}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 font-gilroyMedium">
                      You've been invited! Join now to claim <strong className="text-amber-300 font-gilroyBold">+150 GP</strong> Welcome Bonus.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="glass-pill px-3 py-1.5 rounded-xl text-xs font-gilroyBold text-white flex items-center gap-1.5 border-amber-400/30 hover:border-amber-400/60 transition-all shrink-0 cursor-pointer"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRef ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <Link
                    href={`/dashboard/invites?ref=${encodeURIComponent(referralCode)}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-gilroyBold text-amber-300 bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 transition-all shrink-0"
                  >
                    Redeem GP →
                  </Link>
                </div>
              </div>
            )}

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="glass-pill px-3 sm:px-4 py-1.5 sm:py-2 inline-flex items-center gap-2.5 sm:gap-3 shadow-[0_0_25px_rgba(54,12,159,0.4)] border border-purple-500/30">
                <div className="flex items-center -space-x-2">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-[#360C9F] bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-[9px] sm:text-[10px] font-gilroyBold text-white leading-none shadow shrink-0 select-none">
                    DK
                  </div>
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-[#360C9F] bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-[9px] sm:text-[10px] font-gilroyBold text-white leading-none shadow shrink-0 select-none">
                    JM
                  </div>
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-[#360C9F] bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[9px] sm:text-[10px] font-gilroyBold text-white leading-none shadow shrink-0 select-none">
                    AR
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-gilroyMedium text-[11px] sm:text-sm text-white/90 leading-none">
                    <strong className="text-white font-gilroyBold">1,420 players</strong> online now
                  </span>
                </div>
              </div>

              {/* Cycling Live Activity Pill */}
              <div className="glass-pill px-3 py-1.5 hidden sm:inline-flex items-center gap-2 border border-purple-500/30 bg-purple-900/25 text-xs transition-all duration-500">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-gray-300 font-gilroyRegular">
                  <strong className="text-white font-gilroyBold">{currentActivity.user}</strong> {currentActivity.action}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-gilroyBold text-[10px]">
                  {currentActivity.reward}
                </span>
              </div>
            </div>

            {/* Headline Typography */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <h1 className="font-gilroyBold text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-[1.02] flex items-center gap-3">
                <span>JLTQuest</span>
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-[#FFA28D] inline-block animate-pulse" />
              </h1>
              <h2 className="font-gilroyBold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] sm:leading-[1.04]">
                Play daily.
              </h2>
              <h2 className="font-gilroyBold text-3xl sm:text-5xl lg:text-6xl text-white/90 tracking-tight leading-[1.1] sm:leading-[1.06]">
                Earn real perks.
              </h2>
            </div>

            <p className="font-gilroyRegular text-gray-300 text-sm sm:text-lg lg:text-xl max-w-2xl leading-relaxed">
              No complex crypto jargon or boring grinds. Complete quick daily missions inside JaxMart, spin for rare passes, and build your reward streak with friends.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full pt-1">
              <Link
                ref={startQuestBtnRef}
                href={referralCode ? `/dashboard?ref=${encodeURIComponent(referralCode)}` : '/dashboard'}
                id="hero-start-quest-btn"
                data-cursor="cta"
                data-cursor-text="START →"
                className="glass-btn gsap-magnetic-btn px-6 sm:px-9 py-3.5 sm:py-4.5 rounded-2xl font-gilroyBold text-white text-base sm:text-lg tracking-wide leading-tight text-center shadow-[0_0_40px_rgba(54,12,159,0.6)] flex items-center justify-center gap-3 group hover:shadow-[0_0_60px_rgba(255,162,141,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                <span>Start Your First Quest</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200 magnetic-icon" />
              </Link>

              {/* Interactive Demo Bonus Button */}
              <button
                ref={claimBonusBtnRef}
                onClick={handleClaimBonus}
                type="button"
                data-cursor="reward"
                data-cursor-text="CLAIM 🪙"
                className={`relative gsap-magnetic-btn px-5 sm:px-7 py-3.5 sm:py-4.5 rounded-2xl font-gilroyMedium text-sm sm:text-base leading-tight text-center transition-all duration-300 flex items-center justify-center gap-2.5 border ${
                  claimedBonus
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'glass-pill hover:bg-white/10 text-white border-white/15 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg'
                }`}
              >
                {claimedBonus ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span>+150 GP Welcome Bonus Claimed!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse magnetic-icon" />
                    <span>Claim Demo +150 GP</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-6 pt-2 text-xs sm:text-sm text-gray-400 font-gilroyRegular">
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
                <span>+100 GP Squad Rewards</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Quest Panel */}
          <div className="lg:col-span-5 relative flex justify-center items-center w-full">
            
            {/* Background Glow */}
            <div className="absolute w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full bg-gradient-to-br from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] opacity-25 blur-3xl pointer-events-none" />

            {/* Main Interactive Hero Panel */}
            <div
              ref={dashboardCardRef}
              data-cursor="card"
              data-cursor-text="QUEST 🎯"
              className="w-full max-w-md glass-panel p-5 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6 relative z-10 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-all duration-300 hover:border-white/35"
            >
              
              {/* Card Header: Profile & Live GP Counter */}
              <div className="flex items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src="/icon/mascot.webp"
                      alt="JLT Mascot"
                      width={48}
                      height={48}
                      loading="eager"
                      decoding="async"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full bg-[#340073]/80 p-1 border border-white/25 shadow-inner"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow">
                      <Flame className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-white animate-flame" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-gilroyBold text-white text-sm sm:text-base truncate">Questor Alex</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#360C9F] text-[9px] sm:text-[10px] font-gilroyBold text-purple-200 border border-purple-400/30 shrink-0">
                        LVL 4
                      </span>
                    </div>
                    <span className="font-gilroyRegular text-[11px] sm:text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span> 7 Day Streak Active
                    </span>
                  </div>
                </div>

                {/* GP Counter Pill */}
                <div className="glass-pill px-2.5 sm:px-3.5 py-1.5 flex items-center gap-1.5 sm:gap-2 border border-amber-500/40 bg-amber-500/10 relative shadow-[0_0_15px_rgba(251,191,36,0.25)] shrink-0">
                  <img src="/icon/coin.webp" alt="GP" width={20} height={20} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                  <span className="font-gilroyBold text-amber-300 text-xs sm:text-sm tracking-wide">{coinsCount.toLocaleString()} GP</span>
                  
                  {/* Floating +150 GP Animation */}
                  {floatingCoins.map((id) => (
                    <span
                      key={id}
                      className="absolute -top-7 right-1 font-gilroyBold text-xs text-amber-300 animate-fade-up pointer-events-none drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                    >
                      +150 GP 🪙
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Interactive Quest Box */}
              <div className="daily-card-panel p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-3.5 relative overflow-hidden border border-white/10 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 sm:p-1.5 rounded-lg bg-[#360C9F]/80 text-white shadow inline-block">
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
                    </span>
                    <span className="font-gilroyBold text-white text-xs sm:text-sm tracking-wide">Today's Featured Quest</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-gilroyBold text-[#FFA28D] bg-[#FFA28D]/15 px-2 sm:px-2.5 py-0.5 rounded-full border border-[#FFA28D]/40 shadow-sm">
                    2x Bonus
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="font-gilroyBold text-white text-sm sm:text-base">Complete 3 JaxMart Daily Spins</h4>
                  <p className="font-gilroyRegular text-xs text-gray-300 leading-relaxed">
                    Spin the daily wheel to unlock instant GP & rare loot boxes.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs font-gilroyMedium">
                    <span className="text-gray-300">Quest Status</span>
                    <span className={`font-gilroyBold transition-colors duration-300 ${questCompleted ? 'text-emerald-400' : 'text-white'}`}>
                      {questCompleted ? '🎉 COMPLETED (+300 GP)' : `${questProgress} / 3 Done`}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full transition-all duration-300 relative overflow-hidden"
                      style={{ width: `${(questProgress / 3) * 100}%` }}
                    />
                  </div>

                  {/* Interactive Button */}
                  {!questCompleted ? (
                    <button
                      onClick={handleSimulateQuest}
                      type="button"
                      className="mt-2 w-full py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-[#360C9F] to-[#7B2CBF] hover:from-[#4310C2] hover:to-[#8C34D9] text-white font-gilroyBold text-[11px] sm:text-xs tracking-wider uppercase shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Simulate Daily Spin ({questProgress}/3)</span>
                    </button>
                  ) : (
                    <div className="mt-2 w-full py-2.5 sm:py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-gilroyBold text-[11px] sm:text-xs tracking-wider uppercase text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Quest Cleared & Rewarded!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rare Collectibles Row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-gilroyMedium text-xs text-gray-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#FFA28D]" />
                  <span>Unlockable Loot Passes:</span>
                </span>
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="group relative cursor-pointer" title="Mythic Pass">
                    <img src="/card/collect-1.webp" alt="Pass 1" width={36} height={40} loading="lazy" decoding="async" className="w-8 h-8 sm:w-9 sm:h-9 object-contain transform group-hover:scale-125 transition-transform duration-200" />
                  </div>
                  <div className="group relative cursor-pointer" title="Rare Drop">
                    <img src="/card/collect-2.webp" alt="Pass 2" width={36} height={44} loading="lazy" decoding="async" className="w-8 h-8 sm:w-9 sm:h-9 object-contain transform group-hover:scale-125 transition-transform duration-200" />
                  </div>
                  <div className="group relative cursor-pointer" title="Gold Pass">
                    <img src="/card/collect-3.webp" alt="Pass 3" width={36} height={43} loading="lazy" decoding="async" className="w-8 h-8 sm:w-9 sm:h-9 object-contain transform group-hover:scale-125 transition-transform duration-200" />
                  </div>
                </div>
              </div>

              {/* Testimonial Chip */}
              <div className="absolute -bottom-6 -left-6 glass-pill p-3.5 max-w-[270px] hidden md:flex items-start gap-3 border border-white/20 shadow-2xl backdrop-blur-xl">
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

        {/* BOTTOM STATS BAR */}
        <div className="mt-12 sm:mt-16 py-7 sm:py-9 md:py-10 relative grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {/* Top Animated Glowing Gradient Line */}
          <div className="stats-divider-top absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl h-[1.5px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] via-[#00F0FF] to-transparent shadow-[0_0_15px_rgba(255,162,141,0.6)] animate-pulse pointer-events-none" />

          {/* Bottom Animated Glowing Gradient Line */}
          <div className="stats-divider-bottom absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF] via-[#FFA28D] via-[#360C9F] to-transparent shadow-[0_0_15px_rgba(0,240,255,0.6)] animate-pulse pointer-events-none" />

          <div className="flex flex-col items-center gap-1 group">
            <span ref={stat1Ref} className="font-gilroyBold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              50,000+
            </span>
            <span className="font-gilroyRegular text-[11px] sm:text-xs md:text-sm text-gray-400">Active Quest Players</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <span ref={stat2Ref} className="font-gilroyBold text-2xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] to-amber-300 tracking-tight group-hover:scale-105 transition-transform duration-200">
              2.4 Million
            </span>
            <span className="font-gilroyRegular text-[11px] sm:text-xs md:text-sm text-gray-400">Daily Quests Cleared</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <span ref={stat3Ref} className="font-gilroyBold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              150,000+
            </span>
            <span className="font-gilroyRegular text-[11px] sm:text-xs md:text-sm text-gray-400">Passes & Rewards Claimed</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <span ref={stat4Ref} className="font-gilroyBold text-2xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#FFA28D] tracking-tight group-hover:scale-105 transition-transform duration-200">
              99.4%
            </span>
            <span className="font-gilroyRegular text-[11px] sm:text-xs md:text-sm text-gray-400">Positive Player Feedback</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export const HeroSection: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="min-h-[90svh] w-full" />}>
      <HeroSectionContent />
    </React.Suspense>
  );
};

export default HeroSection;

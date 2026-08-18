'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
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
  Compass,
} from 'lucide-react';
import {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
  isTouchDevice,
  createReversibleCounter,
  createParticleBurst,
  ReversibleToggleActions,
  MotionEases,
} from '@/lib/animations';
import { useMagneticButton } from './useMagneticButton';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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

const marqueeItems = [
  '50,000+ ACTIVE PLAYERS',
  '2.4M+ QUESTS CLEARED',
  '150K+ RARE PASS DROPS',
  '100% FREE TO PLAY',
  'POWERED BY JAXMART',
  'ZERO GAS REQUIRED',
  'DAILY SPIN TO WIN',
  'SEASONAL LEADERBOARDS',
];

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const dashboardCardRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const particleFieldRef = useRef<HTMLDivElement>(null);
  const symbol1Ref = useRef<HTMLDivElement>(null);
  const symbol2Ref = useRef<HTMLDivElement>(null);

  // Magnetic button refs with independent icon motion & elastic snapback
  const startQuestBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 14, strength: 0.28 });
  const claimBonusBtnRef = useMagneticButton<HTMLButtonElement>({ maxDistance: 12, strength: 0.24 });

  // Counter text refs for GSAP numeric interpolation
  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);
  const stat3Ref = useRef<HTMLSpanElement>(null);
  const stat4Ref = useRef<HTMLSpanElement>(null);

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

  const coinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    if (dashboardCardRef.current) {
      createParticleBurst(dashboardCardRef.current, { count: 20, radius: 80 });
    }
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
        if (dashboardCardRef.current) {
          createParticleBurst(dashboardCardRef.current, { count: 25, radius: 90 });
        }
      }
    }
  }, [questCompleted, questProgress, triggerCoinAnimation]);

  // ─── 2. TRIONN-INSPIRED MULTI-SPEED LIVING BACKGROUND MOUSE PARALLAX ───
  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;

    const section = sectionRef.current;
    const card = dashboardCardRef.current;
    const orb1 = orb1Ref.current;
    const orb2 = orb2Ref.current;
    const grid = gridRef.current;
    const particles = particleFieldRef.current;
    const sym1 = symbol1Ref.current;
    const sym2 = symbol2Ref.current;
    if (!section || !card) return;

    // Movement strengths with force3D hardware acceleration
    const cardRotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2.out', force3D: true });
    const cardRotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2.out', force3D: true });
    const cardX = gsap.quickTo(card, 'x', { duration: 0.5, ease: 'power2.out', force3D: true });
    const cardY = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power2.out', force3D: true });

    const orb1X = orb1 ? gsap.quickTo(orb1, 'x', { duration: 0.8, ease: 'power2.out', force3D: true }) : null;
    const orb1Y = orb1 ? gsap.quickTo(orb1, 'y', { duration: 0.8, ease: 'power2.out', force3D: true }) : null;
    const orb2X = orb2 ? gsap.quickTo(orb2, 'x', { duration: 0.9, ease: 'power2.out', force3D: true }) : null;
    const orb2Y = orb2 ? gsap.quickTo(orb2, 'y', { duration: 0.9, ease: 'power2.out', force3D: true }) : null;

    const gridX = grid ? gsap.quickTo(grid, 'x', { duration: 0.6, ease: 'power2.out', force3D: true }) : null;
    const gridY = grid ? gsap.quickTo(grid, 'y', { duration: 0.6, ease: 'power2.out', force3D: true }) : null;

    const particlesX = particles ? gsap.quickTo(particles, 'x', { duration: 0.5, ease: 'power2.out', force3D: true }) : null;
    const particlesY = particles ? gsap.quickTo(particles, 'y', { duration: 0.5, ease: 'power2.out', force3D: true }) : null;

    const sym1X = sym1 ? gsap.quickTo(sym1, 'x', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;
    const sym1Y = sym1 ? gsap.quickTo(sym1, 'y', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;
    const sym2X = sym2 ? gsap.quickTo(sym2, 'x', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;
    const sym2Y = sym2 ? gsap.quickTo(sym2, 'y', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;

    // Cache section bounding rect to avoid layout recalculations during mousemove
    let cachedRect = section.getBoundingClientRect();
    const updateRect = () => {
      if (section) cachedRect = section.getBoundingClientRect();
    };

    let heroRaf: number | null = null;
    let clientX = 0;
    let clientY = 0;

    const processHeroParallax = () => {
      heroRaf = null;
      if (!cachedRect.width || !cachedRect.height) return;

      const relX = (clientX - cachedRect.left) / cachedRect.width - 0.5;
      const relY = (clientY - cachedRect.top) / cachedRect.height - 0.5;

      // Card 0.20x
      cardRotX(relY * -9);
      cardRotY(relX * 11);
      cardX(relX * 22);
      cardY(relY * 16);

      // Glow 0.05x
      if (orb1X && orb1Y) {
        orb1X(relX * -30);
        orb1Y(relY * -20);
      }
      if (orb2X && orb2Y) {
        orb2X(relX * 35);
        orb2Y(relY * 25);
      }

      // Grid 0.08x
      if (gridX && gridY) {
        gridX(relX * 18);
        gridY(relY * 18);
      }

      // Particles 0.15x
      if (particlesX && particlesY) {
        particlesX(relX * -35);
        particlesY(relY * -30);
      }

      // Floating Symbols 0.30x
      if (sym1X && sym1Y) {
        sym1X(relX * 45);
        sym1Y(relY * 40);
      }
      if (sym2X && sym2Y) {
        sym2X(relX * -50);
        sym2Y(relY * -45);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      if (!heroRaf) {
        heroRaf = requestAnimationFrame(processHeroParallax);
      }
    };

    const handleMouseLeave = () => {
      if (heroRaf) cancelAnimationFrame(heroRaf);
      heroRaf = null;
      cardRotX(0);
      cardRotY(0);
      cardX(0);
      cardY(0);
      if (orb1X && orb1Y) { orb1X(0); orb1Y(0); }
      if (orb2X && orb2Y) { orb2X(0); orb2Y(0); }
      if (gridX && gridY) { gridX(0); gridY(0); }
      if (particlesX && particlesY) { particlesX(0); particlesY(0); }
      if (sym1X && sym1Y) { sym1X(0); sym1Y(0); }
      if (sym2X && sym2Y) { sym2X(0); sym2Y(0); }
    };

    section.addEventListener('mousemove', handleMouseMove, { passive: true });
    section.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    return () => {
      if (heroRaf) cancelAnimationFrame(heroRaf);
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, []);

  // ─── 1. CINEMATIC STAGED ENTRANCE SEQUENCE + 5. HERO->FEATURES SCROLL TRANSITION ───
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) {
      if (stat1Ref.current) stat1Ref.current.textContent = '50,000+';
      if (stat2Ref.current) stat2Ref.current.textContent = '2.4 Million';
      if (stat3Ref.current) stat3Ref.current.textContent = '150,000+';
      if (stat4Ref.current) stat4Ref.current.textContent = '99.4%';
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Cinematic Staged Sequence:
      // Nav & Marquee -> Stats -> Heading -> Description -> CTA -> Quest Card
      const tl = gsap.timeline({
        defaults: { ease: MotionEases.powerOut },
      });

      // Ribbon / Marquee
      tl.fromTo(
        '.hero-top-ribbon',
        { y: -30, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65 },
        0.05
      )
        // Player status pills
        .fromTo(
          '.hero-tagline-pill',
          { y: 25, opacity: 0, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6 },
          0.15
        )
        // Character / word masked reveal for typography
        .fromTo(
          '.hero-mask-line',
          { yPercent: 115, opacity: 0, filter: 'blur(8px)' },
          { yPercent: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.12, duration: 0.85, ease: 'power4.out' },
          0.22
        )
        // Description
        .fromTo(
          '.hero-description',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          0.42
        )
        // CTA buttons scale from 0.92 -> 1
        .fromTo(
          '.hero-cta-group',
          { y: 20, opacity: 0, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: MotionEases.backOut },
          0.52
        )
        // Trust badges
        .fromTo(
          '.hero-trust-badge',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.45 },
          0.62
        )
        // Right Quest Card rises from y: 100 with rotateY: 8 -> 0
        .fromTo(
          '.hero-dashboard-panel',
          { y: 100, rotationY: 8, scale: 0.9, opacity: 0 },
          { y: 0, rotationY: 0, scale: 1, opacity: 1, duration: 0.95, ease: MotionEases.powerOut },
          0.35
        )
        // Floating chips & collectibles
        .fromTo(
          '.hero-floating-chip',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.1, duration: 0.6, ease: MotionEases.backOut },
          0.65
        )
        .fromTo(
          '.hero-collectible-item',
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.08, duration: 0.5, ease: MotionEases.backOut },
          0.72
        );

      // Micro-animations inside Dashboard Panel: Progress Bar
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { width: '0%' },
          { width: `${(questProgress / 3) * 100}%`, duration: 1.2, ease: 'power2.out', delay: 0.6 }
        );
      }

      // 4. Quest Card: Idle ↕ 4-8px floating & gentle breathing
      if (dashboardCardRef.current) {
        gsap.to(dashboardCardRef.current, {
          y: -7,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.1,
        });
      }

      // 5. TRIONN Scroll Philosophy: Hero -> Features transition synchronization
      // As the user scrolls down, hero card moves toward center, scales slightly,
      // background glow expands, hero heading moves upward into features
      if (heroContentRef.current && dashboardCardRef.current) {
        gsap.to(heroContentRef.current, {
          y: -50,
          opacity: 0.75,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom 40%',
            scrub: 0.6,
          },
        });
      }

      // Reversible Stats Section Animation
      const statsTl = gsap.timeline({
        scrollTrigger: {
          trigger: statsSectionRef.current,
          start: 'top 88%',
          toggleActions: ReversibleToggleActions,
        },
      });

      statsTl.fromTo(
        '.stats-divider-line',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, transformOrigin: 'center', duration: 0.75, ease: 'power2.out' }
      );

      statsTl.fromTo(
        '.stat-item',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: MotionEases.powerOut },
        '-=0.4'
      );

      // Reversible Numeric Counters
      if (stat1Ref.current) {
        createReversibleCounter(stat1Ref.current, 50000, {
          suffix: '+',
          duration: 1.6,
          startTrigger: 'top 88%',
        });
      }

      if (stat2Ref.current) {
        createReversibleCounter(stat2Ref.current, 2.4, {
          suffix: ' Million',
          decimals: 1,
          duration: 1.6,
          startTrigger: 'top 88%',
        });
      }

      if (stat3Ref.current) {
        createReversibleCounter(stat3Ref.current, 150000, {
          suffix: '+',
          duration: 1.6,
          startTrigger: 'top 88%',
        });
      }

      if (stat4Ref.current) {
        createReversibleCounter(stat4Ref.current, 99.4, {
          suffix: '%',
          decimals: 1,
          duration: 1.6,
          startTrigger: 'top 88%',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const currentActivity = liveActivities[currentActivityIndex];

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full pt-36 pb-20 px-6 bg-[#080411] overflow-hidden min-h-screen flex flex-col justify-center select-none"
    >
      {/* ── 2. Dynamic Ambient Glow Orbs with Parallax ── */}
      <div
        ref={orb1Ref}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full bg-radial from-[#360C9F]/45 via-[#340073]/20 to-transparent blur-[150px] pointer-events-none"
      />
      <div
        ref={orb2Ref}
        className="absolute top-16 left-[-10%] w-[650px] h-[650px] rounded-full bg-radial from-[#FFA28D]/22 via-[#7B2CBF]/15 to-transparent blur-[140px] pointer-events-none"
      />
      <div className="absolute bottom-10 right-[-8%] w-[700px] h-[700px] rounded-full bg-radial from-[#7B2CBF]/30 via-transparent to-transparent blur-[150px] pointer-events-none" />

      {/* Decorative Floating JLT Symbols with Mouse Parallax (0.30x) */}
      <div
        ref={symbol1Ref}
        className="absolute top-28 left-[8%] w-12 h-12 opacity-15 pointer-events-none z-0 hidden lg:block"
      >
        <img src="/jltcolor.svg" alt="" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_#FFA28D]" />
      </div>
      <div
        ref={symbol2Ref}
        className="absolute bottom-40 right-[10%] w-16 h-16 opacity-15 pointer-events-none z-0 hidden lg:block"
      >
        <img src="/jltcolor.svg" alt="" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_#360C9F]" />
      </div>

      {/* Futuristic Background Grid with Mask & Continuous Drift */}
      <div
        ref={gridRef}
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_15%,#000_80%,transparent_100%)] pointer-events-none animate-grid-drift"
      />

      {/* Continuous Floating Coin/XP Particles behind Hero Card */}
      <div
        ref={particleFieldRef}
        className="absolute top-1/3 right-[15%] w-72 h-72 pointer-events-none z-0 hidden lg:block"
      >
        <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-amber-400/40 blur-[1px] animate-sparkle" style={{ animationDuration: '3s' }} />
        <div className="absolute top-20 right-8 w-2 h-2 rounded-full bg-[#FFA28D]/50 blur-[1px] animate-sparkle" style={{ animationDelay: '0.8s', animationDuration: '2.5s' }} />
        <div className="absolute bottom-10 left-12 w-3.5 h-3.5 rounded-full bg-purple-400/40 blur-[1px] animate-sparkle" style={{ animationDelay: '1.4s', animationDuration: '3.2s' }} />
      </div>

      {/* ── TOP MARQUEE RIBBON (TRIONN INSP.) ── */}
      <div className="hero-top-ribbon w-full max-w-7xl mx-auto mb-8 relative z-10 overflow-hidden py-2 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-2xl">
        <div className="flex w-max animate-marquee gap-8 items-center text-[11px] font-gilroyMedium tracking-widest text-gray-400 uppercase">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-[#FFA28D]">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={heroContentRef} className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center">
          
          {/* ── LEFT COLUMN: High-Impact Typography & Interactive CTAs ── */}
          <div className="lg:col-span-7 flex flex-col items-start gap-8 text-left">
            
            {/* TRIONN-Style Status Pill */}
            <div className="hero-tagline-pill flex flex-wrap items-center gap-3">
              <div className="glass-pill px-4 py-2 inline-flex items-center gap-3 shadow-[0_0_25px_rgba(54,12,159,0.4)] border border-purple-500/30">
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
              <div className="glass-pill px-3.5 py-1.5 hidden sm:inline-flex items-center gap-2 border border-purple-500/30 bg-purple-900/25 text-xs transition-all duration-500">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-gray-300 font-gilroyRegular">
                  <strong className="text-white font-gilroyBold">{currentActivity.user}</strong> {currentActivity.action}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-gilroyBold text-[10px]">
                  {currentActivity.reward}
                </span>
              </div>
            </div>

            {/* TRIONN-Style Masked Statement Typography with Character/Word Reveals */}
            <div className="flex flex-col gap-1.5 overflow-hidden">
              <div className="overflow-hidden">
                <h1 className="hero-mask-line font-gilroyBold text-5xl sm:text-7xl lg:text-7xl text-white tracking-tight leading-[1.04]">
                  Play daily.
                </h1>
              </div>

              <div className="overflow-hidden">
                <h1 className="hero-mask-line font-gilroyBold text-5xl sm:text-7xl lg:text-7xl tracking-tight leading-[1.04]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] via-[#E280FF] to-[#8C52FF] drop-shadow-[0_0_40px_rgba(255,162,141,0.45)] animate-text-shimmer">
                    Earn real perks.
                  </span>
                </h1>
              </div>

              <div className="overflow-hidden">
                <h2 className="hero-mask-line font-gilroyBold text-4xl sm:text-6xl lg:text-6xl text-white/90 tracking-tight leading-[1.06]">
                  Rule the quest.
                </h2>
              </div>
            </div>

            <p className="hero-description font-gilroyRegular text-gray-300 text-lg sm:text-xl max-w-2xl leading-relaxed">
              No complex crypto jargon or boring grinds. Complete quick daily missions inside JaxMart, spin for rare passes, and build your reward streak with friends.
            </p>

            {/* 3. Magnetic CTAs with Independent Child Motion */}
            <div className="hero-cta-group flex flex-wrap items-center gap-4 w-full pt-1">
              <Link
                ref={startQuestBtnRef}
                href="/dashboard"
                id="hero-start-quest-btn"
                data-cursor="cta"
                data-cursor-text="START →"
                className="glass-btn gsap-magnetic-btn px-9 py-4.5 rounded-2xl font-gilroyBold text-white text-lg tracking-wide shadow-[0_0_40px_rgba(54,12,159,0.6)] flex items-center gap-3 group hover:shadow-[0_0_60px_rgba(255,162,141,0.5)] hover:scale-[1.025] active:scale-[0.98] transition-all duration-200"
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
                className={`relative gsap-magnetic-btn px-7 py-4.5 rounded-2xl font-gilroyMedium text-base transition-all duration-300 flex items-center gap-2.5 border ${
                  claimedBonus
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'glass-pill hover:bg-white/10 text-white border-white/15 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg'
                }`}
              >
                {claimedBonus ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>+150 Welcome Coins Claimed!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#FFA28D] animate-spin magnetic-icon" style={{ animationDuration: '5s' }} />
                    <span>Claim Demo +150 Coins</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-gray-400 font-gilroyRegular">
              <div className="hero-trust-badge flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FFA28D]" />
                <span>Free to Play Forever</span>
              </div>
              <div className="hero-trust-badge flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFA28D]" />
                <span>JaxMart Verified</span>
              </div>
              <div className="hero-trust-badge flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FFA28D]" />
                <span>Daily Leaderboard Prizes</span>
              </div>
            </div>

          </div>

          {/* ── 4. RIGHT COLUMN: Interactive 3D Quest Card & Orbiting Chips ── */}
          <div className="lg:col-span-5 relative flex justify-center items-center perspective-1000">
            
            {/* Background Glow Ring */}
            <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] opacity-30 blur-3xl animate-pulse" />

            {/* Top Floating Badge Chip */}
            <div className="hero-floating-chip absolute -top-5 right-4 z-20 glass-pill px-3.5 py-1.5 flex items-center gap-2 border border-purple-400/40 shadow-xl backdrop-blur-xl animate-float">
              <Compass className="w-4 h-4 text-[#00F0FF]" />
              <span className="font-gilroyBold text-xs text-white">Season 1 Active</span>
            </div>

            {/* Main Interactive Hero Panel */}
            <div
              ref={dashboardCardRef}
              data-cursor="card"
              data-cursor-text="QUEST 🎯"
              className="hero-dashboard-panel w-full max-w-md glass-panel p-6 sm:p-8 flex flex-col gap-6 relative z-10 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-all duration-300 hover:border-white/30 transform-style-preserve-3d"
            >
              
              {/* Card Header: Profile & Live Coin Counter */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/icon/mascot.webp"
                      alt="JLT Mascot"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
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
                <div className="glass-pill px-3.5 py-1.5 flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 relative shadow-[0_0_15px_rgba(251,191,36,0.25)]">
                  <img src="/icon/coin.webp" alt="Coin" width={20} height={20} className="w-5 h-5 object-contain animate-bounce" style={{ animationDuration: '2.5s' }} />
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
              <div className="daily-card-panel p-4 sm:p-5 flex flex-col gap-3.5 relative overflow-hidden border border-white/10 shadow-lg">
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
                    <span className={`font-gilroyBold transition-colors duration-300 ${questCompleted ? 'text-emerald-400' : 'text-white'}`}>
                      {questCompleted ? '🎉 COMPLETED (+300 Coins)' : `${questProgress} / 3 Done`}
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
                    <div
                      ref={progressBarRef}
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
                      className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-[#360C9F] to-[#7B2CBF] hover:from-[#4310C2] hover:to-[#8C34D9] text-white font-gilroyBold text-xs tracking-wider uppercase shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                <span className="font-gilroyMedium text-xs text-gray-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#FFA28D]" />
                  <span>Unlockable Loot Passes:</span>
                </span>
                <div className="flex items-center gap-2.5">
                  <div
                    data-cursor="reward"
                    data-cursor-text="MYTHIC"
                    className="hero-collectible-item group relative cursor-pointer"
                    title="Mythic Pass"
                  >
                    <img src="/card/collect-1.webp" alt="Pass 1" width={36} height={40} loading="lazy" decoding="async" className="w-9 h-9 object-contain transform group-hover:scale-125 transition-transform duration-200 drop-shadow-[0_0_8px_rgba(255,162,141,0.5)]" />
                  </div>
                  <div
                    data-cursor="reward"
                    data-cursor-text="RARE"
                    className="hero-collectible-item group relative cursor-pointer"
                    title="Rare Drop"
                  >
                    <img src="/card/collect-2.webp" alt="Pass 2" width={36} height={44} loading="lazy" decoding="async" className="w-9 h-9 object-contain transform group-hover:scale-125 transition-transform duration-200 drop-shadow-[0_0_8px_rgba(123,44,191,0.5)]" />
                  </div>
                  <div
                    data-cursor="reward"
                    data-cursor-text="GOLD"
                    className="hero-collectible-item group relative cursor-pointer"
                    title="Gold Pass"
                  >
                    <img src="/card/collect-3.webp" alt="Pass 3" width={36} height={43} loading="lazy" decoding="async" className="w-9 h-9 object-contain transform group-hover:scale-125 transition-transform duration-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  </div>
                </div>
              </div>

              {/* Floating Human Testimonial Card */}
              <div className="hero-floating-chip absolute -bottom-6 -left-6 glass-pill p-3.5 max-w-[270px] hidden sm:flex items-start gap-3 border border-white/20 shadow-2xl backdrop-blur-xl animate-float">
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
        <div ref={statsSectionRef} className="mt-20 pt-10 relative grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {/* Animated Top Divider */}
          <div className="stats-divider-line absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] to-transparent pointer-events-none" />

          <div className="stat-item flex flex-col items-center gap-1 group">
            <span
              ref={stat1Ref}
              className="font-gilroyBold text-3xl sm:text-5xl text-white tracking-tight group-hover:scale-105 transition-transform duration-200"
            >
              0+
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Active Quest Players</span>
          </div>

          <div className="stat-item flex flex-col items-center gap-1 group">
            <span
              ref={stat2Ref}
              className="font-gilroyBold text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] to-amber-300 tracking-tight group-hover:scale-105 transition-transform duration-200"
            >
              0 Million
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Daily Quests Cleared</span>
          </div>

          <div className="stat-item flex flex-col items-center gap-1 group">
            <span
              ref={stat3Ref}
              className="font-gilroyBold text-3xl sm:text-5xl text-white tracking-tight group-hover:scale-105 transition-transform duration-200"
            >
              0+
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Passes & Rewards Claimed</span>
          </div>

          <div className="stat-item flex flex-col items-center gap-1 group">
            <span
              ref={stat4Ref}
              className="font-gilroyBold text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#FFA28D] tracking-tight group-hover:scale-105 transition-transform duration-200"
            >
              0%
            </span>
            <span className="font-gilroyRegular text-xs sm:text-sm text-gray-400">Positive Player Feedback</span>
          </div>
        </div>

      </div>
    </section>
  );
};

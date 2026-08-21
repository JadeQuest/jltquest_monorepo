'use client';

import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import {
  gsap,
  ScrollTrigger,
  createHeaderReveal,
  createReversibleReveal,
  createParticleBurst,
  prefersReducedMotion,
  hasFineHoverPointer,
  ReversibleToggleActions,
  MotionEases,
} from '@/lib/animations';
import { SplitText } from './SplitText';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Zap, Trophy, Gift } from 'lucide-react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface StepItem {
  step: number;
  tag: string;
  title: string;
  badgeText: string;
  description: string;
  icon: string;
  iconAlt: string;
  accentColor: string;
  glowColor: string;
}

const steps: StepItem[] = [
  {
    step: 1,
    tag: '01 / ONBOARDING',
    title: 'Connect Wallet',
    badgeText: 'Instant & Gasless',
    description: 'Link your Web3 wallet or email in seconds to start your JLTQuest journey and secure your on-chain rewards.',
    icon: '/icon/connect wallet.svg',
    iconAlt: 'Connect Wallet',
    accentColor: '#FFA28D',
    glowColor: 'rgba(255, 162, 141, 0.4)',
  },
  {
    step: 2,
    tag: '02 / DAILY MISSIONS',
    title: 'Complete Quests',
    badgeText: '+300 GP Daily',
    description: 'Discover and finish fast daily missions & bounty tasks inside JaxMart to earn GP coins and XP multipliers.',
    icon: '/icon/complete quest.svg',
    iconAlt: 'Complete Quests',
    accentColor: '#8C52FF',
    glowColor: 'rgba(140, 82, 255, 0.4)',
  },
  {
    step: 3,
    tag: '03 / COLLECTIBLES',
    title: 'Collect Rares',
    badgeText: 'Mythic Loot Passes',
    description: 'Use your earned coins to spin the wheel, unlock rare seasonal passes, and collect exclusive NFT cards & avatars.',
    icon: '/icon/collector rate.svg',
    iconAlt: 'Collect Rares',
    accentColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
  },
  {
    step: 4,
    tag: '04 / GLOBAL ARENA',
    title: 'Climb & Win',
    badgeText: 'Weekly Pool Prizes',
    description: 'Rise through the seasonal leaderboards with your squad, rack up streak bonuses, and claim massive token prizes.',
    icon: '/icon/climb and win.svg',
    iconAlt: 'Climb & Win',
    accentColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.4)',
  },
];

export const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const laserBeadRef = useRef<HTMLDivElement>(null);
  const mobileLaserBeadRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const mobileLineFillRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  const handleParticleBurst = useCallback((el: HTMLElement) => {
    createParticleBurst(el, { count: 18, radius: 55 });
  }, []);

  const handleStepClick = useCallback((stepNumber: number, el?: HTMLElement | null) => {
    setActiveStep(stepNumber);
    if (el && !prefersReducedMotion()) {
      handleParticleBurst(el);
    }
  }, [handleParticleBurst]);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Reversible Divider Line
      gsap.fromTo(
        '.hiw-divider-line',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          transformOrigin: 'center',
          duration: 0.7,
          ease: 'power2.out',
          force3D: true,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: ReversibleToggleActions,
          },
        }
      );

      // Reversible Header Elements Reveal
      createHeaderReveal('.hiw-badge', '.hiw-title', '.hiw-desc', sectionRef.current!, {
        start: 'top 85%',
        toggleActions: ReversibleToggleActions,
      });

      // ── Smooth Journey Laser Progress Line (Step 1 -> 2 -> 3 -> 4) ──
      const lineTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current || sectionRef.current,
          start: 'top 80%',
          end: 'bottom 55%',
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;

            // Activate steps in sequence based on scroll depth
            if (progress >= 0.85) {
              setActiveStep(4);
            } else if (progress >= 0.55) {
              setActiveStep(3);
            } else if (progress >= 0.25) {
              setActiveStep(2);
            } else {
              setActiveStep(1);
            }

            // Move the desktop glowing laser bead in sync with progress
            if (laserBeadRef.current) {
              gsap.set(laserBeadRef.current, {
                left: `${progress * 100}%`,
                opacity: progress > 0.02 && progress < 0.99 ? 1 : progress >= 0.99 ? 0 : 0.4,
                force3D: true,
              });
            }

            // Move the mobile/tablet glowing laser bead in sync with progress
            if (mobileLaserBeadRef.current) {
              gsap.set(mobileLaserBeadRef.current, {
                top: `${progress * 100}%`,
                opacity: progress > 0.02 && progress < 0.99 ? 1 : progress >= 0.99 ? 0 : 0.4,
                force3D: true,
              });
            }
          },
        },
      });

      // Desktop horizontal line fill
      if (lineFillRef.current) {
        lineTl.fromTo(
          lineFillRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, ease: 'none', force3D: true, overwrite: 'auto' },
          0
        );
      }

      // Mobile / Tablet vertical line fill
      if (mobileLineFillRef.current) {
        lineTl.fromTo(
          mobileLineFillRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          { scaleY: 1, ease: 'none', force3D: true, overwrite: 'auto' },
          0
        );
      }

      // Step cards entrance reveals
      const stepElements = gsap.utils.toArray<HTMLElement>('.hiw-step-card');
      stepElements.forEach((step, i) => {
        createReversibleReveal(step, {
          trigger: step,
          start: 'top 88%',
          scale: 0.92,
          y: 28,
          duration: 0.65,
          delay: i * 0.08,
          ease: MotionEases.backOut,
          toggleActions: ReversibleToggleActions,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden select-none bg-transparent"
    >
      {/* Section Separator Line */}
      <div className="hiw-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[85%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#FFA28D] via-[#00F0FF] to-transparent pointer-events-none" />

      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[350px] sm:w-[550px] h-[350px] rounded-full bg-radial from-[#360C9F]/20 via-transparent to-transparent blur-[110px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[500px] rounded-full bg-radial from-[#FFA28D]/15 via-transparent to-transparent blur-[100px] sm:blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 sm:gap-14 md:gap-16 lg:gap-20 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
          <div className="hiw-badge glass-pill px-3.5 sm:px-5 py-1.5 sm:py-2 inline-flex items-center gap-2">
            <img
              src="/icon/coin.webp"
              alt="JLT Coin"
              width={20}
              height={20}
              loading="lazy"
              decoding="async"
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain animate-sparkle"
            />
            <span className="font-gilroyMedium text-[11px] sm:text-xs md:text-sm text-white/90 tracking-wider uppercase">
              Simple 4-Step Journey
            </span>
          </div>

          <h2 className="hiw-title font-gilroyBold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
            <SplitText scrollTrigger={false}>How It Works</SplitText>
          </h2>

          <div className="w-16 sm:w-20 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent rounded-full" />

          <p className="hiw-desc font-gilroyRegular text-gray-300 text-sm sm:text-base md:text-lg max-w-[560px] leading-relaxed px-2">
            Get started in minutes with zero setup friction. JLTQuest is designed to be rewarding and intuitive from your very first quest.
          </p>

          {/* Quick Mobile/Tablet Interactive Step Pills */}
          <div className="flex lg:hidden items-center justify-center gap-1.5 sm:gap-2.5 mt-2 flex-wrap">
            {steps.map((s) => {
              const isSelected = activeStep === s.step;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => handleStepClick(s.step)}
                  className={`px-3 py-1.5 rounded-full text-xs font-gilroyBold transition-all duration-300 flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#360C9F] border-[#FFA28D] text-white shadow-[0_0_15px_rgba(255,162,141,0.5)] scale-105'
                      : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white hover:border-white/25'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-[#FFA28D] text-black font-bold' : 'bg-white/10 text-gray-300'}`}>
                    {s.step}
                  </span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RESPONSIVE STEPS CONTAINER ── */}
        <div ref={containerRef} className="relative w-full">
          
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 1. DESKTOP LAYOUT (lg & above: Horizontal 4-Card Flow with Laser Rail) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:grid grid-cols-4 gap-6 relative">
            
            {/* Desktop Connector Track (Passes exactly through Node 1 center to Node 4 center at top-[72px]) */}
            <div className="absolute top-[72px] -translate-y-1/2 left-[calc(12.5%-9px)] right-[calc(12.5%-9px)] h-[3px] z-0 pointer-events-none">
              {/* Background Track Rail */}
              <div className="absolute inset-0 bg-white/10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.05)]" />

              {/* Glowing Active Gradient Laser Fill */}
              <div
                ref={lineFillRef}
                className="hiw-connector-line absolute inset-0 bg-gradient-to-r from-[#FFA28D] via-[#FF007F] via-[#7B2CBF] to-[#00F0FF] shadow-[0_0_20px_#FFA28D,0_0_35px_#00F0FF] origin-left rounded-full will-change-transform"
              />

              {/* Traveling Laser Energy Bead */}
              <div
                ref={laserBeadRef}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_#FFA28D,0_0_25px_#00F0FF] pointer-events-none will-change-transform z-10"
                style={{ left: '0%' }}
              />
            </div>

            {/* Desktop Step Cards */}
            {steps.map((item) => {
              const isActivated = activeStep >= item.step;
              const isCurrent = activeStep === item.step;

              return (
                <div
                  key={item.step}
                  data-cursor="reward"
                  data-cursor-text={`STEP ${item.step}`}
                  onMouseEnter={() => setActiveStep(item.step)}
                  onClick={(e) => handleStepClick(item.step, e.currentTarget)}
                  className={`hiw-step-card flex flex-col items-center gap-5 text-center group relative z-10 transition-all duration-400 cursor-pointer p-6 rounded-2xl border ${
                    isCurrent
                      ? 'bg-[#12072B]/80 border-[#FFA28D]/50 shadow-[0_15px_40px_rgba(54,12,159,0.5)] -translate-y-2'
                      : isActivated
                      ? 'bg-[#0E061F]/60 border-white/20 hover:border-white/40 shadow-lg'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* Step Pod Circle */}
                  <div className="relative flex items-center justify-center">
                    {/* Animated Glow Halo */}
                    <div
                      className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 pointer-events-none ${
                        isActivated ? 'opacity-80' : 'opacity-0'
                      }`}
                      style={{
                        background: `radial-gradient(circle, ${item.glowColor} 0%, transparent 70%)`,
                      }}
                    />

                    <div
                      className={`w-24 h-24 rounded-full bg-[#0E061F] border-2 flex items-center justify-center relative z-10 transition-all duration-400 ${
                        isActivated
                          ? 'border-[#FFA28D] shadow-[0_0_35px_rgba(255,162,141,0.65),inset_0_0_15px_rgba(255,162,141,0.3)] scale-105'
                          : 'border-white/15 shadow-[0_0_20px_rgba(54,12,159,0.35)] group-hover:border-white/30'
                      }`}
                    >
                      <img
                        src={item.icon}
                        alt={item.iconAlt}
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className={`w-12 h-12 object-contain transition-transform duration-300 ${
                          isCurrent ? 'scale-115 rotate-3' : 'group-hover:scale-110'
                        }`}
                      />
                    </div>

                    {/* Step number badge */}
                    <div
                      className={`absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,162,141,0.6)] z-20 transition-all duration-400 ${
                        isActivated
                          ? 'bg-gradient-to-br from-[#FFA28D] to-[#FF007F] scale-110 text-white font-gilroyBold'
                          : 'bg-gradient-to-br from-[#1E085A] to-[#360C9F] border border-white/20 text-gray-300 font-gilroyMedium'
                      }`}
                    >
                      <span className="text-xs">{item.step}</span>
                    </div>
                  </div>

                  {/* Badge Text */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-gilroyBold tracking-wider uppercase bg-white/5 border border-white/10 text-gray-300">
                    {item.badgeText}
                  </span>

                  {/* Content */}
                  <div className="flex flex-col gap-2">
                    <h3
                      className={`font-gilroyBold text-lg tracking-wide transition-colors duration-200 ${
                        isActivated ? 'text-[#FFA28D]' : 'text-white group-hover:text-[#FFA28D]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="font-gilroyRegular text-gray-300 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 2. MOBILE & TABLET LAYOUT (< lg: Vertical Connected Timeline Flow) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:hidden flex flex-col gap-4 sm:gap-6 relative">
            
            {/* Vertical Laser Connector Track (Starts inside Icon 1 center to Icon 4 center) */}
            <div className="absolute top-[44px] sm:top-[56px] bottom-[44px] sm:bottom-[56px] left-[44px] sm:left-[56px] -translate-x-1/2 w-[3px] z-0 pointer-events-none">
              {/* Background Track Rail */}
              <div className="absolute inset-0 bg-white/10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.05)]" />

              {/* Glowing Active Gradient Laser Fill */}
              <div
                ref={mobileLineFillRef}
                className="hiw-connector-line-vertical absolute inset-0 bg-gradient-to-b from-[#FFA28D] via-[#FF007F] via-[#7B2CBF] to-[#00F0FF] shadow-[0_0_20px_#FFA28D,0_0_35px_#00F0FF] origin-top rounded-full will-change-transform"
              />

              {/* Traveling Vertical Laser Energy Bead */}
              <div
                ref={mobileLaserBeadRef}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_15px_#FFA28D,0_0_25px_#00F0FF] pointer-events-none will-change-transform z-10"
                style={{ top: '0%' }}
              />
            </div>

            {/* Mobile & Tablet Step Cards */}
            {steps.map((item) => {
              const isActivated = activeStep >= item.step;
              const isCurrent = activeStep === item.step;

              return (
                <div
                  key={item.step}
                  onClick={(e) => handleStepClick(item.step, e.currentTarget)}
                  className={`hiw-step-card flex items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative z-10 ${
                    isCurrent
                      ? 'bg-[#150933]/95 border-[#FFA28D]/60 shadow-[0_10px_35px_rgba(54,12,159,0.7)] scale-[1.01]'
                      : isActivated
                      ? 'bg-[#0E061F]/90 border-white/20 shadow-md'
                      : 'bg-[#0A0417]/70 border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* Active background subtle glow */}
                  {isActivated && (
                    <div
                      className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-30"
                      style={{ background: item.accentColor }}
                    />
                  )}

                  {/* Left Step Node with Icon and Number Badge */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    {/* Animated Halo for Active Step */}
                    <div
                      className={`absolute -inset-2 rounded-full blur-lg transition-opacity duration-500 pointer-events-none ${
                        isActivated ? 'opacity-80' : 'opacity-0'
                      }`}
                      style={{
                        background: `radial-gradient(circle, ${item.glowColor} 0%, transparent 70%)`,
                      }}
                    />

                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0E061F] border flex items-center justify-center relative z-10 transition-all duration-300 ${
                        isActivated
                          ? 'border-[#FFA28D] shadow-[0_0_25px_rgba(255,162,141,0.6)] scale-105'
                          : 'border-white/15 shadow-md'
                      }`}
                    >
                      <img
                        src={item.icon}
                        alt={item.iconAlt}
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                        className={`w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-300 ${
                          isCurrent ? 'scale-110' : ''
                        }`}
                      />
                    </div>

                    {/* Step Number Badge */}
                    <div
                      className={`absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-gilroyBold text-[11px] sm:text-xs z-20 shadow-md transition-all duration-300 ${
                        isActivated
                          ? 'bg-gradient-to-br from-[#FFA28D] to-[#FF007F] text-white shadow-[0_0_10px_rgba(255,162,141,0.6)]'
                          : 'bg-white/15 text-gray-300 border border-white/20'
                      }`}
                    >
                      {item.step}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1 relative z-10">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-gilroyBold uppercase tracking-wider text-gray-400">
                        {item.tag}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-gilroyBold shrink-0">
                        ✦ {item.badgeText}
                      </span>
                    </div>

                    <h3
                      className={`font-gilroyBold text-base sm:text-xl transition-colors duration-200 ${
                        isActivated ? 'text-[#FFA28D]' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p className="font-gilroyRegular text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Helper Info Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-gilroyBold text-white text-xs sm:text-sm">
                Zero Gas Fees & Instant Play
              </span>
              <span className="font-gilroyRegular text-gray-400 text-[11px] sm:text-xs">
                All daily missions and streak bonuses are verified off-chain with optional on-chain minting.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#hero"
              className="px-4 py-2 rounded-xl text-xs font-gilroyBold text-white bg-gradient-to-r from-[#360C9F] to-[#7B2CBF] hover:from-[#4310C2] hover:to-[#8C34D9] transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

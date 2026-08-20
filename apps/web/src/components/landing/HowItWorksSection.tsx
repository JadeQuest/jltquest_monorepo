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

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface StepProps {
  step: number;
  title: string;
  description: string;
  icon: string;
  iconAlt: string;
  activeStep: number;
  onParticleBurst?: (el: HTMLElement) => void;
  onHoverStep?: (step: number) => void;
}

const Step: React.FC<StepProps> = React.memo(
  ({ step, title, description, icon, iconAlt, activeStep, onParticleBurst, onHoverStep }) => {
    const stepCircleRef = useRef<HTMLDivElement>(null);
    const isActivated = activeStep >= step;
    const isCurrent = activeStep === step;

    const handleMouseEnter = () => {
      onHoverStep?.(step);
      if (stepCircleRef.current && hasFineHoverPointer() && !prefersReducedMotion()) {
        createParticleBurst(stepCircleRef.current, { count: 12, radius: 45 });
      }
    };

    return (
      <div
        data-cursor="reward"
        data-cursor-text={`STEP ${step}`}
        onMouseEnter={handleMouseEnter}
        className={`hiw-step flex flex-col items-center gap-5 text-center group relative z-10 transition-all duration-500 cursor-pointer ${
          isCurrent ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Step circle with active glow and pulse */}
        <div ref={stepCircleRef} className="relative flex items-center justify-center">
          {/* Animated Glow Halo */}
          <div
            className={`absolute -inset-2 rounded-full blur-xl transition-opacity duration-500 pointer-events-none ${
              isActivated ? 'opacity-70 bg-gradient-to-tr from-[#FFA28D] via-[#7B2CBF] to-[#00F0FF]' : 'opacity-0'
            }`}
          />

          <div
            className={`w-24 h-24 rounded-full bg-[#0E061F] border-2 flex items-center justify-center relative z-10 transition-all duration-500 ${
              isActivated
                ? 'border-[#FFA28D] shadow-[0_0_35px_rgba(255,162,141,0.65),inset_0_0_15px_rgba(255,162,141,0.3)] scale-105'
                : 'border-white/15 shadow-[0_0_20px_rgba(54,12,159,0.35)] group-hover:border-white/30'
            }`}
          >
            <img
              src={icon}
              alt={iconAlt}
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
            className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,162,141,0.6)] z-20 transition-all duration-500 ${
              isActivated
                ? 'bg-gradient-to-br from-[#FFA28D] to-[#FF007F] scale-110 text-white font-gilroyBold'
                : 'bg-gradient-to-br from-[#1E085A] to-[#360C9F] border border-white/20 text-gray-300 font-gilroyMedium'
            }`}
          >
            <span className="text-xs">{step}</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2 max-w-[220px]">
          <h4
            className={`font-gilroyBold text-lg tracking-wide transition-colors duration-200 ${
              isActivated ? 'text-[#FFA28D]' : 'text-white group-hover:text-[#FFA28D]'
            }`}
          >
            {title}
          </h4>
          <p className="font-gilroyRegular text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    );
  }
);

const steps = [
  {
    step: 1,
    title: 'Connect Wallet',
    description: 'Link your wallet to start your JLTQuest journey and secure your rewards.',
    icon: '/icon/connect wallet.svg',
    iconAlt: 'Connect Wallet',
  },
  {
    step: 2,
    title: 'Complete Quests',
    description: 'Discover and finish daily quests inside JaxMart to earn JLT coins.',
    icon: '/icon/complete quest.svg',
    iconAlt: 'Complete Quests',
  },
  {
    step: 3,
    title: 'Collect Rares',
    description: 'Use your coins to spin, collect, and upgrade rare passes and NFTs.',
    icon: '/icon/collector rate.svg',
    iconAlt: 'Collect Rares',
  },
  {
    step: 4,
    title: 'Climb & Win',
    description: 'Hit the leaderboard, rack up multipliers, and claim seasonal prizes.',
    icon: '/icon/climb and win.svg',
    iconAlt: 'Climb & Win',
  },
];

export const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const laserBeadRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  const handleParticleBurst = useCallback((el: HTMLElement) => {
    createParticleBurst(el, { count: 20, radius: 65 });
  }, []);

  const handleHoverStep = useCallback((step: number) => {
    setActiveStep((prev) => Math.max(prev, step));
  }, []);

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
      // Triggers as section scrolls into the center of the viewport
      const lineTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current || sectionRef.current,
          start: 'top 78%',
          end: 'center 45%',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;

            // Activate steps cleanly in sequence
            if (progress >= 0.95) {
              setActiveStep(4);
            } else if (progress >= 0.65) {
              setActiveStep(3);
            } else if (progress >= 0.32) {
              setActiveStep(2);
            } else {
              setActiveStep(1);
            }

            // Move the glowing laser bead in sync with the progress line
            if (laserBeadRef.current) {
              gsap.set(laserBeadRef.current, {
                left: `${progress * 100}%`,
                opacity: progress > 0.02 && progress < 0.99 ? 1 : progress >= 0.99 ? 0 : 0.4,
                force3D: true,
              });
            }
          },
        },
      });

      // Desktop line fill from scaleX: 0 to scaleX: 1
      lineTl.fromTo(
        lineFillRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, ease: 'none', force3D: true, overwrite: 'auto' }
      );

      // Mobile vertical line fill
      lineTl.fromTo(
        '.hiw-connector-line-vertical',
        { scaleY: 0, transformOrigin: 'top center' },
        { scaleY: 1, ease: 'none', force3D: true, overwrite: 'auto' },
        0
      );

      // Step entrance reveals
      const stepElements = gsap.utils.toArray<HTMLElement>('.hiw-step');
      stepElements.forEach((step, i) => {
        createReversibleReveal(step, {
          trigger: step,
          start: 'top 86%',
          scale: 0.88,
          y: 24,
          duration: 0.6,
          delay: i * 0.08,
          ease: MotionEases.backOut,
          toggleActions: ReversibleToggleActions,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative w-full py-24 sm:py-32 px-6 overflow-hidden select-none bg-transparent">
      {/* Section Separator Line */}
      <div className="hiw-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[75%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#FFA28D] via-[#00F0FF] to-transparent pointer-events-none" />

      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-radial from-[#360C9F]/20 via-transparent to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full bg-radial from-[#FFA28D]/15 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 sm:gap-20 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="hiw-badge glass-pill px-5 py-2 inline-flex items-center gap-2">
            <img src="/icon/coin.webp" alt="JLT Coin" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain animate-sparkle" />
            <span className="font-gilroyMedium text-sm text-white/90 tracking-wider uppercase">
              Simple Steps
            </span>
          </div>

          <h2 className="hiw-title font-gilroyBold text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            <SplitText scrollTrigger={false}>How It Works</SplitText>
          </h2>

          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent rounded-full" />

          <p className="hiw-desc font-gilroyRegular text-gray-400 text-base sm:text-lg max-w-[480px] leading-relaxed">
            Get started in minutes. JLTQuest is designed to be fun and intuitive from day one.
          </p>
        </div>

        {/* Steps with animated connector track */}
        <div ref={containerRef} className="hiw-steps-container relative grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6">
          
          {/* ── DESKTOP CONNECTOR TRACK (Spanning from Node 1 Center to Node 4 Center) ── */}
          <div className="hidden md:block absolute top-[48px] -translate-y-1/2 left-[12.5%] right-[12.5%] h-[3px] z-0 pointer-events-none">
            {/* Ambient Background Track Rail */}
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

          {/* ── MOBILE CONNECTOR TRACK (Vertical) ── */}
          <div className="md:hidden absolute top-[48px] bottom-[48px] left-1/2 -translate-x-1/2 w-[3px] z-0 pointer-events-none">
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            <div className="hiw-connector-line-vertical absolute inset-0 bg-gradient-to-b from-[#FFA28D] via-[#7B2CBF] to-[#00F0FF] shadow-[0_0_15px_#FFA28D] origin-top rounded-full will-change-transform" />
          </div>

          {/* Step Cards */}
          {steps.map((step) => (
            <Step
              key={step.step}
              {...step}
              activeStep={activeStep}
              onParticleBurst={handleParticleBurst}
              onHoverStep={handleHoverStep}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

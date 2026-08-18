'use client';

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import {
  gsap,
  ScrollTrigger,
  createHeaderReveal,
  createReversibleReveal,
  createParticleBurst,
  prefersReducedMotion,
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
}

const Step: React.FC<StepProps> = React.memo(({ step, title, description, icon, iconAlt, activeStep, onParticleBurst }) => {
  const stepCircleRef = useRef<HTMLDivElement>(null);
  const isActivated = activeStep >= step;
  const isCurrent = activeStep === step;

  useEffect(() => {
    if (step === 3 && isCurrent && stepCircleRef.current) {
      onParticleBurst?.(stepCircleRef.current);
    }
  }, [step, isCurrent, onParticleBurst]);

  return (
    <div
      data-cursor="reward"
      data-cursor-text={`STEP ${step}`}
      className={`hiw-step flex flex-col items-center gap-5 text-center group relative z-10 transition-transform duration-300 ${
        isCurrent ? 'scale-105' : 'scale-100'
      }`}
    >
      {/* Step circle with active glow and pulse */}
      <div ref={stepCircleRef} className="relative flex items-center justify-center">
        <div
          className={`w-24 h-24 rounded-full bg-[#0E061F] border flex items-center justify-center transition-all duration-500 ${
            isActivated
              ? 'border-[#FFA28D] shadow-[0_0_35px_rgba(255,162,141,0.6)] scale-105'
              : 'border-white/15 shadow-[0_0_25px_rgba(54,12,159,0.35)]'
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
              isCurrent ? 'scale-115 rotate-3' : 'group-hover:scale-105'
            }`}
          />
        </div>

        {/* Step number badge */}
        <div
          className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(255,162,141,0.5)] z-20 transition-all duration-300 ${
            isActivated
              ? 'bg-gradient-to-br from-[#FFA28D] to-[#FF007F] scale-110'
              : 'bg-gradient-to-br from-[#360C9F] to-[#7B2CBF]'
          }`}
        >
          <span className="font-gilroyBold text-white text-xs">{step}</span>
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
});

const steps: Omit<StepProps, 'activeStep'>[] = [
  {
    step: 1,
    title: 'Connect Wallet',
    description: 'Link your wallet to start your JLTQuest journey and secure your rewards.',
    icon: '/Rectangle 11989.svg',
    iconAlt: 'Connect Wallet',
  },
  {
    step: 2,
    title: 'Complete Quests',
    description: 'Discover and finish daily quests inside JaxMart to earn JLT coins.',
    icon: '/Discover.svg',
    iconAlt: 'Discover Quests',
  },
  {
    step: 3,
    title: 'Collect Rares',
    description: 'Use your coins to spin, collect, and upgrade rare passes and NFTs.',
    icon: '/icon/spin.webp',
    iconAlt: 'Collect Rares',
  },
  {
    step: 4,
    title: 'Climb & Win',
    description: 'Hit the leaderboard, rack up multipliers, and claim seasonal prizes.',
    icon: '/LeaderBoard.svg',
    iconAlt: 'Leaderboard',
  },
];

export const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  const handleParticleBurst = React.useCallback((el: HTMLElement) => {
    createParticleBurst(el, { count: 22, radius: 75 });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;

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

      // 10. Scrubbed Journey Progress Line with Node Milestones (Step 1 -> 2 -> 3 -> 4)
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 0.4,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress < 0.25) setActiveStep(1);
          else if (progress < 0.55) setActiveStep(2);
          else if (progress < 0.82) setActiveStep(3);
          else setActiveStep(4);
        },
      });

      gsap.fromTo(
        '.hiw-connector-line',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 60%',
            scrub: 0.4,
          },
        }
      );

      // Reversible Step Reveals
      const stepElements = gsap.utils.toArray<HTMLElement>('.hiw-step');
      stepElements.forEach((step, i) => {
        createReversibleReveal(step, {
          trigger: step,
          start: 'top 86%',
          scale: 0.85,
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
    <section id="how-it-works" ref={sectionRef} className="relative w-full py-24 px-6 overflow-hidden select-none bg-[#080411]">
      {/* Section Separator Line */}
      <div className="hiw-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[75%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#FFA28D] via-[#00F0FF] to-transparent pointer-events-none" />

      {/* Background blur */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full bg-radial from-[#FFA28D]/15 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
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

          <p className="hiw-desc font-gilroyRegular text-gray-400 text-lg max-w-[480px] leading-relaxed">
            Get started in minutes. JLTQuest is designed to be fun and intuitive from day one.
          </p>
        </div>

        {/* Steps with animated connector track */}
        <div ref={containerRef} className="hiw-steps-container relative grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
          {/* Desktop Connector Track & Animated Line */}
          <div className="hidden md:block absolute top-[48px] -translate-y-1/2 left-[12.5%] right-[12.5%] h-[2px] z-0 pointer-events-none">
            {/* Track Background */}
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            {/* Active Animated Gradient Fill */}
            <div className="hiw-connector-line absolute inset-0 bg-gradient-to-r from-[#FFA28D] via-[#7B2CBF] via-[#00F0FF] to-[#FF007F] shadow-[0_0_15px_rgba(255,162,141,0.8)] origin-left rounded-full" />
          </div>

          {/* Mobile Connector Track (Vertical) */}
          <div className="md:hidden absolute top-[48px] bottom-[48px] left-1/2 -translate-x-1/2 w-[2px] z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFA28D] via-[#7B2CBF] to-[#00F0FF] opacity-35 rounded-full" />
          </div>

          {steps.map((step) => (
            <Step
              key={step.step}
              {...step}
              activeStep={activeStep}
              onParticleBurst={handleParticleBurst}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

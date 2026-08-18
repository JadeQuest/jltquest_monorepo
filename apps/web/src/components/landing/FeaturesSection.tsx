'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import {
  gsap,
  createHeaderReveal,
  createCardTiltEffect,
  createCardLightBeamEffect,
  prefersReducedMotion,
  isTouchDevice,
  ReversibleToggleActions,
  MotionEases,
} from '@/lib/animations';
import { SplitText } from './SplitText';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface FeatureCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = React.memo(({ icon, iconAlt, title, description, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const cleanupTilt = createCardTiltEffect(card, { maxRotation: 4, translateY: -6 });
    const cleanupLightBeam = createCardLightBeamEffect(card);

    return () => {
      cleanupTilt();
      cleanupLightBeam();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      data-cursor="card"
      data-cursor-text="EXPLORE"
      className="feature-card web3-glass-card glass-panel gsap-tilt-card p-7 flex flex-col gap-5 group cursor-default transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_20px_45px_rgba(54,12,159,0.35)] perspective-1000 will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Icon with interactive rotate + scale */}
      <div className="w-16 h-16 rounded-2xl glass-btn flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-[0_0_20px_rgba(54,12,159,0.4)] group-hover:shadow-[0_0_30px_rgba(255,162,141,0.5)]">
        <img src={icon} alt={iconAlt} width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 object-contain" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2 relative z-10">
        <h3 className="font-gilroyBold text-white text-xl tracking-wide group-hover:text-[#FFA28D] transition-colors duration-200">
          {title}
        </h3>
        <p className="font-gilroyRegular text-gray-400 text-base leading-relaxed group-hover:-translate-y-0.5 transition-transform duration-200">
          {description}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className="mt-auto h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,162,141,0.8)]" />
    </div>
  );
});

const features = [
  {
    icon: '/Discover.svg',
    iconAlt: 'Discover Quests',
    title: 'Discover Quests',
    description: 'Explore daily and weekly quests tailored to your level. Complete missions to earn coins and rare rewards.',
  },
  {
    icon: '/icon/spin.webp',
    iconAlt: 'Spin to Win',
    title: 'Spin to Win',
    description: 'Try your luck with the daily spin wheel. Land on rare passes, coin multipliers, and exclusive loot.',
  },
  {
    icon: '/Push Pass.svg',
    iconAlt: 'Push Pass',
    title: 'Push Pass',
    description: 'Unlock the premium Push Pass for exclusive quests, boosted coin earnings, and rare collectible drops.',
  },
  {
    icon: '/InviteSqaud.svg',
    iconAlt: 'Invite Squad',
    title: 'Invite Squad',
    description: 'Bring your crew into JLTQuest. Earn bonus coins for every friend you invite to the ecosystem.',
  },
  {
    icon: '/LeaderBoard.svg',
    iconAlt: 'Leaderboard',
    title: 'Leaderboards',
    description: 'Compete globally and rise to the top. Top players earn exclusive rewards and recognition each season.',
  },
  {
    icon: '/icon/flame.webp',
    iconAlt: 'Daily Streak',
    title: 'Daily Streaks',
    description: 'Log in every day to build your streak. The longer the streak, the bigger the rewards — stay consistent.',
  },
];

export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const midgroundRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Reversible Divider Line Expansion
      gsap.fromTo(
        '.features-divider-line',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          transformOrigin: 'center',
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 92%',
            toggleActions: ReversibleToggleActions,
          },
        }
      );

      // Expanding purple accent line beneath heading
      gsap.fromTo(
        '.features-accent-line',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          transformOrigin: 'center',
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: ReversibleToggleActions,
          },
        }
      );

      // Reversible Section Header Reveal
      createHeaderReveal('.features-badge', '.features-title', '.features-desc', sectionRef.current!, {
        start: 'top 85%',
        toggleActions: ReversibleToggleActions,
      });

      // 6. Directional Reversible Stagger for Feature Cards:
      // Card 0: from left (x: -50)
      // Card 1: from right (x: 50)
      // Card 2: from top (y: -40)
      // Card 3: from bottom (y: 50)
      // Card 4: from left (x: -50)
      // Card 5: from right (x: 50)
      const cards = gsap.utils.toArray<HTMLElement>('.feature-card');
      const directions = [
        { x: -50, y: 20, rot: -2 },
        { x: 50, y: 20, rot: 2 },
        { x: 0, y: -40, rot: 0 },
        { x: 0, y: 50, rot: 0 },
        { x: -50, y: 20, rot: -2 },
        { x: 50, y: 20, rot: 2 },
      ];

      cards.forEach((card, i) => {
        const dir = directions[i] || { x: 0, y: 30, rot: 0 };
        gsap.fromTo(
          card,
          {
            x: dir.x,
            y: dir.y,
            rotation: dir.rot,
            scale: 0.92,
            opacity: 0,
            visibility: 'hidden',
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            visibility: 'visible',
            duration: 0.65,
            delay: (i % 3) * 0.1,
            ease: MotionEases.powerOut,
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: ReversibleToggleActions,
            },
          }
        );
      });

      // 9. Parallax "Quest World" multi-speed background layers (0.45x)
      if (midgroundRef.current) {
        gsap.to(midgroundRef.current, {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative w-full py-24 px-6 bg-[#080411] overflow-hidden select-none">
      {/* Section Separator Line */}
      <div className="features-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[75%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] to-transparent pointer-events-none" />

      {/* 9. "Quest World" Midground Parallax Elements (0.45x) */}
      <div ref={midgroundRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-[5%] w-32 h-32 rounded-full bg-radial from-[#FFA28D]/8 to-transparent blur-2xl" />
        <div className="absolute bottom-1/3 right-[8%] w-48 h-48 rounded-full bg-radial from-[#360C9F]/20 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 opacity-5">
          <img src="/jltcolor.svg" alt="" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_#FFA28D]" />
        </div>
      </div>

      {/* Background blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-radial from-[#360C9F]/20 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="features-badge glass-pill px-5 py-2 inline-flex items-center gap-2">
            <img src="/jlt.svg" alt="JLT" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
            <span className="font-gilroyMedium text-sm text-white/90 tracking-wider uppercase">
              Everything You Need
            </span>
          </div>

          <h2 className="features-title font-gilroyBold text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            <SplitText scrollTrigger={false}>Built for Quest Champions</SplitText>
          </h2>

          {/* Thin purple accent line that grows width: 0 -> 100% */}
          <div className="features-accent-line w-24 h-[2px] bg-gradient-to-r from-transparent via-[#FFA28D] to-transparent rounded-full" />

          <p className="features-desc font-gilroyRegular text-gray-400 text-lg max-w-[560px] leading-relaxed">
            JLTQuest packs a full suite of earning tools, collectibles, and social mechanics — all free to play.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="feature-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} index={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

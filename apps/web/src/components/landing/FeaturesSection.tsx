'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import {
  gsap,
  createHeaderReveal,
  createCardTiltEffect,
  createReversibleReveal,
  prefersReducedMotion,
  ReversibleToggleActions,
} from '@/lib/animations';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface FeatureCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = React.memo(({ icon, iconAlt, title, description }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    return createCardTiltEffect(card, { maxRotation: 3, translateY: -5 });
  }, []);

  return (
    <div
      ref={cardRef}
      className="feature-card glass-panel gsap-tilt-card p-7 flex flex-col gap-5 group cursor-default transition-colors duration-300 hover:border-purple-400/40 hover:shadow-[0_15px_35px_rgba(54,12,159,0.3)] perspective-1000 will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl glass-btn flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
        <img src={icon} alt={iconAlt} width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 object-contain" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h3 className="font-gilroyBold text-white text-xl tracking-wide group-hover:text-[#FFA28D] transition-colors duration-200">{title}</h3>
        <p className="font-gilroyRegular text-gray-400 text-base leading-relaxed">{description}</p>
      </div>

      {/* Bottom accent line */}
      <div className="mt-auto h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#360C9F] to-[#FFA28D] rounded-full transition-all duration-500" />
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
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 92%',
            toggleActions: ReversibleToggleActions,
          },
        }
      );

      // Reversible Section Header Reveal
      createHeaderReveal('.features-badge', '.features-title', '.features-desc', sectionRef.current!, {
        start: 'top 85%',
        toggleActions: ReversibleToggleActions,
      });

      // Directional Reversible Stagger for Feature Cards
      const cards = gsap.utils.toArray<HTMLElement>('.feature-card');
      cards.forEach((card, i) => {
        const xOffset = i % 3 === 0 ? -25 : i % 3 === 2 ? 25 : 0;

        createReversibleReveal(card, {
          trigger: card,
          start: 'top 88%',
          x: xOffset,
          y: 30,
          scale: 0.96,
          duration: 0.6,
          toggleActions: ReversibleToggleActions,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative w-full py-24 px-6 bg-[#080411] overflow-hidden">
      {/* Section Separator Line */}
      <div className="features-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[75%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] to-transparent pointer-events-none" />

      {/* Background blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-radial from-[#360C9F]/20 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="features-badge glass-pill px-5 py-2 inline-flex items-center gap-2">
            <img src="/jlt.svg" alt="JLT" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
            <span className="font-gilroyMedium text-sm text-white/90 tracking-wider uppercase">Everything You Need</span>
          </div>
          <h2 className="features-title font-gilroyBold text-5xl text-white tracking-tight leading-tight">
            Built for Quest Champions
          </h2>
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

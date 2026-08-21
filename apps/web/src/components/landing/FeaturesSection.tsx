'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  gsap,
  ScrollTrigger,
  createHeaderReveal,
  createCardTiltEffect,
  createCardLightBeamEffect,
  prefersReducedMotion,
  ReversibleToggleActions,
} from '@/lib/animations';
import { SplitText } from './SplitText';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface FeatureProject {
  id: string;
  tag: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  bannerMotto: string;
  ctaText: string;
  href: string;
  accentColor: string;
  gradientBg: string;
  glowColor: string;
  icon: string;
  image: string;
  badgeImg?: string;
  extraChip?: string;
  statsValue?: string;
  statsLabel?: string;
}

const FEATURE_PROJECTS: FeatureProject[] = [
  {
    id: 'quests',
    tag: '01 / QUEST ENGINE',
    category: 'Daily Quests & Missions',
    title: 'Discover Quests',
    subtitle: 'Daily Missions · Bounty Tasks · XP Progression',
    description: 'Explore daily and weekly missions tailored to your rank. Complete interactive challenges across the JaxMart ecosystem to earn GP, level multipliers, and rare mystery crates.',
    bannerMotto: 'Discover & Conquer',
    ctaText: 'EXPLORE QUESTS',
    href: '/dashboard/quests',
    accentColor: '#FFA28D',
    gradientBg: 'from-[#190638] via-[#360C9F]/40 to-[#080411]',
    glowColor: 'rgba(255, 162, 141, 0.45)',
    icon: '/Discover.svg',
    image: '/showcase/quests.jpg',
    badgeImg: '/jltcolor.svg',
    extraChip: '+500 GP Quests',
    statsValue: '2.4M+',
    statsLabel: 'Quests Cleared',
  },
  {
    id: 'spin',
    tag: '02 / FORTUNE WHEEL',
    category: 'Daily Spin & Win',
    title: 'Spin to Win',
    subtitle: '10× Multipliers · Pass Drops · Instant GP',
    description: 'Try your luck every 24 hours on the high-roller fortune wheel. Land on exclusive Push Pass drops, huge GP multipliers, and rare mystery crates with zero gas required.',
    bannerMotto: 'Spin to Multiply',
    ctaText: 'TRY DAILY SPIN',
    href: '/dashboard',
    accentColor: '#00F0FF',
    gradientBg: 'from-[#042838] via-[#0E3B43]/50 to-[#080411]',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    icon: '/icon/spin.webp',
    image: '/showcase/spin.jpg',
    badgeImg: '/icon/spinIcon.webp',
    extraChip: '10× Jackpot',
    statsValue: '150K+',
    statsLabel: 'Lucky Drops',
  },
  {
    id: 'rare-pass',
    tag: '03 / SEASON PROGRESSION',
    category: 'Season 01: Cosmic Origins',
    title: 'Cosmic Rare Pass',
    subtitle: '50 Tiers · 3D Avatars · Mythical Cards',
    description: 'Level up through 50 tiers of celestial loot in Season 01: Cosmic Origins. Complete daily missions and fortune wheel spins to unlock the Throne of Creation mythical card, 3D avatars, and massive GP pools.',
    bannerMotto: 'Cosmic Origins Pass',
    ctaText: 'EXPLORE RARE PASS',
    href: '/dashboard/rare-pass',
    accentColor: '#E280FF',
    gradientBg: 'from-[#2F064C] via-[#7B2CBF]/40 to-[#080411]',
    glowColor: 'rgba(226, 128, 255, 0.45)',
    icon: '/Push Pass.svg',
    image: '/showcase/push-pass.jpg',
    badgeImg: '/card/pass/s1/premium.webp',
    extraChip: 'Season 01 Live',
    statsValue: '50 Tiers',
    statsLabel: 'Mythic Rewards',
  },
  {
    id: 'squad',
    tag: '04 / SOCIAL EARNING',
    category: 'Squads & Invites',
    title: 'Invite Squad',
    subtitle: '+100 GP Referral · +150 GP Welcome · Squad Milestones',
    description: 'Assemble your crew inside JLTQuest. Earn +100 GP for every friend who joins with your referral link, give them +150 GP instant welcome bonus, and unlock up to +1,000 GP at milestone squad levels.',
    bannerMotto: 'Assemble Your Crew',
    ctaText: 'INVITE SQUAD',
    href: '/dashboard/invites',
    accentColor: '#FF6B6B',
    gradientBg: 'from-[#3A0A28] via-[#360C9F]/40 to-[#080411]',
    glowColor: 'rgba(255, 107, 107, 0.45)',
    icon: '/InviteSqaud.svg',
    image: '/showcase/squad.jpg',
    badgeImg: '/jltcolor.svg',
    extraChip: '+100 GP / Invite',
    statsValue: '+150 GP',
    statsLabel: 'Welcome Bonus',
  },
  {
    id: 'leaderboard',
    tag: '05 / COMPETITIVE ARENA',
    category: 'Global Leaderboards',
    title: 'Leaderboards',
    subtitle: 'Seasonal Races · Trophy Badges · Cash Pools',
    description: 'Climb the global ranks by consistently crushing quests. Top champions on the weekly and seasonal leaderboards take home exclusive prestige badges, partner perks, and token payouts.',
    bannerMotto: 'Climb to Rank #1',
    ctaText: 'VIEW RANKINGS',
    href: '/dashboard/leaderboard',
    accentColor: '#FFD700',
    gradientBg: 'from-[#3B2804] via-[#7B2CBF]/30 to-[#080411]',
    glowColor: 'rgba(255, 215, 0, 0.45)',
    icon: '/LeaderBoard.svg',
    image: '/showcase/leaderboard.jpg',
    badgeImg: '/badge/gold-badge.webp',
    extraChip: 'Rank #1 Trophy',
    statsValue: '#1 Rank',
    statsLabel: 'Seasonal Glory',
  },
  {
    id: 'streak',
    tag: '06 / STREAK ENGINE',
    category: 'Daily Streak Multiplier',
    title: 'Daily Streaks',
    subtitle: 'Daily Login · Streak Fire · 2.5× Boost',
    description: 'Keep your streak flame burning by logging in each day. The longer your streak, the higher your global GP multiplier climbs across all JaxMart quest activities.',
    bannerMotto: 'Ignite Your Streak',
    ctaText: 'KEEP THE FLAME',
    href: '/dashboard',
    accentColor: '#FF7A00',
    gradientBg: 'from-[#421403] via-[#E85D04]/30 to-[#080411]',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    icon: '/icon/flame.webp',
    image: '/showcase/streak.jpg',
    badgeImg: '/Flame.svg',
    extraChip: '2.5× Streak Bonus',
    statsValue: '14 Days',
    statsLabel: 'Max Multiplier',
  },
];

export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);

  // ─── Scroll to a specific card index along the pinned GSAP timeline ───
  const scrollToCard = useCallback((index: number) => {
    const total = FEATURE_PROJECTS.length;
    const clampedIndex = Math.max(0, Math.min(total - 1, index));
    setActiveIndex(clampedIndex);
    activeIndexRef.current = clampedIndex;

    const st = scrollTriggerInstanceRef.current;
    if (st) {
      const scrollDistance = st.end - st.start;
      const ratio = clampedIndex / (total - 1);
      const targetScroll = st.start + ratio * scrollDistance;

      if (typeof window !== 'undefined' && window.__lenis) {
        window.__lenis.scrollTo(targetScroll, {
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, []);

  // Apply TRIONN 3D tilt & dynamic light beam to all cards
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    cardRefs.current.forEach((card) => {
      if (!card) return;
      const cleanupTilt = createCardTiltEffect(card, { maxRotation: 5, translateY: -6 });
      const cleanupLightBeam = createCardLightBeamEffect(card);
      cleanups.push(cleanupTilt);
      cleanups.push(cleanupLightBeam);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // ── GSAP TRIONN 3D CURVED CYLINDRICAL CAROUSEL (DESKTOP & MOBILE) ──
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current || !trackRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const totalCards = FEATURE_PROJECTS.length;

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

      // Section Header Reveal
      createHeaderReveal('.features-badge', '.features-title', '.features-desc', sectionRef.current!, {
        start: 'top 85%',
        toggleActions: ReversibleToggleActions,
      });

      const cardElements = cardRefs.current.filter(Boolean) as HTMLDivElement[];

      // ── TRIONN 3D CYLINDRICAL CURVED RIBBON CALCULATOR ──
      const updateCylinderPositions = (progress: number) => {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        const currentExactIndex = progress * (totalCards - 1);
        const cardSpacing = isMobile
          ? Math.min(window.innerWidth * 0.76, 320)
          : isTablet
          ? 520
          : 660;
        const depthMultiplier = isMobile ? 170 : 280;
        const angleMultiplier = isMobile ? 34 : 28;
        const inclineSlope = isMobile ? 8 : 16;

        cardElements.forEach((card, index) => {
          const offset = index - currentExactIndex;
          const absOffset = Math.abs(offset);

          // Signature TRIONN 3D Curved Cylinder trajectory formulas:
          const x = offset * cardSpacing;
          const z = -Math.min(750, Math.pow(absOffset, 1.4) * depthMultiplier);
          const rotY = Math.max(-60, Math.min(60, -offset * angleMultiplier));
          const rotZ = Math.max(-7, Math.min(7, -offset * 2.2));
          const y = -offset * inclineSlope + Math.pow(absOffset, 1.5) * (isMobile ? 5 : 9);
          const scale = Math.max(0.72, 1 - absOffset * 0.08);
          const opacity = Math.max(0.2, 1 - absOffset * 0.3);

          gsap.set(card, {
            xPercent: -50,
            yPercent: -50,
            x,
            y,
            z,
            rotationY: rotY,
            rotationZ: rotZ,
            scale,
            opacity,
            zIndex: Math.round(100 - absOffset * 10),
            transformPerspective: isMobile ? 850 : 1200,
            transformOrigin: 'center center',
            force3D: true,
          });
        });

        const activeIdx = Math.min(
          totalCards - 1,
          Math.max(0, Math.round(currentExactIndex))
        );
        if (activeIdx !== activeIndexRef.current) {
          activeIndexRef.current = activeIdx;
          setActiveIndex(activeIdx);
        }
      };

      // Set initial 3D Perspective Stage
      if (container) {
        gsap.set(container, { perspective: 1200 });
      }
      updateCylinderPositions(0);

      // Pinned GSAP ScrollTrigger Master Timeline
      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${Math.min(window.innerHeight * (window.innerWidth < 768 ? 2.0 : 1.8), 2000)}`,
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => updateCylinderPositions(scrollTriggerInstanceRef.current?.progress || 0),
          onUpdate: (self) => {
            updateCylinderPositions(self.progress);
          },
        },
      });

      scrollTriggerInstanceRef.current = pinTimeline.scrollTrigger || null;

      // Mobile Touch Drag Swipe support to rotate the cylinder
      let startTouchX = 0;
      let startScrollProgress = 0;
      let isDragging = false;

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        startTouchX = e.touches[0].clientX;
        if (scrollTriggerInstanceRef.current) {
          startScrollProgress = scrollTriggerInstanceRef.current.progress;
          isDragging = true;
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging || !scrollTriggerInstanceRef.current) return;
        const deltaX = e.touches[0].clientX - startTouchX;
        const scrollDistance = scrollTriggerInstanceRef.current.end - scrollTriggerInstanceRef.current.start;
        const progressDelta = -(deltaX / (window.innerWidth * 1.0));
        const newProgress = Math.max(0, Math.min(1, startScrollProgress + progressDelta));
        const targetScroll = scrollTriggerInstanceRef.current.start + newProgress * scrollDistance;
        window.scrollTo({ top: targetScroll });
      };

      const onTouchEnd = () => {
        isDragging = false;
      };

      if (container) {
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchmove', onTouchMove, { passive: true });
        container.addEventListener('touchend', onTouchEnd, { passive: true });
      }

      return () => {
        if (container) {
          container.removeEventListener('touchstart', onTouchStart);
          container.removeEventListener('touchmove', onTouchMove);
          container.removeEventListener('touchend', onTouchEnd);
        }
        scrollTriggerInstanceRef.current = null;
        gsap.set(cardElements, { clearProps: 'all' });
      };
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  const activeProject = FEATURE_PROJECTS[activeIndex];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-transparent overflow-hidden select-none flex flex-col justify-between py-6 sm:py-10 md:py-16"
      aria-label="Features Showcase - Built for Quest Champions"
    >
      {/* Top Animated Glowing Border */}
      <div className="features-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[85%] max-w-6xl h-[1.5px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] via-[#00F0FF] to-transparent pointer-events-none" />

      {/* Dynamic Ambient Background Glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 opacity-25"
        style={{
          background: `radial-gradient(ellipse at center, ${activeProject.accentColor} 0%, rgba(54,12,159,0.3) 50%, transparent 80%)`,
        }}
      />
      <div className="absolute bottom-10 right-[-10%] w-[600px] h-[600px] rounded-full bg-radial from-[#7B2CBF]/20 via-transparent to-transparent blur-[130px] pointer-events-none" />

      {/* Atmospheric 3D Background Typography (TRIONN Aesthetic) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0 opacity-10 overflow-hidden">
        <div className="font-blockDisplay text-[14vw] sm:text-[12vw] tracking-tighter uppercase whitespace-nowrap bg-gradient-to-b from-white via-white/50 to-transparent bg-clip-text text-transparent transform -rotate-2">
          QUESTS IN MOTION
        </div>
      </div>

      {/* ── 1. SECTION HEADER ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center gap-1.5 sm:gap-2.5 text-center relative z-20 shrink-0">
        <div className="features-badge glass-pill px-3.5 sm:px-4 py-1 sm:py-1.5 inline-flex items-center gap-2">
          <img src="/jlt.svg" alt="JLT" width={18} height={18} loading="lazy" decoding="async" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
          <span className="font-gilroyMedium text-[11px] sm:text-xs text-white/90 tracking-wider uppercase">
            Featured Mechanics
          </span>
        </div>

        <h2 className="features-title font-gilroyBold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
          <SplitText scrollTrigger={false}>Built for Quest Champions</SplitText>
        </h2>

        <p className="features-desc font-gilroyRegular text-gray-400 text-xs sm:text-sm max-w-[560px] leading-relaxed hidden sm:block">
          Scroll to explore the 6 high-yield earning engines, fortune spins, and social mechanics powering the JLT ecosystem.
        </p>
      </div>

      {/* ── 2. PINNED 3D CURVED CYLINDER STAGE ── */}
      <div
        ref={containerRef}
        className="relative w-full my-auto flex items-center justify-center overflow-visible z-10 py-2 sm:py-6 min-h-[360px] sm:min-h-[440px] md:min-h-[520px]"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      >
        <div
          ref={trackRef}
          className="relative w-full h-[350px] sm:h-[420px] md:h-[480px] flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {FEATURE_PROJECTS.map((project, idx) => {
            const isCenter = idx === activeIndex;

            return (
              <div
                key={project.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => scrollToCard(idx)}
                data-cursor="card"
                data-cursor-text={isCenter ? 'OPEN' : 'SELECT'}
                className={`absolute top-1/2 left-1/2 w-[86vw] max-w-[340px] sm:max-w-[440px] md:w-[680px] md:max-w-none lg:w-[740px] shrink-0 rounded-2xl md:rounded-[28px] p-3.5 sm:p-6 md:p-8 bg-gradient-to-b ${project.gradientBg} border transition-[border-color,box-shadow] duration-300 cursor-pointer will-change-transform ${
                  isCenter
                    ? 'border-white/30 shadow-[0_30px_80px_rgba(0,0,0,0.85)] ring-1 ring-white/20'
                    : 'border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)]'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* ── CARD VISUAL ARTWORK FRAME (16:10 Cinematic Frame) ── */}
                <div className="relative w-full h-[165px] sm:h-[240px] md:h-[320px] rounded-xl sm:rounded-2xl md:rounded-[24px] overflow-hidden border border-white/15 bg-black/60 shadow-inner group flex flex-col justify-between p-2.5 sm:p-5 md:p-6">
                  
                  {/* Full-bleed Generated Cinematic Artwork */}
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                  />

                  {/* High-Contrast Gradient Scrim for readable badges and motto typography */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, rgba(8,4,17,0.7) 0%, rgba(8,4,17,0.1) 45%, rgba(8,4,17,0.92) 100%)`,
                    }}
                  />

                  {/* Ambient Corner Accent Glow */}
                  <div
                    className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ background: project.accentColor }}
                  />

                  {/* ── Round Rotating Orbit Animation (Spin Wheel & Featured Showcase) ── */}
                  {project.id === 'spin' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                      {/* Outer Rotating Dashed Ring */}
                      <div className="w-[140px] sm:w-[220px] md:w-[280px] h-[140px] sm:h-[220px] md:h-[280px] rounded-full border border-dashed border-[#00F0FF]/40 animate-spin-slow opacity-60" />
                      {/* Inner Counter-Rotating Ring */}
                      <div className="absolute w-[110px] sm:w-[170px] md:w-[210px] h-[110px] sm:h-[170px] md:h-[210px] rounded-full border border-[#FFA28D]/50 opacity-40 animate-spin-reverse" />
                      {/* Radial energy halo */}
                      <div
                        className="absolute w-[180px] h-[180px] rounded-full blur-2xl opacity-25"
                        style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.6) 0%, transparent 70%)' }}
                      />
                    </div>
                  )}

                  {/* Top Row: Tag Badge & Extra Status Chip */}
                  <div className="relative z-10 flex flex-wrap items-start justify-between gap-1.5 sm:gap-3">
                    <div className="glass-pill px-2 sm:px-3 py-0.5 sm:py-1.5 inline-flex items-center gap-1.5 sm:gap-2 border border-white/20 bg-black/60 backdrop-blur-md">
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full" style={{ background: project.accentColor }} />
                      <span className="font-gilroyBold text-[8px] sm:text-[11px] text-white tracking-widest uppercase">
                        {project.tag}
                      </span>
                    </div>

                    {project.extraChip && (
                      <div className="glass-pill px-2 sm:px-3 py-0.5 sm:py-1.5 inline-flex items-center gap-1 sm:gap-1.5 border border-white/20 bg-black/60 backdrop-blur-md shadow-sm">
                        <Sparkles className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" style={{ color: project.accentColor }} />
                        <span className="font-gilroyBold text-[9px] sm:text-xs text-white">
                          {project.extraChip}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Central Micro-Emblem */}
                  <div className="relative z-10 my-auto flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="glass-pill px-3 sm:px-4 py-1 sm:py-2 bg-black/70 border border-white/30 backdrop-blur-md flex items-center gap-2 shadow-2xl scale-95 group-hover:scale-100 transition-transform duration-300">
                      <img src={project.icon} alt="" className="w-4 sm:w-5 h-4 sm:h-5 object-contain" />
                      <span className="font-gilroyBold text-xs text-white uppercase tracking-wider">{project.title}</span>
                    </div>
                  </div>

                  {/* Bottom Floating Motto / Headline Inside Artwork */}
                  <div className="relative z-10 flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-gilroyBold text-base sm:text-2xl md:text-4xl text-white tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                        {project.bannerMotto}
                      </span>
                    </div>

                    {project.statsValue && (
                      <div className="hidden sm:flex flex-col items-end px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md shrink-0">
                        <span className="font-gilroyBold text-sm sm:text-base text-white" style={{ color: project.accentColor }}>
                          {project.statsValue}
                        </span>
                        <span className="font-gilroyRegular text-[9px] sm:text-[10px] text-gray-300 uppercase tracking-wider">
                          {project.statsLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── CARD TYPOGRAPHY & INTERACTIVE ACTION (Below Frame) ── */}
                <div className="mt-2.5 sm:mt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3">
                  <div className="flex flex-col gap-0.5 sm:gap-1 max-w-lg">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-gilroyBold text-sm sm:text-xl text-white tracking-wide group-hover:text-[#FFA28D] transition-colors duration-200">
                        {project.title}
                      </span>
                      <span className="max-w-full text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md bg-white/10 text-gray-300 font-gilroyMedium">
                        {project.category}
                      </span>
                    </div>
                    <p className="font-gilroyRegular text-gray-300 text-[11px] sm:text-sm leading-snug sm:leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Explore Link CTA with Animated Line & Arrow */}
                  <Link
                    href={project.href}
                    data-cursor="cta"
                    data-cursor-text="OPEN →"
                    className="inline-flex items-center gap-1 sm:gap-2 font-gilroyBold text-[11px] sm:text-sm tracking-wider uppercase group/link self-start sm:self-end text-white hover:text-[#FFA28D] transition-colors py-0.5 shrink-0"
                  >
                    <span className="relative">
                      {project.ctaText}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFA28D] group-hover/link:w-full transition-all duration-300" />
                    </span>
                    <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 text-[#FFA28D] group-hover/link:translate-x-1.5 transition-transform duration-200" />
                  </Link>
                </div>

                {/* Dynamic Corner Ambient Accent */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ background: project.accentColor }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. BOTTOM SCRUBBED STEP INDICATORS (CENTERED) ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex items-center justify-center relative z-20 shrink-0 mt-2">
        {/* Step Indicators: 01, 02, 03, 04, 05, 06 */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
          {FEATURE_PROJECTS.map((proj, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={proj.id}
                onClick={() => scrollToCard(idx)}
                type="button"
                data-cursor="pointer"
                aria-label={`Scroll to feature ${idx + 1}: ${proj.title}`}
                className={`group/dot relative flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/15 border border-white/30 text-white shadow-[0_0_15px_rgba(255,162,141,0.4)] scale-105'
                    : 'w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="font-gilroyBold text-[11px] sm:text-xs">
                  {isCurrent ? `0${idx + 1} · ${proj.title.split(' ')[0]}` : `0${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

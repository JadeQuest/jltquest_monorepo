'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  Star,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Lock,
  Gift,
  Flame,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';
import {
  gsap,
  ScrollTrigger,
  createHeaderReveal,
  prefersReducedMotion,
  isTouchDevice,
  hasFineHoverPointer,
  createDebouncedCallback,
  createRafThrottle,
  ReversibleToggleActions,
  MotionEases,
} from '@/lib/animations';
import { useMagneticButton } from './useMagneticButton';
import { SplitText } from './SplitText';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface MilestoneReward {
  level: number;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  freeRewardName: string;
  freeRewardType: string;
  freeRewardImage: string;
  premiumRewardName: string;
  premiumRewardType: string;
  premiumRewardImage: string;
  rpXpRequired: number;
  featuredAsset: {
    free: string;
    premium: string;
    aspectRatio: string;
    isCard: boolean;
  };
}

const MILESTONES: MilestoneReward[] = [
  {
    level: 1,
    tag: 'TIER 01 • LAUNCH PHASE',
    title: 'Cosmic Awakening',
    subtitle: 'Kickstart Your Seasonal Journey',
    description: 'Begin your cosmic ascent at Tier 1 with starter Gold Points (GP) and bonus progression XP to rapidly accelerate your early levels.',
    freeRewardName: '+50 Gold Points (GP)',
    freeRewardType: 'COIN',
    freeRewardImage: '/icon/coin.webp',
    premiumRewardName: '+100 GP & +50 XP Starter Pack',
    premiumRewardType: 'COIN_XP',
    premiumRewardImage: '/icon/coin.webp',
    rpXpRequired: 0,
    featuredAsset: {
      free: '/icon/coin.webp',
      premium: '/icon/coin.webp',
      aspectRatio: 'aspect-square',
      isCard: false,
    },
  },
  {
    level: 10,
    tag: 'TIER 10 • AVATAR MILESTONE',
    title: 'Cosmic Explorer',
    subtitle: 'Limited-Edition Character Identity',
    description: 'Reach Level 10 to unlock the iconic Cosmic Explorer identity. Premium pass owners claim the fully rigged 3D Holographic Cosmic Explorer Avatar.',
    freeRewardName: 'Cosmic Explorer (2D Avatar)',
    freeRewardType: 'AVATAR',
    freeRewardImage: '/avatar/pass/s1/s1b.webp',
    premiumRewardName: 'Cosmic Explorer 3D (Mythic Avatar)',
    premiumRewardType: 'AVATAR_3D',
    premiumRewardImage: '/avatar/pass/s1/s1p.webp',
    rpXpRequired: 900,
    featuredAsset: {
      free: '/avatar/pass/s1/s1b.webp',
      premium: '/avatar/pass/s1/s1p.webp',
      aspectRatio: 'aspect-square',
      isCard: false,
    },
  },
  {
    level: 25,
    tag: 'TIER 25 • MID-SEASON ZENITH',
    title: 'Stellar Synthesizer',
    subtitle: 'High-Roller Spins & Synthesis Loot',
    description: 'Collect celestial mystery fragments and fortune wheel spins at Tier 25 to forge rare on-chain collectible cards in the Altar.',
    freeRewardName: '+200 GP & +2 Fragments',
    freeRewardType: 'FRAGMENT',
    freeRewardImage: '/icon/Fragment.webp',
    premiumRewardName: '+400 GP, +3 Spins & +5 Fragments',
    premiumRewardType: 'SPIN_FRAGMENT',
    premiumRewardImage: '/icon/spinIcon.webp',
    rpXpRequired: 2400,
    featuredAsset: {
      free: '/icon/Fragment.webp',
      premium: '/icon/spinIcon.webp',
      aspectRatio: 'aspect-square',
      isCard: false,
    },
  },
  {
    level: 50,
    tag: 'TIER 50 • MYTHICAL APEX',
    title: 'Throne of Creation',
    subtitle: 'Season 01 Pinnacle Masterpiece',
    description: 'The ultimate apex of Season 01. Complete all 50 tiers to earn the legendary Throne of Creation mythical card NFT or Cosmic Guardian epic card.',
    freeRewardName: 'Cosmic Guardian (Epic Card)',
    freeRewardType: 'CARD_EPIC',
    freeRewardImage: '/card/pass/s1/basic.webp',
    premiumRewardName: 'Throne of Creation (Mythical Card)',
    premiumRewardType: 'CARD_MYTHIC',
    premiumRewardImage: '/card/pass/s1/premium.webp',
    rpXpRequired: 4900,
    featuredAsset: {
      free: '/card/pass/s1/basic.webp',
      premium: '/card/pass/s1/premium.webp',
      aspectRatio: 'aspect-[3/4]',
      isCard: true,
    },
  },
];

const PILLARS = [
  {
    icon: Crown,
    title: '50-Tier Dual Tracks',
    tag: 'FREE + PREMIUM',
    desc: 'Every player earns high-yield GP, XP, and mystery crates. Upgrade to Premium for 50 JLT to unlock 2× loot and the exclusive 3D Avatar & Mythical Card.',
    color: '#FFA28D',
    borderColor: 'border-[#FFA28D]/30',
    bgGlow: 'from-[#FFA28D]/10 to-transparent',
  },
  {
    icon: Zap,
    title: 'RP XP Mission Engine',
    tag: 'DAILY & WEEKLY',
    desc: 'Power your progression by crushing daily quests, spinning the wheel, and claiming check-in streak multipliers to gain Rare Pass XP (RP XP).',
    color: '#00F0FF',
    borderColor: 'border-[#00F0FF]/30',
    bgGlow: 'from-[#00F0FF]/10 to-transparent',
  },
  {
    icon: Star,
    title: 'Throne of Creation Apex',
    tag: 'LEVEL 50 REWARD',
    desc: 'The defining artifact of Season 01. Unlockable exclusively at Level 50 for elite commanders who conquer the entire seasonal progression path.',
    color: '#E280FF',
    borderColor: 'border-[#E280FF]/30',
    bgGlow: 'from-[#E280FF]/10 to-transparent',
  },
  {
    icon: Layers,
    title: 'Fragment Synthesis',
    tag: 'CARD FORGING',
    desc: 'Collect celestial card fragments across the pass and merge them into permanent collectible digital assets inside your on-chain card vault.',
    color: '#FFD700',
    borderColor: 'border-[#FFD700]/30',
    bgGlow: 'from-[#FFD700]/10 to-transparent',
  },
];

export const CosmicOriginsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const arenaContainerRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const portalRing1Ref = useRef<HTMLDivElement>(null);
  const portalRing2Ref = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);
  const shockwave2Ref = useRef<HTMLDivElement>(null);

  // 3-Layer transform architecture to prevent GSAP property conflicts
  const cardScrollWrapperRef = useRef<HTMLDivElement>(null); // Layer 1: Scroll emergence
  const cardMouseTiltRef = useRef<HTMLDivElement>(null); // Layer 2: Mouse tilt quickTo
  const cardFlipRef = useRef<HTMLDivElement>(null); // Layer 3: Milestone 3D flip

  const lightSweepRef = useRef<HTMLDivElement>(null);
  const pillarGridRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);

  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(3); // Default to Tier 50 Mythic Apex
  const [selectedTrack, setSelectedTrack] = useState<'PREMIUM' | 'FREE'>('PREMIUM');
  const [isAssetHovered, setIsAssetHovered] = useState(false);

  const isTransitioningRef = useRef(false);
  const selectedMilestoneIndexRef = useRef(selectedMilestoneIndex);
  useEffect(() => {
    selectedMilestoneIndexRef.current = selectedMilestoneIndex;
  }, [selectedMilestoneIndex]);

  const currentMilestone = MILESTONES[selectedMilestoneIndex];
  const isPremium = selectedTrack === 'PREMIUM';

  // Magnetic buttons for CTAs
  const explorePassBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 14, strength: 0.28 });
  const viewRewardsBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 12, strength: 0.22 });

  // ══════════════════════════════════════════════════════════
  // DUAL GOLDEN RING SHOCKWAVE & PORTAL CLIMAX ANIMATION
  // ══════════════════════════════════════════════════════════
  const triggerBothRingsEffect = useCallback(() => {
    if (prefersReducedMotion()) return;

    // 1. Portal ring pulse
    if (portalRing1Ref.current) {
      gsap.killTweensOf(portalRing1Ref.current);
      gsap.fromTo(
        portalRing1Ref.current,
        { scale: 1 },
        { scale: 1.22, duration: 0.4, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }

    // 2. Primary Yellow / Gold Shockwave Ring (z-20, highly visible)
    if (shockwaveRef.current) {
      gsap.killTweensOf(shockwaveRef.current);
      gsap.fromTo(
        shockwaveRef.current,
        { scale: 0.6, opacity: 1 },
        { scale: 2.5, opacity: 0, duration: 0.9, ease: 'power2.out' }
      );
    }

    // 3. Secondary Harmonic Gold Ripple Ring
    if (shockwave2Ref.current) {
      gsap.killTweensOf(shockwave2Ref.current);
      gsap.fromTo(
        shockwave2Ref.current,
        { scale: 0.45, opacity: 0.9 },
        { scale: 2.2, opacity: 0, duration: 1.0, delay: 0.1, ease: 'power2.out' }
      );
    }

    // 4. Holographic light sweep across the card
    if (lightSweepRef.current) {
      gsap.killTweensOf(lightSweepRef.current);
      gsap.fromTo(
        lightSweepRef.current,
        { x: '-120%', opacity: 0 },
        { x: '240%', opacity: 0.95, duration: 0.7, delay: 0.05, ease: 'power2.inOut' }
      );
    }
  }, []);

  // ══════════════════════════════════════════════════════════
  // 1. SCROLLTRIGGER ENTRANCE ANIMATION (REVERSIBLE)
  // ══════════════════════════════════════════════════════════
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Top Section Divider Line Reveal
      gsap.fromTo(
        '.cosmic-divider-line',
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

      // 2. Header Elements Reveal
      createHeaderReveal('.cosmic-badge', '.cosmic-title', '.cosmic-desc', sectionRef.current!, {
        start: 'top 85%',
        toggleActions: ReversibleToggleActions,
      });

      // 3. Cosmic Parallax Background Scrub
      if (bgImageRef.current) {
        gsap.fromTo(
          bgImageRef.current,
          { y: -45, scale: 1.05 },
          {
            y: 55,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
      }

      // 4. Cosmic Arena, Portal & Card Emergence + Both Rings Effect (Both Forward & Reverse Scroll)
      const arenaTrigger = arenaContainerRef.current || sectionRef.current;

      const arenaTl = gsap.timeline({
        scrollTrigger: {
          trigger: arenaTrigger,
          start: 'top 55%',
          end: 'bottom 40%',
          toggleActions: ReversibleToggleActions,
          onEnter: () => {
            // Forward scroll: Fire both rings when full section appears
            triggerBothRingsEffect();
          },
          onEnterBack: () => {
            // Reverse scroll: Fire both rings when section has fully reappeared
            triggerBothRingsEffect();
          },
        },
      });

      if (portalContainerRef.current) {
        arenaTl.fromTo(
          portalContainerRef.current,
          { scale: 0.4, opacity: 0, rotation: -25 },
          {
            scale: 1.15,
            opacity: 1,
            rotation: 0,
            duration: 0.9,
            ease: 'power3.out',
          },
          0
        );
      }

      // 5. Card 3D Scroll Emergence (Layer 1)
      if (cardScrollWrapperRef.current) {
        arenaTl.fromTo(
          cardScrollWrapperRef.current,
          {
            opacity: 0,
            scale: 0.85,
            y: 60,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
          },
          0
        );
      }

      // 6. Feature Pillars Staggered Entrance
      if (pillarGridRef.current) {
        gsap.fromTo(
          '.cosmic-pillar-card',
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            stagger: 0.1,
            ease: MotionEases.powerOut,
            scrollTrigger: {
              trigger: pillarGridRef.current,
              start: 'top 88%',
              toggleActions: ReversibleToggleActions,
            },
          }
        );
      }

      // 7. Continuous Smooth Portal Ring Rotations
      if (portalRing1Ref.current) {
        gsap.to(portalRing1Ref.current, {
          rotation: 360,
          duration: 40,
          repeat: -1,
          ease: 'none',
        });
      }
      if (portalRing2Ref.current) {
        gsap.to(portalRing2Ref.current, {
          rotation: -360,
          duration: 30,
          repeat: -1,
          ease: 'none',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [triggerBothRingsEffect]);

  // ══════════════════════════════════════════════════════════
  // 2. ULTRA-SMOOTH MOUSE PARALLAX TILT VIA gsap.quickTo() (Layer 2)
  // ══════════════════════════════════════════════════════════
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice() || !hasFineHoverPointer() || !arenaContainerRef.current) return;

    const arena = arenaContainerRef.current;
    const cardTilt = cardMouseTiltRef.current;
    if (!cardTilt) return;

    const setRotX = gsap.quickTo(cardTilt, 'rotationX', { duration: 0.35, ease: 'power2.out', force3D: true });
    const setRotY = gsap.quickTo(cardTilt, 'rotationY', { duration: 0.35, ease: 'power2.out', force3D: true });

    let rect = cardTilt.getBoundingClientRect();
    const updateRect = () => {
      rect = cardTilt.getBoundingClientRect();
    };
    const scheduleRectUpdate = createRafThrottle(updateRect);
    const debouncedRectUpdate = createDebouncedCallback(updateRect, 140);

    const applyMouseMove = createRafThrottle((clientX: number, clientY: number) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = Math.max(-1, Math.min(1, (clientX - centerX) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (clientY - centerY) / (rect.height / 2)));

      setRotX(-normY * 6); // Max ±6deg
      setRotY(normX * 8); // Max ±8deg
    });

    const handleMouseMove = (e: MouseEvent) => {
      applyMouseMove(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      applyMouseMove.cancel();
      setRotX(0);
      setRotY(0);
    };

    arena.addEventListener('mouseenter', updateRect);
    arena.addEventListener('mousemove', handleMouseMove, { passive: true });
    arena.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', debouncedRectUpdate, { passive: true });
    window.addEventListener('scroll', scheduleRectUpdate, { passive: true });

    return () => {
      applyMouseMove.cancel();
      scheduleRectUpdate.cancel();
      debouncedRectUpdate.cancel();
      arena.removeEventListener('mouseenter', updateRect);
      arena.removeEventListener('mousemove', handleMouseMove);
      arena.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', debouncedRectUpdate);
      window.removeEventListener('scroll', scheduleRectUpdate);
    };
  }, []);

  // ══════════════════════════════════════════════════════════
  // 3. HOLOGRAPHIC MILESTONE CARD FLIP (Layer 3)
  // ══════════════════════════════════════════════════════════
  const handleSelectMilestone = useCallback(
    (index: number) => {
      if (index === selectedMilestoneIndex || isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      // Trigger shockwave ring effect immediately on button click
      triggerBothRingsEffect();

      const flipEl = cardFlipRef.current;

      if (flipEl && !prefersReducedMotion()) {
        // Step 1: Outgoing flip
        gsap.to(flipEl, {
          rotationY: -90,
          opacity: 0.2,
          scale: 0.94,
          duration: 0.22,
          ease: 'power2.in',
          onComplete: () => {
            // Update selected milestone
            setSelectedMilestoneIndex(index);

            // Step 2: Incoming flip
            gsap.fromTo(
              flipEl,
              { rotationY: 90, opacity: 0.2, scale: 0.94 },
              {
                rotationY: 0,
                opacity: 1,
                scale: 1,
                duration: 0.28,
                ease: 'power2.out',
                onComplete: () => {
                  isTransitioningRef.current = false;
                },
              }
            );
          },
        });
      } else {
        setSelectedMilestoneIndex(index);
        isTransitioningRef.current = false;
      }
    },
    [selectedMilestoneIndex, triggerBothRingsEffect]
  );

  // Handle track toggling with smooth GSAP flip & both rings effect
  const handleToggleTrack = useCallback(
    (track: 'PREMIUM' | 'FREE') => {
      setSelectedTrack(track);
      triggerBothRingsEffect();
      const flipEl = cardFlipRef.current;
      if (flipEl && !prefersReducedMotion()) {
        gsap.fromTo(
          flipEl,
          { scale: 0.94, opacity: 0.7 },
          { scale: 1, opacity: 1, duration: 0.35, ease: MotionEases.powerOut }
        );
      }
    },
    [triggerBothRingsEffect]
  );

  const activeRewardName = isPremium ? currentMilestone.premiumRewardName : currentMilestone.freeRewardName;
  const activeFeaturedAsset = isPremium ? currentMilestone.featuredAsset.premium : currentMilestone.featuredAsset.free;

  return (
    <section
      ref={sectionRef}
      id="season-cosmic-origins"
      className="relative w-full py-16 sm:py-24 md:py-32 bg-transparent text-white overflow-hidden select-none"
    >
      {/* ── Top Animated Section Divider Line (Matching other sections) ── */}
      <div className="cosmic-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[85%] max-w-6xl h-[1.5px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] via-[#00F0FF] to-transparent pointer-events-none z-20" />

      {/* ── Background Cosmic Ambience & Nebula ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Parallax Cosmic Background WebP */}
        <div ref={bgImageRef} className="absolute inset-0 w-full h-[120%] -top-[10%] opacity-25">
          <img
            src="/pass/s1/s1bg.webp"
            alt="Cosmic Origins Background"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>

        {/* Ambient Radial Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#7B2CBF]/20 rounded-full blur-[140px] will-change-transform pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#00F0FF]/15 rounded-full blur-[120px] will-change-transform pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-[550px] h-[550px] bg-[#FFA28D]/15 rounded-full blur-[130px] will-change-transform pointer-events-none" />

        {/* Animated Constellation Sparkles */}
        <div className="absolute top-16 left-[12%] text-yellow-300 opacity-80 animate-sparkle text-lg">✦</div>
        <div className="absolute top-40 right-[15%] text-cyan-300 opacity-75 animate-sparkle text-xl" style={{ animationDelay: '1.2s' }}>★</div>
        <div className="absolute bottom-32 left-[20%] text-pink-300 opacity-90 animate-sparkle text-base" style={{ animationDelay: '2.4s' }}>✦</div>
        <div className="absolute bottom-20 right-[25%] text-purple-300 opacity-80 animate-sparkle text-lg" style={{ animationDelay: '0.8s' }}>★</div>

        {/* Subtle Cyber Horizon Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top/Bottom Fade Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080411] via-transparent to-[#080411]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 sm:gap-16 lg:gap-20">
        {/* ══════════════════════════════════════════════════════════
            1. SECTION HEADER
            ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center gap-3.5 sm:gap-4 max-w-3xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="cosmic-badge inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full glass-pill border border-[#FFA28D]/30 shadow-[0_0_20px_rgba(255,162,141,0.25)]">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span className="text-[10px] sm:text-xs md:text-sm font-gilroyBold uppercase tracking-widest text-[#FFA28D]">
              SEASON 01 • ACTIVE CAMPAIGN
            </span>
            <span className="text-yellow-300 text-xs">✦</span>
          </div>

          {/* Title */}
          <h2 className="cosmic-title text-3xl sm:text-5xl lg:text-6xl font-gilroyBold tracking-tight text-white leading-tight">
            <SplitText scrollTrigger={false} className="inline-block mr-2 sm:mr-3">Season 01:</SplitText>
            <span className="bg-gradient-to-r from-[#FFA28D] via-[#E280FF] to-[#00F0FF] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(226,128,255,0.4)]">
              Cosmic Origins
            </span>
          </h2>

          {/* Subtitle & Date Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-gilroyMedium text-purple-200/90">
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 sm:px-3 py-1 rounded-lg border border-purple-500/20">
              <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Aug 1 – Sep 30, 2026</span>
            </div>
            <span className="text-purple-400 hidden sm:inline">•</span>
            <span className="text-amber-300 font-gilroyBold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 sm:border-transparent sm:bg-transparent sm:p-0">50 Unlockable Tiers</span>
            <span className="text-purple-400 hidden sm:inline">•</span>
            <span className="text-emerald-300 font-gilroyBold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 sm:border-transparent sm:bg-transparent sm:p-0">Zero Gas Required</span>
          </div>

          {/* Description */}
          <p className="cosmic-desc text-purple-200 font-gilroyRegular text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl opacity-90 px-2">
            Embark on a galactic odyssey. Complete quests, spin the high-roller fortune wheel, and level up your Rare Pass across 50 tiers to unlock exclusive 3D holographic avatars, collectible NFT cards, and massive GP token payouts.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. INTERACTIVE RARE PASS SHOWCASE ARENA
            ══════════════════════════════════════════════════════════ */}
        <div
          ref={arenaContainerRef}
          className="cosmic-arena-panel daily-card-panel p-4 sm:p-8 lg:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(54,12,159,0.35)] border border-purple-500/30 rounded-2xl sm:rounded-3xl"
        >
          {/* Inner Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#FFA28D]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Live Track Switcher & Level Status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 sm:pb-6 border-b border-white/10 relative z-20">
            {/* Left: Season Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(123,44,191,0.4)] shrink-0">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA28D] animate-spin-ccw" />
              </div>
              <div>
                <h3 className="text-white font-gilroyBold text-base sm:text-lg md:text-xl">Rare Pass Level Matrix</h3>
                <p className="text-[11px] sm:text-xs text-purple-300 font-gilroyMedium">Interactive Season 01 Progression Simulation</p>
              </div>
            </div>

            {/* Right: Free vs Premium Track Toggles */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md w-full sm:w-auto justify-center">
              <button
                onClick={() => handleToggleTrack('FREE')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-gilroyBold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  !isPremium
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
                <span>Free Track</span>
              </button>

              <button
                onClick={() => handleToggleTrack('PREMIUM')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-gilroyBold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  isPremium
                    ? 'bg-gradient-to-r from-amber-500/30 to-purple-600/30 text-amber-300 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-bounce" />
                <span>Premium Pass (50 JLT)</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Left 3D Showcase Card vs Right Interactive Milestone Scrubbers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6 sm:mt-8 relative z-10 items-center">
            {/* ── Left Column: Cosmic Portal + 3D Holographic Showcase Card (5 cols) ── */}
            <div
              className="lg:col-span-5 flex justify-center items-center relative w-full"
              style={{ perspective: '1200px' }}
            >
              {/* ══════════════════════════════════════════════════════════
                  COSMIC PORTAL (Concentric Radial Rings Behind Card)
                  ══════════════════════════════════════════════════════════ */}
              <div
                ref={portalContainerRef}
                className="absolute inset-0 m-auto w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] pointer-events-none z-0 flex items-center justify-center will-change-transform"
              >
                {/* Radial Nebula Core */}
                <div className="absolute inset-0 rounded-full bg-radial from-[#7B2CBF]/45 via-[#360C9F]/30 to-transparent blur-2xl" />

                {/* Portal Outer Glowing Ring */}
                <div
                  ref={portalRing1Ref}
                  className="absolute inset-4 rounded-full border-2 border-dashed border-[#00F0FF]/35 shadow-[0_0_40px_rgba(0,240,255,0.3)] will-change-transform"
                />

                {/* Portal Inner Glowing Ring with Celestial Markers */}
                <div
                  ref={portalRing2Ref}
                  className="absolute inset-10 sm:inset-14 rounded-full border border-[#FFA28D]/40 shadow-[0_0_30px_rgba(255,162,141,0.35)] will-change-transform"
                />

                {/* Central High-Energy Event Horizon */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#00F0FF]/25 via-[#7B2CBF]/35 to-[#FFA28D]/25 blur-xl animate-pulse" />
              </div>

              {/* ══════════════════════════════════════════════════════════
                  RADIAL SHOCKWAVE RINGS (Z-20 Over/Around Showcase Card)
                  ══════════════════════════════════════════════════════════ */}
              <div
                ref={shockwaveRef}
                className="absolute inset-0 m-auto w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] rounded-full border-[3px] border-[#FFD700] shadow-[0_0_60px_#FFD700,0_0_120px_#FFA500,inset_0_0_30px_#FFD700] opacity-0 pointer-events-none z-20 will-change-transform"
                style={{ transformOrigin: 'center center' }}
              />

              <div
                ref={shockwave2Ref}
                className="absolute inset-0 m-auto w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] rounded-full border-2 border-[#FFA28D] shadow-[0_0_50px_#FFA28D,0_0_100px_#FFD700] opacity-0 pointer-events-none z-20 will-change-transform"
                style={{ transformOrigin: 'center center' }}
              />

              {/* ══════════════════════════════════════════════════════════
                  LAYER 1: SCROLL EMERGENCE WRAPPER
                  ══════════════════════════════════════════════════════════ */}
              <div
                ref={cardScrollWrapperRef}
                className="relative z-10 w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[380px] will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* ══════════════════════════════════════════════════════════
                    LAYER 2: MOUSE TILT WRAPPER
                    ══════════════════════════════════════════════════════════ */}
                <div
                  ref={cardMouseTiltRef}
                  className="w-full will-change-transform"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* ══════════════════════════════════════════════════════════
                      LAYER 3: MILESTONE FLIP WRAPPER
                      ══════════════════════════════════════════════════════════ */}
                  <div
                    ref={cardFlipRef}
                    onMouseEnter={() => setIsAssetHovered(true)}
                    onMouseLeave={() => setIsAssetHovered(false)}
                    className="w-full will-change-transform"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div
                      data-cursor="card"
                      data-cursor-text="PREVIEW"
                      className={`cosmic-space-card glass-panel w-full p-5 sm:p-7 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-500 border ${
                        isPremium
                          ? 'border-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
                          : 'border-cyan-400/40 shadow-[0_0_35px_rgba(0,240,255,0.2)]'
                      }`}
                      style={{ minHeight: '380px' }}
                    >
                      {/* Holographic Light Sweep Sheen */}
                      <div
                        ref={lightSweepRef}
                        className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none z-30 opacity-0 will-change-transform"
                      />

                      {/* Background Art Wallpaper */}
                      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                        <img
                          src="/pass/s1/s1bg.webp"
                          alt="Card Ambient Art"
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#180C30] via-[#180C30]/70 to-transparent" />
                      </div>

                      {/* Top Badge: Level & Track */}
                      <div className="w-full flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-gilroyBold">
                          <span className="text-[#00F0FF]">LVL {currentMilestone.level}</span>
                          <span className="text-gray-400">/ 50</span>
                        </div>

                        <span
                          className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-gilroyBold flex items-center gap-1 border ${
                            isPremium
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                          }`}
                        >
                          {isPremium ? (
                            <>
                              <Crown className="w-3 h-3 text-amber-300" /> Premium Track
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-cyan-300" /> Free Track
                            </>
                          )}
                        </span>
                      </div>

                      {/* Center: Dynamic Reward Asset Display */}
                      <div className="relative my-auto py-3 sm:py-4 flex items-center justify-center z-10 w-full">
                        {/* Glowing Backlight Halo */}
                        <div
                          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                            isPremium
                              ? 'bg-gradient-to-tr from-amber-500/30 via-purple-600/30 to-pink-500/30'
                              : 'bg-gradient-to-tr from-cyan-500/30 via-blue-600/30 to-purple-500/30'
                          } ${isAssetHovered ? 'scale-125 opacity-100' : 'scale-95 opacity-60'}`}
                        />

                        {/* Visual Asset Container */}
                        <div className="relative group cursor-pointer">
                          <img
                            src={activeFeaturedAsset}
                            alt={activeRewardName}
                            className={`object-contain transition-transform duration-500 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] ${
                              currentMilestone.featuredAsset.isCard
                                ? 'w-40 sm:w-52 lg:w-56 h-auto max-h-[220px] sm:max-h-[260px] rounded-xl border border-white/20'
                                : 'w-28 sm:w-36 lg:w-44 h-28 sm:h-36 lg:h-44'
                            } ${isAssetHovered ? 'scale-110 rotate-1' : 'scale-100'}`}
                            loading="lazy"
                          />

                          {/* Sparkle Badges */}
                          <div className="absolute -top-2 -right-2 text-yellow-300 text-sm animate-sparkle">✦</div>
                          <div className="absolute -bottom-2 -left-2 text-cyan-300 text-xs animate-sparkle" style={{ animationDelay: '1s' }}>★</div>
                        </div>
                      </div>

                      {/* Bottom: Reward Meta */}
                      <div className="w-full flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] sm:text-[11px] font-gilroyBold uppercase tracking-widest text-[#FFA28D]">
                          {currentMilestone.tag}
                        </span>
                        <h4 className="text-white font-gilroyBold text-lg sm:text-xl drop-shadow-md truncate">
                          {activeRewardName}
                        </h4>
                        <p className="text-purple-200/80 font-gilroyMedium text-xs leading-relaxed line-clamp-2">
                          {currentMilestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Interactive Milestone Selection & Progress Simulation (7 cols) ── */}
            <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6 relative z-20">
              {/* Active Milestone Lore Card */}
              <div className="glass-panel p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col gap-3 border border-white/10">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-gilroyBold text-[#00F0FF] uppercase tracking-wider">
                      Selected Milestone • Level {currentMilestone.level}
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-gilroyBold text-white mt-0.5 truncate">
                      {currentMilestone.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] sm:text-xs text-purple-300 font-gilroyMedium">Requirement</span>
                    <p className="text-xs sm:text-sm font-gilroyBold text-[#FFA28D]">{currentMilestone.rpXpRequired} RP XP</p>
                  </div>
                </div>

                <p className="text-purple-200 font-gilroyRegular text-xs sm:text-sm md:text-base leading-relaxed">
                  {currentMilestone.description}
                </p>

                {/* Reward Snapshot comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                  {/* Free Reward Box */}
                  <div
                    onClick={() => handleToggleTrack('FREE')}
                    className={`p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer border ${
                      !isPremium
                        ? 'bg-cyan-500/15 border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={currentMilestone.freeRewardImage}
                      alt="Free Reward"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow-md"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] sm:text-[10px] uppercase font-gilroyBold text-cyan-300">Free Reward</span>
                      <span className="text-xs font-gilroyBold text-white truncate" title={currentMilestone.freeRewardName}>
                        {currentMilestone.freeRewardName}
                      </span>
                    </div>
                  </div>

                  {/* Premium Reward Box */}
                  <div
                    onClick={() => handleToggleTrack('PREMIUM')}
                    className={`p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer border ${
                      isPremium
                        ? 'bg-amber-500/15 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={currentMilestone.premiumRewardImage}
                      alt="Premium Reward"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow-md"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] sm:text-[10px] uppercase font-gilroyBold text-amber-300 flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 text-amber-300" /> Premium Exclusive
                      </span>
                      <span className="text-xs font-gilroyBold text-white truncate" title={currentMilestone.premiumRewardName}>
                        {currentMilestone.premiumRewardName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Milestone Scrubbing Nodes */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex justify-between items-center text-[11px] sm:text-xs font-gilroyMedium text-purple-200">
                  <span className="uppercase tracking-wider">Select Milestone Tier:</span>
                  <span className="text-cyan-300 font-gilroyBold hidden sm:inline">Click tier node to preview</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                  {MILESTONES.map((m, idx) => {
                    const isSelected = selectedMilestoneIndex === idx;
                    return (
                      <button
                        key={m.level}
                        onClick={() => handleSelectMilestone(idx)}
                        className={`py-2 sm:py-3 px-1 sm:px-3 rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-300 cursor-pointer border relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#360C9F] to-[#180C30] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-105'
                            : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-black/60'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-radial from-[#00F0FF]/20 via-transparent to-transparent pointer-events-none" />
                        )}
                        <span className={`text-xs sm:text-base md:text-lg font-gilroyBold ${isSelected ? 'text-[#00F0FF]' : 'text-white'}`}>
                          LVL {m.level}
                        </span>
                        <span className="text-[8px] sm:text-[10px] font-gilroyMedium text-purple-300 truncate max-w-full text-center">
                          {m.level === 50 ? 'Apex Card' : m.level === 10 ? '3D Avatar' : m.level === 25 ? 'Spins & Frags' : 'Starter GP'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Simulation Bar */}
              <div className="flex flex-col gap-1.5 bg-black/40 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10">
                <div className="flex justify-between items-center text-[11px] sm:text-xs text-purple-200 font-gilroyMedium">
                  <span>Season 01 Campaign Progress:</span>
                  <span className="text-[#00F0FF] font-gilroyBold">
                    {currentMilestone.rpXpRequired} / 4,900 RP XP (Tier {currentMilestone.level}/50)
                  </span>
                </div>
                <div className="w-full h-2.5 sm:h-3 bg-black/80 rounded-full p-0.5 border border-purple-500/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#FFA28D] transition-all duration-700 shadow-[0_0_12px_#00F0FF]"
                    style={{ width: `${Math.max(6, Math.min(100, (currentMilestone.level / 50) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-2">
                <Link
                  ref={explorePassBtnRef}
                  href="/dashboard/rare-pass"
                  data-cursor="cta"
                  data-cursor-text="PLAY PASS"
                  className="w-full sm:w-auto flex-1 glass-btn gsap-magnetic-btn py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-gilroyBold text-white text-center text-xs sm:text-base tracking-wide shadow-[0_0_25px_rgba(54,12,159,0.5)] flex items-center justify-center gap-2 group hover:shadow-[0_0_30px_#FFA28D] hover:scale-[1.02] transition-all"
                >
                  <Crown className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform duration-300 magnetic-icon" />
                  <span>Enter Season 01 Pass</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200 magnetic-icon" />
                </Link>

                <Link
                  ref={viewRewardsBtnRef}
                  href="/dashboard/rare-pass"
                  className="w-full sm:w-auto py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl font-gilroyBold text-purple-200 hover:text-white text-center text-xs sm:text-sm border border-purple-500/30 hover:border-purple-400 bg-purple-900/20 hover:bg-purple-900/40 transition-all flex items-center justify-center gap-2"
                >
                  <span>View All 50 Rewards</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            3. 4 CORE PILLARS GRID (COSMIC ARCHITECTURE)
            ══════════════════════════════════════════════════════════ */}
        <div ref={pillarGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className={`cosmic-pillar-card glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between gap-4 border ${pillar.borderColor} hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group shadow-lg`}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${pillar.bgGlow} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-center">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shadow-md"
                      style={{
                        backgroundColor: `${pillar.color}15`,
                        borderColor: `${pillar.color}40`,
                      }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: pillar.color }} />
                    </div>
                    <span
                      className="text-[9px] sm:text-[10px] font-gilroyBold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border"
                      style={{
                        color: pillar.color,
                        borderColor: `${pillar.color}30`,
                        backgroundColor: `${pillar.color}10`,
                      }}
                    >
                      {pillar.tag}
                    </span>
                  </div>

                  <h4 className="text-white font-gilroyBold text-base sm:text-lg mt-1">{pillar.title}</h4>
                  <p className="text-purple-200/80 font-gilroyRegular text-xs leading-relaxed">{pillar.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-gilroyMedium text-purple-300 group-hover:text-white transition-colors relative z-10">
                  <span>Learn in App</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CosmicOriginsSection;

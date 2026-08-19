'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
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

interface CanvasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  color: string;
  baseAlpha: number;
  alpha: number;
  phase: number;
  speed: number;
  orbitRadius: number;
  pulseSpeed: number;
}

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const dashboardCardRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const previewProgressRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const symbol1Ref = useRef<HTMLDivElement>(null);
  const symbol2Ref = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const pulseRingRef = useRef<HTMLDivElement>(null);
  const cardGlowRef = useRef<HTMLDivElement>(null);
  const coinPillRef = useRef<HTMLDivElement>(null);
  const lvlBadgeRef = useRef<HTMLSpanElement>(null);
  const questPlayIconRef = useRef<HTMLSpanElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const featuredBoxRef = useRef<HTMLDivElement>(null);

  // Magnetic button refs with independent icon motion & elastic recovery
  const startQuestBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 14, strength: 0.28 });
  const claimBonusBtnRef = useMagneticButton<HTMLButtonElement>({ maxDistance: 12, strength: 0.24 });

  // Numeric counter refs for GSAP numeric interpolation
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
  const [isCardHovered, setIsCardHovered] = useState(false);

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
          createParticleBurst(dashboardCardRef.current, { count: 28, radius: 95 });
        }
      }
    }
  }, [questCompleted, questProgress, triggerCoinAnimation]);


  // ══════════════════════════════════════════════════════════════════════════
  // 8. BACKGROUND JLT ENERGY FIELD (HIGH-PERFORMANCE CANVAS ENGINE)
  // ══════════════════════════════════════════════════════════════════════════
  const particlesRef = useRef<CanvasParticle[]>([]);
  const mousePosRef = useRef({ x: -1000, y: -1000, isMoving: false });
  const questCardCenterRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const isTouch = isTouchDevice();
    const particleCount = isTouch ? 16 : 42;
    const colors = ['#FFA28D', '#8C52FF', '#00F0FF', '#FFD700', '#FFFFFF', '#360C9F'];

    // Initialize particles
    const particles: CanvasParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const baseR = Math.random() * 2.5 + 1.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        baseRadius: baseR,
        radius: baseR,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.45 + 0.2,
        alpha: 0, // Starts at 0, awakens after entrance sequence
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.008,
        orbitRadius: Math.random() * 40 + 15,
        pulseSpeed: Math.random() * 0.03 + 0.02,
      });
    }
    particlesRef.current = particles;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const cardCenter = questCardCenterRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.speed;

        // Curved orbital motion trajectory
        p.x += p.vx + Math.cos(p.phase) * 0.35;
        p.y += p.vy + Math.sin(p.phase * 0.8) * 0.35;

        // 4. Quest Scan Cursor Repulsion & Energy Interaction
        if (mx > -500 && my > -500) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          const scanRadius = 160;

          if (dist < scanRadius && dist > 0) {
            const force = (1 - dist / scanRadius) * 2.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
            p.radius = p.baseRadius * (1 + (1 - dist / scanRadius) * 0.7);
          } else {
            p.radius += (p.baseRadius - p.radius) * 0.05;
          }
        }

        // Periodic subtle attraction vortex toward the Quest Card
        if (cardCenter && Math.random() < 0.008) {
          const dx = cardCenter.x - p.x;
          const dy = cardCenter.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 80 && dist < 500) {
            p.vx += (dx / dist) * 0.012;
            p.vy += (dy / dist) * 0.012;
          }
        }

        // Boundary wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Subtle alpha breathing
        const currentAlpha = p.alpha * (0.8 + Math.sin(time * 0.002 + p.phase) * 0.2);

        // Draw particle with ambient glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 3.5;
        ctx.fill();
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // 3 & 4. MOUSE-BASED 3D ENVIRONMENT & "QUEST SCAN" CURSOR INTERACTION
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;

    const section = sectionRef.current;
    const card = dashboardCardRef.current;
    const orb1 = orb1Ref.current;
    const orb2 = orb2Ref.current;
    const orb3 = orb3Ref.current;
    const grid = gridRef.current;
    const headline = headlineRef.current;
    const sym1 = symbol1Ref.current;
    const sym2 = symbol2Ref.current;
    const scanner = scannerRef.current;
    if (!section || !card) return;

    // High-performance GSAP quickTo setters with hardware acceleration
    const cardRotX = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power2.out', force3D: true });
    const cardRotY = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power2.out', force3D: true });
    const cardX = gsap.quickTo(card, 'x', { duration: 0.45, ease: 'power2.out', force3D: true });
    const cardY = gsap.quickTo(card, 'y', { duration: 0.45, ease: 'power2.out', force3D: true });

    const orb1X = orb1 ? gsap.quickTo(orb1, 'x', { duration: 0.8, ease: 'power2.out', force3D: true }) : null;
    const orb1Y = orb1 ? gsap.quickTo(orb1, 'y', { duration: 0.8, ease: 'power2.out', force3D: true }) : null;
    const orb2X = orb2 ? gsap.quickTo(orb2, 'x', { duration: 0.9, ease: 'power2.out', force3D: true }) : null;
    const orb2Y = orb2 ? gsap.quickTo(orb2, 'y', { duration: 0.9, ease: 'power2.out', force3D: true }) : null;
    const orb3X = orb3 ? gsap.quickTo(orb3, 'x', { duration: 0.85, ease: 'power2.out', force3D: true }) : null;
    const orb3Y = orb3 ? gsap.quickTo(orb3, 'y', { duration: 0.85, ease: 'power2.out', force3D: true }) : null;

    const gridX = grid ? gsap.quickTo(grid, 'x', { duration: 0.6, ease: 'power2.out', force3D: true }) : null;
    const gridY = grid ? gsap.quickTo(grid, 'y', { duration: 0.6, ease: 'power2.out', force3D: true }) : null;

    const headX = headline ? gsap.quickTo(headline, 'x', { duration: 0.5, ease: 'power2.out', force3D: true }) : null;
    const headY = headline ? gsap.quickTo(headline, 'y', { duration: 0.5, ease: 'power2.out', force3D: true }) : null;

    const sym1X = sym1 ? gsap.quickTo(sym1, 'x', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;
    const sym1Y = sym1 ? gsap.quickTo(sym1, 'y', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;
    const sym2X = sym2 ? gsap.quickTo(sym2, 'x', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;
    const sym2Y = sym2 ? gsap.quickTo(sym2, 'y', { duration: 0.4, ease: 'power2.out', force3D: true }) : null;

    const scannerX = scanner ? gsap.quickTo(scanner, 'x', { duration: 0.15, ease: 'power3.out', force3D: true }) : null;
    const scannerY = scanner ? gsap.quickTo(scanner, 'y', { duration: 0.15, ease: 'power3.out', force3D: true }) : null;

    let cachedRect = section.getBoundingClientRect();
    const updateRects = () => {
      if (section) cachedRect = section.getBoundingClientRect();
      if (card) {
        const cRect = card.getBoundingClientRect();
        questCardCenterRef.current = {
          x: cRect.left + cRect.width / 2 - cachedRect.left,
          y: cRect.top + cRect.height / 2 - cachedRect.top,
        };
      }
    };
    updateRects();

    let heroRaf: number | null = null;
    let clientX = 0;
    let clientY = 0;

    const processHeroParallax = () => {
      heroRaf = null;
      if (!cachedRect.width || !cachedRect.height) return;

      const localX = clientX - cachedRect.left;
      const localY = clientY - cachedRect.top;
      const relX = localX / cachedRect.width - 0.5;
      const relY = localY / cachedRect.height - 0.5;

      mousePosRef.current.x = localX;
      mousePosRef.current.y = localY;

      if (scannerX && scannerY) {
        scannerX(localX);
        scannerY(localY);
      }

      cardRotX(relY * -10);
      cardRotY(relX * 12);
      cardX(relX * 24);
      cardY(relY * 18);

      if (headX && headY) {
        headX(relX * 16);
        headY(relY * 12);
      }

      if (orb1X && orb1Y) {
        orb1X(relX * -25);
        orb1Y(relY * -18);
      }
      if (orb2X && orb2Y) {
        orb2X(relX * 30);
        orb2Y(relY * 20);
      }
      if (orb3X && orb3Y) {
        orb3X(relX * -20);
        orb3Y(relY * 22);
      }

      if (gridX && gridY) {
        gridX(relX * 16);
        gridY(relY * 16);
      }

      if (sym1X && sym1Y) {
        sym1X(relX * 42);
        sym1Y(relY * 36);
      }
      if (sym2X && sym2Y) {
        sym2X(relX * -46);
        sym2Y(relY * -40);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;

      if (scanner && !scanner.classList.contains('opacity-100')) {
        gsap.to(scanner, { opacity: 1, duration: 0.25, overwrite: 'auto' });
      }

      if (!heroRaf) {
        heroRaf = requestAnimationFrame(processHeroParallax);
      }
    };

    const handleMouseLeave = () => {
      if (heroRaf) cancelAnimationFrame(heroRaf);
      heroRaf = null;

      mousePosRef.current.x = -1000;
      mousePosRef.current.y = -1000;

      if (scanner) {
        gsap.to(scanner, { opacity: 0, duration: 0.4, overwrite: 'auto' });
      }

      cardRotX(0);
      cardRotY(0);
      cardX(0);
      cardY(0);
      if (headX && headY) { headX(0); headY(0); }
      if (orb1X && orb1Y) { orb1X(0); orb1Y(0); }
      if (orb2X && orb2Y) { orb2X(0); orb2Y(0); }
      if (orb3X && orb3Y) { orb3X(0); orb3Y(0); }
      if (gridX && gridY) { gridX(0); gridY(0); }
      if (sym1X && sym1Y) { sym1X(0); sym1Y(0); }
      if (sym2X && sym2Y) { sym2X(0); sym2Y(0); }
    };

    section.addEventListener('mousemove', handleMouseMove, { passive: true });
    section.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', updateRects, { passive: true });
    window.addEventListener('scroll', updateRects, { passive: true });

    return () => {
      if (heroRaf) cancelAnimationFrame(heroRaf);
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updateRects);
      window.removeEventListener('scroll', updateRects);
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // 1. HERO ACTIVATION ON PAGE LOAD (MASTER TIMELINE) +
  // 2. QUEST CARD LIVING UI + 9. SCROLL TRIGGER + 10. SIGNATURE QUEST PULSE
  // ══════════════════════════════════════════════════════════════════════════
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) {
      if (stat1Ref.current) stat1Ref.current.textContent = '50,000+';
      if (stat2Ref.current) stat2Ref.current.textContent = '2.4 Million';
      if (stat3Ref.current) stat3Ref.current.textContent = '150,000+';
      if (stat4Ref.current) stat4Ref.current.textContent = '99.4%';
      return;
    }

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        defaults: { ease: MotionEases.powerOut },
        onComplete: () => {
          particlesRef.current.forEach((p) => {
            gsap.to(p, {
              alpha: p.baseAlpha,
              duration: 1.4,
              ease: 'power2.out',
              stagger: 0.03,
            });
          });
        },
      });

      // Phase 0: Dark purple ambient field fades in
      masterTl.fromTo(
        [orb1Ref.current, orb2Ref.current, orb3Ref.current],
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.1, stagger: 0.12, ease: 'power2.out' },
        0.0
      );

      // Phase 1: Background grid draws itself from center outward
      if (gridRef.current) {
        masterTl.fromTo(
          gridRef.current,
          { clipPath: 'circle(0% at 50% 40%)', opacity: 0 },
          { clipPath: 'circle(150% at 50% 40%)', opacity: 1, duration: 1.35, ease: 'power2.inOut' },
          0.05
        );
      }

      // Phase 2: JLT Symbols scale 0.7 -> 1 with blur reduction
      if (symbol1Ref.current && symbol2Ref.current) {
        masterTl.fromTo(
          [symbol1Ref.current, symbol2Ref.current],
          { scale: 0.7, opacity: 0, filter: 'blur(12px)' },
          { scale: 1, opacity: 0.22, filter: 'blur(0px)', duration: 0.95, stagger: 0.15, ease: MotionEases.backOut },
          0.18
        );
      }

      // Phase 3: Top information ticker / marquee slides horizontally into position
      masterTl.fromTo(
        '.hero-top-ribbon',
        { y: -35, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' },
        0.25
      );

      // Phase 4: Status pills enter from opposite directions
      masterTl.fromTo(
        '.hero-pill-left',
        { x: -50, opacity: 0, scale: 0.92 },
        { x: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' },
        0.32
      );
      masterTl.fromTo(
        '.hero-pill-right',
        { x: 50, opacity: 0, scale: 0.92 },
        { x: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' },
        0.38
      );

      // Phase 5: Masked Vertical Headline Typography with Blur Reduction
      masterTl.fromTo(
        '.hero-mask-line',
        { yPercent: 120, opacity: 0, filter: 'blur(10px)' },
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.12, duration: 0.85, ease: 'power4.out' },
        0.42
      );


      // Phase 7: Description Fades Upward
      masterTl.fromTo(
        '.hero-description',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
        0.65
      );

      // Phase 8: CTA Buttons enter with slight spring effect
      masterTl.fromTo(
        '.hero-cta-group',
        { y: 25, opacity: 0, scale: 0.88 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: MotionEases.backOut },
        0.75
      );

      // Phase 9: Trust Badges Cascade
      masterTl.fromTo(
        '.hero-trust-badge',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out' },
        0.85
      );

      // Phase 10: Right Quest Card enters from the right with Scale + 3D Rotation
      masterTl.fromTo(
        '.hero-dashboard-panel',
        { x: 100, rotationY: 15, rotationZ: -2, scale: 0.88, opacity: 0 },
        { x: 0, rotationY: 0, rotationZ: 0, scale: 1, opacity: 1, duration: 1.05, ease: 'power3.out' },
        0.48
      );

      // Phase 11: Orbiting Chips & Loot Collectibles Pop In
      masterTl.fromTo(
        '.hero-floating-chip',
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.12, duration: 0.65, ease: MotionEases.backOut },
        0.82
      );
      masterTl.fromTo(
        '.hero-collectible-item',
        { scale: 0.3, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, stagger: 0.08, duration: 0.55, ease: MotionEases.backOut },
        0.92
      );

      // Micro-animation inside Quest Card: Progress Bar Fill
      if (progressBarRef.current) {
        masterTl.fromTo(
          progressBarRef.current,
          { width: '0%' },
          { width: `${(questProgress / 3) * 100}%`, duration: 1.3, ease: 'power2.out' },
          0.78
        );
      }

      // ──────────────────────────────────────────────────────────────────
      // 2. QUEST CARD — "LIVING UI" (INDEPENDENT CONTINUOUS ANIMATIONS)
      // ──────────────────────────────────────────────────────────────────
      if (coinPillRef.current) {
        gsap.to(coinPillRef.current, {
          y: -3.5,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.2,
        });
      }

      if (lvlBadgeRef.current) {
        gsap.to(lvlBadgeRef.current, {
          scale: 1.05,
          boxShadow: '0 0 12px rgba(140,82,255,0.7)',
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.0,
        });
      }

      if (questPlayIconRef.current) {
        gsap.to(questPlayIconRef.current, {
          rotation: 8,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.8,
        });
      }

      gsap.utils.toArray<HTMLElement>('.hero-collectible-item').forEach((item, index) => {
        gsap.to(item, {
          y: -4.5 + index * 1.5,
          duration: 3.0 + index * 0.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.0 + index * 0.3,
        });
      });

      if (testimonialRef.current) {
        gsap.to(testimonialRef.current, {
          y: -5.5,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5,
        });
      }


      // ──────────────────────────────────────────────────────────────────
      // 9. SCROLL INTERACTION (GSAP SCROLLTRIGGER HERO -> FEATURES)
      // ──────────────────────────────────────────────────────────────────
      if (heroContentRef.current && dashboardCardRef.current) {
        gsap.to(heroContentRef.current, {
          y: -45,
          opacity: 0.7,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom 40%',
            scrub: 0.6,
          },
        });

        gsap.to(dashboardCardRef.current, {
          xPercent: -8,
          scale: 0.96,
          rotationY: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom 40%',
            scrub: 0.6,
          },
        });

        if (gridRef.current) {
          gsap.to(gridRef.current, {
            scale: 0.92,
            opacity: 0.35,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom 40%',
              scrub: 0.6,
            },
          });
        }
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

    // ──────────────────────────────────────────────────────────────────
    // 10. SIGNATURE ANIMATION — "QUEST PULSE" (EVERY 9.5 SECONDS)
    // ──────────────────────────────────────────────────────────────────
    const pulseInterval = setInterval(() => {
      if (document.hidden) return;

      const ring = pulseRingRef.current;
      const cardGlow = cardGlowRef.current;
      const grid = gridRef.current;

      if (ring) {
        gsap.fromTo(
          ring,
          { scale: 0.35, opacity: 0.8 },
          { scale: 2.8, opacity: 0, duration: 2.2, ease: 'power2.out' }
        );
      }

      if (cardGlow) {
        gsap.fromTo(
          cardGlow,
          { opacity: 0.3, scale: 1 },
          { opacity: 0.85, scale: 1.12, duration: 0.8, yoyo: true, repeat: 1, ease: 'sine.inOut' }
        );
      }

      if (grid) {
        gsap.fromTo(
          grid,
          { opacity: 0.5 },
          { opacity: 0.8, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }
        );
      }

      if (questCardCenterRef.current) {
        const cx = questCardCenterRef.current.x;
        const cy = questCardCenterRef.current.y;
        particlesRef.current.forEach((p) => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < 450) {
            const force = (1 - dist / 450) * 1.8;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        });
      }
    }, 9500);

    return () => {
      clearInterval(pulseInterval);
      ctx.revert();
    };
  }, [questProgress]);

  // ══════════════════════════════════════════════════════════════════════════
  // 6 & 7. QUEST CARD HOVER & INTERACTIVE "2 / 3 DONE" PREVIEW SURGE
  // ══════════════════════════════════════════════════════════════════════════
  const handleCardMouseEnter = useCallback(() => {
    setIsCardHovered(true);

    if (progressBarRef.current && !questCompleted) {
      gsap.to(progressBarRef.current, {
        width: '78%',
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (previewProgressRef.current && !questCompleted) {
      gsap.fromTo(
        previewProgressRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: MotionEases.backOut }
      );
    }

    if (featuredBoxRef.current) {
      gsap.to(featuredBoxRef.current, {
        boxShadow: '0 0 30px rgba(140,82,255,0.35)',
        borderColor: 'rgba(255,162,141,0.4)',
        duration: 0.35,
      });
    }

    if (coinPillRef.current) {
      gsap.fromTo(
        coinPillRef.current,
        { scale: 1 },
        { scale: 1.08, duration: 0.3, yoyo: true, repeat: 1, ease: 'back.out(2)' }
      );
    }
  }, [questCompleted]);

  const handleCardMouseLeave = useCallback(() => {
    setIsCardHovered(false);

    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${(questProgress / 3) * 100}%`,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (previewProgressRef.current) {
      gsap.to(previewProgressRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.25,
        overwrite: 'auto',
      });
    }

    if (featuredBoxRef.current) {
      gsap.to(featuredBoxRef.current, {
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        borderColor: 'rgba(255,255,255,0.1)',
        duration: 0.35,
      });
    }
  }, [questProgress]);

  const currentActivity = liveActivities[currentActivityIndex];

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full pt-36 pb-10 px-6 bg-transparent overflow-hidden min-h-screen flex flex-col justify-center select-none"
    >
      {/* ── 8. Background JLT Energy Field (Canvas Particle Engine) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* ── 4. "Quest Scan" Circular Energy Scanner Overlay ── */}
      <div
        ref={scannerRef}
        className="absolute -top-[160px] -left-[160px] w-[320px] h-[320px] rounded-full pointer-events-none z-0 opacity-0 transition-opacity duration-300 blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(140,82,255,0.22) 0%, rgba(255,162,141,0.12) 45%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
        }}
        aria-hidden="true"
      />

      {/* ── 2. Dynamic Ambient Glow Orbs with Multi-Speed Parallax ── */}
      <div
        ref={orb1Ref}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full bg-radial from-[#360C9F]/45 via-[#340073]/20 to-transparent blur-[150px] pointer-events-none"
      />
      <div
        ref={orb2Ref}
        className="absolute top-16 left-[-10%] w-[650px] h-[650px] rounded-full bg-radial from-[#FFA28D]/22 via-[#7B2CBF]/15 to-transparent blur-[140px] pointer-events-none"
      />
      <div
        ref={orb3Ref}
        className="absolute bottom-10 right-[-8%] w-[700px] h-[700px] rounded-full bg-radial from-[#7B2CBF]/30 via-transparent to-transparent blur-[150px] pointer-events-none"
      />

      {/* Decorative Floating JLT Symbols with Mouse Parallax (14%) */}
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

      {/* Futuristic Background Grid with Center-Outward Draw Entrance & Continuous Drift */}
      <div
        ref={gridRef}
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_15%,#000_80%,transparent_100%)] pointer-events-none animate-grid-drift"
      />

      {/* ── TOP MARQUEE RIBBON ── */}
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
          <div ref={headlineRef} className="lg:col-span-7 flex flex-col items-start gap-8 text-left">
            
            {/* Status Pills: Counter-directional Entrance */}
            <div className="hero-tagline-pill flex flex-wrap items-center gap-3">
              <div className="hero-pill-left glass-pill px-4 py-2 inline-flex items-center gap-3 shadow-[0_0_25px_rgba(54,12,159,0.4)] border border-purple-500/30">
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
              <div className="hero-pill-right glass-pill px-3.5 py-1.5 hidden sm:inline-flex items-center gap-2 border border-purple-500/30 bg-purple-900/25 text-xs transition-all duration-500">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-gray-300 font-gilroyRegular">
                  <strong className="text-white font-gilroyBold">{currentActivity.user}</strong> {currentActivity.action}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-gilroyBold text-[10px]">
                  {currentActivity.reward}
                </span>
              </div>
            </div>

            {/* Masked Statement Typography with Vertical Reveal & Light Sweep */}
            <div className="flex flex-col gap-1.5 overflow-hidden">
              <div className="overflow-hidden">
                <h1 className="hero-mask-line font-gilroyBold text-5xl sm:text-7xl lg:text-7xl text-white tracking-tight leading-[1.04]">
                  Play daily.
                </h1>
              </div>

              <div className="overflow-hidden">
                <h1 className="hero-mask-line font-gilroyBold text-5xl sm:text-7xl lg:text-7xl text-white tracking-tight leading-[1.04]">
                  Earn real perks.
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

            {/* 5. Magnetic CTAs with Independent Child Motion */}
            <div className="hero-cta-group flex flex-wrap items-center gap-4 w-full pt-1">
              <Link
                ref={startQuestBtnRef}
                href="/dashboard"
                id="hero-start-quest-btn"
                data-cursor="cta"
                data-cursor-text="START →"
                className="glass-btn gsap-magnetic-btn px-9 py-4.5 rounded-2xl font-gilroyBold text-white text-lg tracking-wide shadow-[0_0_40px_rgba(54,12,159,0.6)] flex items-center gap-3 group hover:shadow-[0_0_60px_rgba(255,162,141,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
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

          {/* ── 4 & 6. RIGHT COLUMN: Interactive 3D Quest Card & Living UI ── */}
          <div className="lg:col-span-5 relative flex justify-center items-center perspective-1000">
            
            {/* Background Glow Ring */}
            <div
              ref={cardGlowRef}
              className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] opacity-30 blur-3xl transition-opacity duration-500"
            />

            {/* 10. Signature "Quest Pulse" Expanding Shockwave Ring */}
            <div
              ref={pulseRingRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-[#FFA28D]/60 pointer-events-none opacity-0"
              aria-hidden="true"
            />


            {/* Main Interactive Hero Panel */}
            <div
              ref={dashboardCardRef}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              data-cursor="card"
              data-cursor-text="QUEST 🎯"
              className="hero-dashboard-panel w-full max-w-md glass-panel p-6 sm:p-8 flex flex-col gap-6 relative z-10 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-all duration-300 hover:border-white/35 transform-style-preserve-3d"
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
                      <span
                        ref={lvlBadgeRef}
                        className="px-1.5 py-0.5 rounded bg-[#360C9F] text-[10px] font-gilroyBold text-purple-200 border border-purple-400/30 transition-all duration-300"
                      >
                        LVL 4
                      </span>
                    </div>
                    <span className="font-gilroyRegular text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 7 Day Streak Active
                    </span>
                  </div>
                </div>

                {/* Coin Counter Pill */}
                <div
                  ref={coinPillRef}
                  className="glass-pill px-3.5 py-1.5 flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 relative shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                >
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
              <div
                ref={featuredBoxRef}
                className="daily-card-panel p-4 sm:p-5 flex flex-col gap-3.5 relative overflow-hidden border border-white/10 shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      ref={questPlayIconRef}
                      className="p-1.5 rounded-lg bg-[#360C9F]/80 text-white shadow inline-block"
                    >
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

                {/* Progress Bar & Interactive 2/3 Done Preview Surge */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center text-xs font-gilroyMedium">
                    <span className="text-gray-300 flex items-center gap-1.5">
                      Quest Status
                      {isCardHovered && !questCompleted && (
                        <span
                          ref={previewProgressRef}
                          className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-gilroyBold"
                        >
                          +1 Step Preview
                        </span>
                      )}
                    </span>
                    <span className={`font-gilroyBold transition-colors duration-300 ${questCompleted ? 'text-emerald-400' : 'text-white'}`}>
                      {questCompleted ? '🎉 COMPLETED (+300 Coins)' : isCardHovered ? '2.4 / 3 (Simulated)' : `${questProgress} / 3 Done`}
                    </span>
                  </div>

                  {/* Progress Bar Container with Continuous Light Shimmer */}
                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
                    <div
                      ref={progressBarRef}
                      className="h-full bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full transition-all duration-300 relative overflow-hidden"
                      style={{ width: `${(questProgress / 3) * 100}%` }}
                    >
                      {/* 2. Continuous Shimmer Sweep */}
                      <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-progress-shimmer pointer-events-none" />
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
              <div
                ref={testimonialRef}
                className="hero-floating-chip absolute -bottom-6 -left-6 glass-pill p-3.5 max-w-[270px] hidden sm:flex items-start gap-3 border border-white/20 shadow-2xl backdrop-blur-xl"
              >
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
        <div ref={statsSectionRef} className="mt-14 pt-8 relative grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

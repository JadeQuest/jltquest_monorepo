'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface TokenConfig {
  id: string;
  top: string;
  left?: string;
  right?: string;
  size: number;
  opacity: number;
  duration: number;
  parallaxSpeed: number; // percentage shift with scroll
  isWatermark?: boolean;
  src?: string;
}

const TOKENS: TokenConfig[] = [
  // ── Hero Section Tokens ──
  { id: 't-hero-1', top: '12%', left: '6%', size: 68, opacity: 0.08, duration: 8.5, parallaxSpeed: -12 },
  { id: 't-hero-2', top: '24%', right: '5%', size: 105, opacity: 0.07, duration: 11.2, parallaxSpeed: -18 },
  { id: 't-hero-3', top: '44%', left: '12%', size: 54, opacity: 0.09, duration: 7.4, parallaxSpeed: -10 },
  { id: 't-hero-4', top: '56%', right: '14%', size: 64, opacity: 0.08, duration: 9.8, parallaxSpeed: -15 },

  // ── Features Section Tokens ──
  { id: 't-feat-1', top: '1150px', left: '4%', size: 84, opacity: 0.06, duration: 10.4, parallaxSpeed: -14 },
  { id: 't-feat-2', top: '1400px', right: '4%', size: 98, opacity: 0.07, duration: 12.6, parallaxSpeed: -20 },
  { id: 't-feat-3', top: '1680px', left: '48%', size: 58, opacity: 0.05, duration: 8.2, parallaxSpeed: -11 },

  // ── How It Works Tokens ──
  { id: 't-hiw-1', top: '2100px', left: '8%', size: 76, opacity: 0.06, duration: 9.2, parallaxSpeed: -16 },
  { id: 't-hiw-2', top: '2350px', right: '7%', size: 88, opacity: 0.07, duration: 11.8, parallaxSpeed: -18 },

  // ── CTA Section Tokens & Grand Watermark ──
  { id: 't-cta-watermark', top: '2920px', left: '50%', size: 360, opacity: 0.038, duration: 14.5, parallaxSpeed: -8, isWatermark: true },
  { id: 't-cta-1', top: '3080px', left: '14%', size: 72, opacity: 0.07, duration: 8.6, parallaxSpeed: -14 },
  { id: 't-cta-2', top: '3180px', right: '12%', size: 80, opacity: 0.07, duration: 10.8, parallaxSpeed: -16 },
];

export const JLTBackgroundMotion: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useIsomorphicLayoutEffect(() => {
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Initial entrance for background tokens (staggered subtle fade-in)
      gsap.from('.jlt-bg-token-wrapper', {
        autoAlpha: 0,
        scale: 0.7,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.4,
      });

      // 2. Individual Asynchronous Floating & Rotation Loops
      TOKENS.forEach((token) => {
        const el = tokenRefs.current.get(token.id);
        if (!el) return;

        if (token.isWatermark) {
          // Slow grand rotation & breathing for watermark
          gsap.to(el, {
            rotation: 12,
            scale: 1.05,
            y: -15,
            duration: token.duration,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        } else {
          // Multi-axis floating orbit
          const floatTl = gsap.timeline({ repeat: -1, yoyo: true });
          floatTl.to(el, {
            y: -20,
            x: 8,
            rotation: 4,
            scale: 1.03,
            duration: token.duration * 0.5,
            ease: 'sine.inOut',
          }).to(el, {
            y: 15,
            x: -8,
            rotation: -4,
            scale: 0.98,
            duration: token.duration * 0.5,
            ease: 'sine.inOut',
          });
        }

        // 3. ScrollTrigger Parallax Depth
        gsap.to(el, {
          yPercent: token.parallaxSpeed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      });

      // 4. Subtle Desktop Mouse Magnetism
      if (!isTouchDevice) {
        const mouseX = { val: 0 };
        const mouseY = { val: 0 };

        const quickTos = new Map<
          string,
          { x: (v: number) => void; y: (v: number) => void; rot: (v: number) => void }
        >();

        TOKENS.forEach((token) => {
          const el = tokenRefs.current.get(token.id);
          if (!el) return;
          quickTos.set(token.id, {
            x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' }),
            rot: gsap.quickTo(el, 'rotation', { duration: 0.7, ease: 'power3.out' }),
          });
        });

        const handleMouseMove = (e: MouseEvent) => {
          mouseX.val = e.clientX;
          mouseY.val = e.clientY;

          TOKENS.forEach((token) => {
            const el = tokenRefs.current.get(token.id);
            const setters = quickTos.get(token.id);
            if (!el || !setters) return;

            const rect = el.getBoundingClientRect();
            const tokenCenterX = rect.left + rect.width / 2;
            const tokenCenterY = rect.top + rect.height / 2;

            const dist = Math.hypot(mouseX.val - tokenCenterX, mouseY.val - tokenCenterY);
            const maxRadius = 450;

            if (dist < maxRadius) {
              const force = (1 - dist / maxRadius) * 14;
              const angle = Math.atan2(mouseY.val - tokenCenterY, mouseX.val - tokenCenterX);
              const pushX = Math.cos(angle) * force;
              const pushY = Math.sin(angle) * force;

              setters.x(pushX);
              setters.y(pushY);
              setters.rot(pushX * 0.2);
            } else {
              setters.x(0);
              setters.y(0);
              setters.rot(0);
            }
          });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none"
      aria-hidden="true"
    >
      {TOKENS.map((token) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          top: token.top,
          left: token.left,
          right: token.right,
          width: `${token.size}px`,
          height: `${token.size}px`,
          opacity: token.opacity,
          transform: token.isWatermark ? 'translateX(-50%) translate3d(0,0,0)' : 'translate3d(0,0,0)',
        };

        return (
          <div
            key={token.id}
            ref={(node) => {
              if (node) tokenRefs.current.set(token.id, node);
              else tokenRefs.current.delete(token.id);
            }}
            className="jlt-bg-token-wrapper flex items-center justify-center will-change-transform"
            style={style}
          >
            {/* Ambient Backlight Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#360C9F]/40 via-[#7B2CBF]/30 to-[#FFA28D]/25 blur-xl scale-125" />

            <img
              src="/jltcolor.svg"
              alt=""
              width={token.size}
              height={token.size}
              loading="lazy"
              decoding="async"
              className="relative w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,162,141,0.5)]"
            />
          </div>
        );
      })}
    </div>
  );
};

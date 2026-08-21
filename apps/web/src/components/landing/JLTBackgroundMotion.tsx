'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import {
  gsap,
  createDebouncedCallback,
  createRafThrottle,
  hasFineHoverPointer,
  isDocumentVisible,
  isTouchDevice,
  prefersReducedMotion,
  resizeCanvasToDisplaySize,
} from '@/lib/animations';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface TokenConfig {
  id: string;
  top: string;
  left?: string;
  right?: string;
  size: number;
  opacity: number;
  duration: number;
  parallaxSpeed: number;
  isWatermark?: boolean;
  symbolType?: 'logo' | 'star' | 'diamond';
}

const TOKENS: TokenConfig[] = [
  // ── Cosmic Origins Section Tokens ──
  { id: 't-cosmic-1', top: '34%', left: '5%', size: 76, opacity: 0.07, duration: 9.5, parallaxSpeed: -13, symbolType: 'star' },
  { id: 't-cosmic-2', top: '41%', right: '6%', size: 86, opacity: 0.08, duration: 11.0, parallaxSpeed: -16, symbolType: 'diamond' },

  // ── Features Section Tokens ──
  { id: 't-feat-1', top: '54%', left: '4%', size: 84, opacity: 0.06, duration: 10.4, parallaxSpeed: -14, symbolType: 'logo' },
  { id: 't-feat-2', top: '60%', right: '4%', size: 98, opacity: 0.07, duration: 12.6, parallaxSpeed: -20, symbolType: 'diamond' },
  { id: 't-feat-3', top: '66%', left: '48%', size: 58, opacity: 0.05, duration: 8.2, parallaxSpeed: -11, symbolType: 'star' },

  // ── How It Works Tokens ──
  { id: 't-hiw-1', top: '74%', left: '8%', size: 76, opacity: 0.06, duration: 9.2, parallaxSpeed: -16, symbolType: 'logo' },
  { id: 't-hiw-2', top: '80%', right: '7%', size: 88, opacity: 0.07, duration: 11.8, parallaxSpeed: -18, symbolType: 'diamond' },

  // ── CTA Section Tokens & Grand Watermark ──
  { id: 't-cta-watermark', top: '89%', left: '50%', size: 360, opacity: 0.038, duration: 14.5, parallaxSpeed: -8, isWatermark: true, symbolType: 'logo' },
  { id: 't-cta-1', top: '92%', left: '14%', size: 72, opacity: 0.07, duration: 8.6, parallaxSpeed: -14, symbolType: 'star' },
  { id: 't-cta-2', top: '95%', right: '12%', size: 80, opacity: 0.07, duration: 10.8, parallaxSpeed: -16, symbolType: 'logo' },
];

interface GlobalParticle {
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
}

export const JLTBackgroundMotion: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tokenRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  // ══════════════════════════════════════════════════════════
  // 1. GLOBAL INTERACTIVE ENERGY PARTICLE CANVAS
  // ══════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const isTouch = isTouchDevice();
    const reduceMotion = prefersReducedMotion();
    const shouldTrackPointer = hasFineHoverPointer() && !isTouch;

    if (reduceMotion) return;

    let animFrameId: number | null = null;
    let width = 1;
    let height = 1;
    let lastRenderTime = 0;
    const frameInterval = isTouch ? 1000 / 30 : 1000 / 45;
    const resizeCanvas = () => {
      const size = resizeCanvasToDisplaySize(
        canvas,
        ctx,
        window.innerWidth,
        window.innerHeight,
        1.0
      );
      width = size.width;
      height = size.height;
    };

    resizeCanvas();

    const particleCount = isTouch ? 6 : 20;
    const colors = ['#FFA28D', '#8C52FF', '#00F0FF', '#FFD700', '#FFFFFF', '#360C9F', '#E280FF'];

    const particles: GlobalParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const baseR = Math.random() * 2.0 + 1.0;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseRadius: baseR,
        radius: baseR,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.3 + 0.15,
        alpha: Math.random() * 0.3 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.01 + 0.005,
      });
    }

    const handleResize = createDebouncedCallback(resizeCanvas, 140);

    const applyMouseMove = createRafThrottle((clientX: number, clientY: number) => {
      mousePosRef.current.x = clientX;
      mousePosRef.current.y = clientY;
    });

    const handleMouseMove = (e: MouseEvent) => {
      applyMouseMove(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      mousePosRef.current.x = -1000;
      mousePosRef.current.y = -1000;
    };

    const scheduleRender = () => {
      if (animFrameId === null) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    const render = (time: number) => {
      animFrameId = null;
      if (!isDocumentVisible()) return;
      if (time - lastRenderTime < frameInterval) {
        scheduleRender();
        return;
      }
      lastRenderTime = time;

      ctx.clearRect(0, 0, width, height);

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.speed;

        // Curved orbital motion trajectory
        p.x += p.vx + Math.cos(p.phase) * 0.25;
        p.y += p.vy + Math.sin(p.phase * 0.8) * 0.25;

        // Interactive Cursor Energy Repulsion
        if (mx > -500 && my > -500) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          const scanRadius = 150;

          if (dist < scanRadius && dist > 0) {
            const force = (1 - dist / scanRadius) * 2.2;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
            p.radius = p.baseRadius * (1 + (1 - dist / scanRadius) * 0.6);
          } else {
            p.radius += (p.baseRadius - p.radius) * 0.05;
          }
        }

        // Viewport wrapping
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Alpha breathing
        const currentAlpha = Math.max(0, Math.min(1, p.alpha * (0.85 + Math.sin(time * 0.002 + p.phase) * 0.15)));

        // High-performance GPU dual-pass particle: outer soft halo + inner bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha * 0.3;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      scheduleRender();
    };

    const handleVisibilityChange = () => {
      if (isDocumentVisible()) {
        scheduleRender();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    if (shouldTrackPointer) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    scheduleRender();

    return () => {
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      handleResize.cancel();
      applyMouseMove.cancel();
      window.removeEventListener('resize', handleResize);
      if (shouldTrackPointer) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ══════════════════════════════════════════════════════════
  // 2. TOKENS FLOATING & PARALLAX GSAP TIMELINES
  // ══════════════════════════════════════════════════════════
  useIsomorphicLayoutEffect(() => {
    const isTouch = isTouchDevice();
    const reduceMotion = prefersReducedMotion();
    const shouldTrackPointer = hasFineHoverPointer() && !isTouch;

    if (reduceMotion) return;

    let cleanupPointerParallax: (() => void) | null = null;

    const ctx = gsap.context(() => {
      // 1. Initial entrance for background tokens
      gsap.from('.jlt-bg-token-wrapper', {
        autoAlpha: 0,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.2,
      });

      // 2. Individual Asynchronous Floating & Rotation Loops
      TOKENS.forEach((token) => {
        const el = tokenRefs.current.get(token.id);
        if (!el) return;

        if (token.isWatermark) {
          gsap.to(el, {
            rotation: 10,
            scale: 1.03,
            y: -12,
            duration: token.duration,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        } else {
          const floatTl = gsap.timeline({ repeat: -1, yoyo: true });
          floatTl
            .to(el, {
              y: -16,
              x: 6,
              rotation: 5,
              scale: 1.02,
              duration: token.duration * 0.5,
              ease: 'sine.inOut',
            })
            .to(el, {
              y: 12,
              x: -6,
              rotation: -5,
              scale: 0.98,
              duration: token.duration * 0.5,
              ease: 'sine.inOut',
            });
        }

        // ScrollTrigger Parallax Depth
        gsap.to(el, {
          yPercent: token.parallaxSpeed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.0,
          },
        });
      });

      // 3. Desktop Mouse Parallax Magnetism with Cached Coordinates
      if (shouldTrackPointer) {
        const quickTos = new Map<
          string,
          { x: (v: number) => void; y: (v: number) => void; rot: (v: number) => void }
        >();

        TOKENS.forEach((token) => {
          const el = tokenRefs.current.get(token.id);
          if (!el) return;
          quickTos.set(token.id, {
            x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out', force3D: true }),
            y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out', force3D: true }),
            rot: gsap.quickTo(el, 'rotation', { duration: 0.5, ease: 'power3.out', force3D: true }),
          });
        });

        let tokenPositions: Array<{ id: string; centerX: number; centerY: number }> = [];
        const updateTokenPositions = () => {
          tokenPositions = TOKENS.map((token) => {
            const el = tokenRefs.current.get(token.id);
            if (!el) return { id: token.id, centerX: 0, centerY: 0 };
            const rect = el.getBoundingClientRect();
            return {
              id: token.id,
              centerX: rect.left + rect.width / 2,
              centerY: rect.top + rect.height / 2,
            };
          });
        };

        updateTokenPositions();
        const scheduleTokenPositionUpdate = createRafThrottle(updateTokenPositions);
        const resizeTokenPositionUpdate = createDebouncedCallback(updateTokenPositions, 140);

        let mouseRaf: number | null = null;
        let lastClientX = 0;
        let lastClientY = 0;

        const processMouseMove = () => {
          mouseRaf = null;
          const maxRadius = 400;

          tokenPositions.forEach(({ id, centerX, centerY }) => {
            const setters = quickTos.get(id);
            if (!setters || (centerX === 0 && centerY === 0)) return;

            const dist = Math.hypot(lastClientX - centerX, lastClientY - centerY);

            if (dist < maxRadius) {
              const force = (1 - dist / maxRadius) * 14;
              const angle = Math.atan2(lastClientY - centerY, lastClientX - centerX);
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

        const handleMouseMove = (e: MouseEvent) => {
          lastClientX = e.clientX;
          lastClientY = e.clientY;
          if (!mouseRaf) {
            mouseRaf = requestAnimationFrame(processMouseMove);
          }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('resize', resizeTokenPositionUpdate, { passive: true });
        window.addEventListener('scroll', scheduleTokenPositionUpdate, { passive: true });

        cleanupPointerParallax = () => {
          if (mouseRaf) cancelAnimationFrame(mouseRaf);
          scheduleTokenPositionUpdate.cancel();
          resizeTokenPositionUpdate.cancel();
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('resize', resizeTokenPositionUpdate);
          window.removeEventListener('scroll', scheduleTokenPositionUpdate);
        };
      }
    }, containerRef);

    return () => {
      cleanupPointerParallax?.();
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 top-0 bottom-0 w-full overflow-hidden pointer-events-none z-0 select-none"
      aria-hidden="true"
    >
      {/* ── Fixed Viewport Interactive Energy Canvas (Visible Across All Sections) ── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* ── Floating JLT Tokens & Celestial Watermarks ── */}
      {TOKENS.map((token) => {
        const size = token.isWatermark ? `clamp(180px, 28vw, ${token.size}px)` : `${token.size}px`;
        const style: React.CSSProperties = {
          position: 'absolute',
          top: token.top,
          left: token.left,
          right: token.right,
          width: size,
          height: size,
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
            className={`jlt-bg-token-wrapper ${token.size > 80 && !token.isWatermark ? 'hidden sm:flex' : 'flex'} items-center justify-center will-change-transform`}
            style={style}
          >
            {/* Ambient Backlight Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#360C9F]/40 via-[#7B2CBF]/30 to-[#FFA28D]/25 blur-xl scale-125" />

            {token.symbolType === 'star' ? (
              <span className="text-[#FFA28D] font-gilroyBold text-4xl filter drop-shadow-[0_0_15px_rgba(255,162,141,0.6)]">
                ✦
              </span>
            ) : token.symbolType === 'diamond' ? (
              <span className="text-[#00F0FF] font-gilroyBold text-4xl filter drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]">
                ◇
              </span>
            ) : (
              <img
                src="/jltcolor.svg"
                alt=""
                width={token.size}
                height={token.size}
                loading="lazy"
                decoding="async"
                className="relative w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,162,141,0.5)]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default JLTBackgroundMotion;

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, isTouchDevice, hasFineHoverPointer, createRafThrottle } from '@/lib/animations';

const TRAIL_COUNT = 12; // 12 trailing dots for the smooth comet tail
const BURST_COUNT = 6;  // 6 click burst particles

interface TrailDotConfig {
  size: number;
  color: string;
  glow: string;
  baseOpacity: number;
  duration: number;
}

const TRAIL_CONFIGS: TrailDotConfig[] = [
  { size: 7.0, color: '#FFFFFF', glow: '0 0 10px rgba(255,255,255,0.9), 0 0 16px rgba(255,162,141,0.8)', baseOpacity: 0.90, duration: 0.09 },
  { size: 6.5, color: '#FFFFFF', glow: '0 0 9px rgba(255,255,255,0.8), 0 0 14px rgba(255,162,141,0.7)',  baseOpacity: 0.82, duration: 0.12 },
  { size: 6.0, color: '#FFA28D', glow: '0 0 9px rgba(255,162,141,0.9), 0 0 15px rgba(226,128,255,0.7)', baseOpacity: 0.74, duration: 0.15 },
  { size: 5.5, color: '#FFA28D', glow: '0 0 8px rgba(255,162,141,0.8), 0 0 14px rgba(140,82,255,0.6)',  baseOpacity: 0.66, duration: 0.18 },
  { size: 5.0, color: '#E280FF', glow: '0 0 8px rgba(226,128,255,0.8), 0 0 13px rgba(140,82,255,0.7)', baseOpacity: 0.58, duration: 0.21 },
  { size: 4.5, color: '#8C52FF', glow: '0 0 8px rgba(140,82,255,0.9), 0 0 14px rgba(0,240,255,0.6)',   baseOpacity: 0.50, duration: 0.24 },
  { size: 4.0, color: '#8C52FF', glow: '0 0 7px rgba(140,82,255,0.8), 0 0 12px rgba(0,240,255,0.5)',   baseOpacity: 0.42, duration: 0.27 },
  { size: 3.5, color: '#00F0FF', glow: '0 0 7px rgba(0,240,255,0.9), 0 0 12px rgba(54,12,159,0.7)',    baseOpacity: 0.35, duration: 0.30 },
  { size: 3.0, color: '#00F0FF', glow: '0 0 6px rgba(0,240,255,0.8), 0 0 10px rgba(54,12,159,0.6)',    baseOpacity: 0.28, duration: 0.33 },
  { size: 2.8, color: '#360C9F', glow: '0 0 6px rgba(54,12,159,0.9), 0 0 10px rgba(140,82,255,0.5)',   baseOpacity: 0.22, duration: 0.36 },
  { size: 2.5, color: '#360C9F', glow: '0 0 5px rgba(54,12,159,0.8)',                                     baseOpacity: 0.16, duration: 0.39 },
  { size: 2.2, color: '#360C9F', glow: '0 0 4px rgba(54,12,159,0.7)',                                     baseOpacity: 0.10, duration: 0.42 },
];

export const CustomCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shockwaveRef = useRef<HTMLDivElement>(null);
  const burstRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [mounted, setMounted] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [cursorState, setCursorState] = useState<'default' | 'pointer' | 'cta' | 'card' | 'reward'>('default');

  const cursorStateRef = useRef(cursorState);
  cursorStateRef.current = cursorState;
  const cursorTextRef = useRef(cursorText);
  cursorTextRef.current = cursorText;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTouchDevice() || !hasFineHoverPointer() || prefersReducedMotion()) return;

    const container = containerRef.current;
    const head = headRef.current;
    const shockwave = shockwaveRef.current;
    if (!container || !head) return;

    const ctx = gsap.context(() => {
      // ══════════════════════════════════════════════════════════
      // 1. GSAP quickTo SETTERS FOR HEAD AND ALL 12 TRAIL DOTS
      // ══════════════════════════════════════════════════════════
      // Main Cursor Head: immediate follow (0.06s)
      const headX = gsap.quickTo(head, 'x', { duration: 0.06, ease: 'power3.out', force3D: true });
      const headY = gsap.quickTo(head, 'y', { duration: 0.06, ease: 'power3.out', force3D: true });
      const headScale = gsap.quickTo(head, 'scale', { duration: 0.25, ease: 'power2.out', force3D: true });

      // 12 Trailing Dots: each follows with increasing staggered duration (0.09s -> 0.42s)
      const trailSetters = TRAIL_CONFIGS.map((config, index) => {
        const el = trailRefs.current[index];
        if (!el) return null;
        return {
          x: gsap.quickTo(el, 'x', { duration: config.duration, ease: 'power3.out', force3D: true }),
          y: gsap.quickTo(el, 'y', { duration: config.duration, ease: 'power3.out', force3D: true }),
          scale: gsap.quickTo(el, 'scale', { duration: 0.22, ease: 'power2.out', force3D: true }),
          opacity: gsap.quickTo(el, 'opacity', { duration: 0.22, ease: 'power2.out' }),
        };
      });

      let isVisible = false;
      let prevX = 0;
      let prevY = 0;

      // ══════════════════════════════════════════════════════════
      // 2. POINTER MOVE: PASS COORDINATES TO HEAD & ALL 12 TRAIL DOTS
      // ══════════════════════════════════════════════════════════
      const applyPointerMove = createRafThrottle((clientX: number, clientY: number, eventTarget: EventTarget | null) => {
        if (!isVisible) {
          isVisible = true;
          gsap.to(container, { opacity: 1, duration: 0.2, overwrite: 'auto' });
        }

        // Pass coordinates to head
        headX(clientX);
        headY(clientY);

        // Pass coordinates to all 12 trailing dots (inertia creates the comet tail)
        trailSetters.forEach((setter) => {
          if (setter) {
            setter.x(clientX);
            setter.y(clientY);
          }
        });

        // Calculate movement velocity
        const deltaX = clientX - prevX;
        const deltaY = clientY - prevY;
        const speed = Math.hypot(deltaX, deltaY);
        prevX = clientX;
        prevY = clientY;

        // Check hovered interactive elements
        const target = eventTarget as HTMLElement | null;
        const cursorTarget = target ? (target.closest('[data-cursor]') as HTMLElement | null) : null;
        const clickableTarget = target ? (target.closest('a, button, [role="button"], input, select') as HTMLElement | null) : null;

        let nextState: 'default' | 'pointer' | 'cta' | 'card' | 'reward' = 'default';
        let nextText = '';

        if (cursorTarget) {
          const type = cursorTarget.getAttribute('data-cursor');
          const text = cursorTarget.getAttribute('data-cursor-text') || '';

          if (type === 'cta') {
            nextState = 'cta';
            nextText = text || 'START →';
          } else if (type === 'card') {
            nextState = 'card';
            nextText = text || 'PREVIEW';
          } else if (type === 'reward') {
            nextState = 'reward';
            nextText = text || 'COLLECT';
          } else {
            nextState = 'pointer';
            nextText = text;
          }
        } else if (clickableTarget) {
          nextState = 'pointer';
          nextText = '';
        }

        if (nextState !== cursorStateRef.current) {
          setCursorState(nextState);
        }
        if (nextText !== cursorTextRef.current) {
          setCursorText(nextText);
        }

        // On hover over interactive items, scale head up to 1.8x
        const isHoveringInteractive = nextState !== 'default';
        const isFast = speed > 16;

        if (isHoveringInteractive) {
          headScale(1.8);
        } else {
          headScale(1.0);
        }

        // Velocity stretch: slightly boost scale and opacity on fast movements
        trailSetters.forEach((setter, index) => {
          if (!setter) return;
          const baseConfig = TRAIL_CONFIGS[index];
          const scaleBonus = isFast ? 1.25 : isHoveringInteractive ? 1.15 : 1.0;
          const opacityBonus = isFast ? Math.min(1, baseConfig.baseOpacity * 1.3) : baseConfig.baseOpacity;

          setter.scale(scaleBonus);
          setter.opacity(opacityBonus);
        });
      });

      const handlePointerMove = (e: PointerEvent) => {
        applyPointerMove(e.clientX, e.clientY, e.target);
      };

      // ══════════════════════════════════════════════════════════
      // 3. POINTER DOWN: COSMIC CLICK BURST EFFECT
      // ══════════════════════════════════════════════════════════
      const handlePointerDown = (e: PointerEvent) => {
        const clientX = e.clientX;
        const clientY = e.clientY;

        // 1. Expanding shockwave ring (0.35s)
        if (shockwave) {
          gsap.fromTo(
            shockwave,
            {
              x: clientX,
              y: clientY,
              scale: 0.2,
              opacity: 0.85,
            },
            {
              scale: 1.8,
              opacity: 0,
              duration: 0.35,
              ease: 'power2.out',
              force3D: true,
              overwrite: 'auto',
            }
          );
        }

        // 2. 6 outward burst dots
        burstRefs.current.forEach((burstEl, i) => {
          if (!burstEl) return;
          const angle = (i / BURST_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          const distance = 22 + Math.random() * 10;
          const targetX = clientX + Math.cos(angle) * distance;
          const targetY = clientY + Math.sin(angle) * distance;

          gsap.killTweensOf(burstEl);
          gsap.fromTo(
            burstEl,
            {
              x: clientX,
              y: clientY,
              scale: 1.1,
              opacity: 0.95,
            },
            {
              x: targetX,
              y: targetY,
              scale: 0,
              opacity: 0,
              duration: 0.35,
              ease: 'power2.out',
              force3D: true,
            }
          );
        });
      };

      const handlePointerLeave = () => {
        applyPointerMove.cancel();
        isVisible = false;
        gsap.to(container, { opacity: 0, duration: 0.25, overwrite: 'auto' });
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerdown', handlePointerDown, { passive: true });
      document.addEventListener('pointerleave', handlePointerLeave);

      return () => {
        applyPointerMove.cancel();
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('pointerleave', handlePointerLeave);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Don't render during SSR, or on touch / reduced-motion devices
  if (!mounted || isTouchDevice() || !hasFineHoverPointer() || prefersReducedMotion()) {
    return null;
  }

  const isExpanded = cursorState !== 'default';
  const hasLabel = cursorText.length > 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[99999] opacity-0 will-change-[opacity]"
      aria-hidden="true"
    >
      {/* ── 12 Trailing Cosmic Comet Dots (Decreasing size 7px -> 2.2px & opacity) ── */}
      {TRAIL_CONFIGS.map((config, index) => (
        <div
          key={index}
          ref={(el) => {
            trailRefs.current[index] = el;
          }}
          className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full will-change-transform"
          style={{
            width: `${config.size}px`,
            height: `${config.size}px`,
            backgroundColor: config.color,
            boxShadow: config.glow,
            opacity: config.baseOpacity,
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
          }}
        />
      ))}

      {/* ── Main Glowing Cursor Head (8px × 8px White Center with Intense Purple/Coral Glow) ── */}
      <div
        ref={headRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full will-change-transform flex items-center justify-center transition-shadow duration-200 ${
          isExpanded
            ? 'w-2.5 h-2.5 bg-white shadow-[0_0_12px_#FFFFFF,0_0_22px_#00F0FF,0_0_32px_#FFA28D]'
            : 'w-2 h-2 bg-white shadow-[0_0_10px_#FFFFFF,0_0_18px_#8C52FF,0_0_28px_#FFA28D]'
        }`}
        style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
      >
        {/* Dynamic Label on Hovering Specific Badged Items */}
        {hasLabel && (
          <span
            ref={labelRef}
            className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#180C30]/90 border border-[#FFA28D]/60 text-[10px] font-gilroyBold text-white uppercase tracking-wider shadow-[0_0_15px_rgba(54,12,159,0.8)] backdrop-blur-sm"
          >
            {cursorText}
          </span>
        )}
      </div>

      {/* ── Click Expanding Shockwave Ring (0.35s) ── */}
      <div
        ref={shockwaveRef}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-[#00F0FF] shadow-[0_0_18px_#00F0FF,0_0_30px_#8C52FF] pointer-events-none opacity-0 will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0) scale(0)' }}
      />

      {/* ── 6 Outward Click Burst Particles ── */}
      {Array.from({ length: BURST_COUNT }).map((_, idx) => (
        <div
          key={`burst-${idx}`}
          ref={(el) => {
            burstRefs.current[idx] = el;
          }}
          className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#FFA28D,0_0_14px_#00F0FF] pointer-events-none opacity-0 will-change-transform"
          style={{ transform: 'translate3d(0, 0, 0) scale(0)' }}
        />
      ))}
    </div>
  );
};

export default CustomCursor;

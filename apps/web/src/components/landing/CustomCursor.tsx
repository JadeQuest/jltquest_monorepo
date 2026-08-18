'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, isTouchDevice } from '@/lib/animations';

export const CustomCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);

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
    if (isTouchDevice() || prefersReducedMotion()) return;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    const container = containerRef.current;
    if (!dot || !ring || !container) return;

    // High-performance GSAP quickTo setters with spring inertia & force3D
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out', force3D: true });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out', force3D: true });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.18, ease: 'power3.out', force3D: true });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.18, ease: 'power3.out', force3D: true });
    const ringScaleX = gsap.quickTo(ring, 'scaleX', { duration: 0.22, ease: 'power2.out', force3D: true });
    const ringScaleY = gsap.quickTo(ring, 'scaleY', { duration: 0.22, ease: 'power2.out', force3D: true });
    const ringRotation = gsap.quickTo(ring, 'rotation', { duration: 0.22, ease: 'power2.out', force3D: true });

    let isVisible = false;
    let prevX = 0;
    let prevY = 0;
    let velocityTimer: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        isVisible = true;
        gsap.to(container, { opacity: 1, duration: 0.2, overwrite: 'auto' });
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      dotX(clientX);
      dotY(clientY);
      ringX(clientX);
      ringY(clientY);

      // Velocity vector for smooth organic stretch
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      const speed = Math.hypot(deltaX, deltaY);
      const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      prevX = clientX;
      prevY = clientY;

      // Stretch distortion
      const stretch = Math.min(speed * 0.004, 0.4);
      ringScaleX(1 + stretch);
      ringScaleY(1 - stretch * 0.5);
      ringRotation(angle);

      // Snap back when motion pauses
      if (velocityTimer) clearTimeout(velocityTimer);
      velocityTimer = setTimeout(() => {
        ringScaleX(1);
        ringScaleY(1);
      }, 60);

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null;
      const clickableTarget = target.closest('a, button, [role="button"], input, select') as HTMLElement | null;

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
          nextText = text || 'VIEW QUEST';
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
    };

    const handleMouseLeave = () => {
      isVisible = false;
      gsap.to(container, { opacity: 0, duration: 0.25, overwrite: 'auto' });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (velocityTimer) clearTimeout(velocityTimer);
    };
  }, []);

  // Don't render during SSR, or on touch / reduced-motion devices
  if (!mounted || isTouchDevice() || prefersReducedMotion()) {
    return null;
  }

  // Dynamic styling based on cursor hover state
  const isExpanded = cursorState !== 'default';
  const hasLabel = cursorText.length > 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[9999] opacity-0 will-change-[opacity]"
      aria-hidden="true"
    >
      {/* Center Precision Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-150 will-change-transform ${
          hasLabel
            ? 'w-1 h-1 bg-white opacity-0'
            : isExpanded
            ? 'w-2 h-2 bg-[#FFA28D] shadow-[0_0_12px_#FFA28D]'
            : 'w-2.5 h-2.5 bg-gradient-to-r from-[#FFA28D] to-[#8C52FF] shadow-[0_0_10px_rgba(255,162,141,0.8)]'
        }`}
        style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
      />

      {/* Trailing Aura Ring & Label Container */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none flex items-center justify-center transition-all duration-200 will-change-transform ${
          hasLabel
            ? 'w-24 h-24 bg-[#360C9F]/85 border border-[#FFA28D]/80 backdrop-blur-md shadow-[0_0_30px_rgba(54,12,159,0.7)] scale-100'
            : cursorState === 'pointer'
            ? 'w-12 h-12 bg-white/10 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            : 'w-8 h-8 bg-purple-500/10 border border-purple-400/30'
        }`}
        style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
      >
        {hasLabel && (
          <span
            ref={cursorLabelRef}
            className="font-gilroyBold text-[10px] tracking-wider text-white uppercase text-center px-1 animate-fade-in"
          >
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
};

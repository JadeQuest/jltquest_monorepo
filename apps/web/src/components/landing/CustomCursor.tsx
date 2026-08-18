'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, isTouchDevice } from '@/lib/animations';

export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);

  const [mounted, setMounted] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [cursorState, setCursorState] = useState<'default' | 'pointer' | 'cta' | 'card' | 'reward'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    const label = cursorLabelRef.current;
    if (!dot || !ring) return;

    // High-performance quickTo setters with spring inertia
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.22, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.22, ease: 'power3.out' });
    const ringScaleX = gsap.quickTo(ring, 'scaleX', { duration: 0.25, ease: 'power2.out' });
    const ringScaleY = gsap.quickTo(ring, 'scaleY', { duration: 0.25, ease: 'power2.out' });
    const ringRotation = gsap.quickTo(ring, 'rotation', { duration: 0.25, ease: 'power2.out' });

    let prevX = 0;
    let prevY = 0;
    let velocityTimer: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

      const clientX = e.clientX;
      const clientY = e.clientY;

      dotX(clientX);
      dotY(clientY);
      ringX(clientX);
      ringY(clientY);

      // Calculate velocity vector for TRIONN organic stretch
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      const speed = Math.hypot(deltaX, deltaY);
      const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      prevX = clientX;
      prevY = clientY;

      // Organic stretch distortion
      const stretch = Math.min(speed * 0.005, 0.45);
      ringScaleX(1 + stretch);
      ringScaleY(1 - stretch * 0.5);
      ringRotation(angle);

      // Snap back to neutral circular geometry when motion pauses
      if (velocityTimer) clearTimeout(velocityTimer);
      velocityTimer = setTimeout(() => {
        ringScaleX(1);
        ringScaleY(1);
      }, 70);

      // Check hovered element cursor data
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null;
      const clickableTarget = target.closest('a, button, [role="button"], input, select') as HTMLElement | null;

      if (cursorTarget) {
        const type = cursorTarget.getAttribute('data-cursor');
        const text = cursorTarget.getAttribute('data-cursor-text') || '';

        if (type === 'cta') {
          setCursorState('cta');
          setCursorText(text || 'START →');
        } else if (type === 'card') {
          setCursorState('card');
          setCursorText(text || 'VIEW QUEST');
        } else if (type === 'reward') {
          setCursorState('reward');
          setCursorText(text || 'COLLECT');
        } else {
          setCursorState('pointer');
          setCursorText(text);
        }
      } else if (clickableTarget) {
        setCursorState('pointer');
        setCursorText('');
      } else {
        setCursorState('default');
        setCursorText('');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (velocityTimer) clearTimeout(velocityTimer);
    };
  }, [isVisible]);

  // Don't render during SSR, or on touch / reduced-motion devices
  if (!mounted || isTouchDevice() || prefersReducedMotion()) {
    return null;
  }

  // Dynamic styling based on cursor hover state
  const isExpanded = cursorState !== 'default';
  const hasLabel = cursorText.length > 0;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Center Precision Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-200 ${
          hasLabel
            ? 'w-1 h-1 bg-white opacity-0'
            : isExpanded
            ? 'w-2 h-2 bg-[#FFA28D] shadow-[0_0_12px_#FFA28D]'
            : 'w-2.5 h-2.5 bg-gradient-to-r from-[#FFA28D] to-[#8C52FF] shadow-[0_0_10px_rgba(255,162,141,0.8)]'
        }`}
      />

      {/* Trailing Aura Ring & Label Container */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none flex items-center justify-center transition-all duration-300 ${
          hasLabel
            ? 'w-24 h-24 bg-[#360C9F]/85 border border-[#FFA28D]/80 backdrop-blur-md shadow-[0_0_30px_rgba(54,12,159,0.7)] scale-100'
            : cursorState === 'pointer'
            ? 'w-12 h-12 bg-white/10 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            : 'w-8 h-8 bg-purple-500/10 border border-purple-400/30'
        }`}
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

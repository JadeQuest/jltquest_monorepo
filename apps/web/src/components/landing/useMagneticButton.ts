'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MagneticOptions {
  strength?: number;
  maxDistance?: number;
  ease?: string;
  duration?: number;
}

export function useMagneticButton<T extends HTMLElement = HTMLButtonElement>(options: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  const { strength = 0.28, maxDistance = 12, ease = 'power3.out', duration = 0.4 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    if (isTouchDevice) return;

    const xTo = gsap.quickTo(el, 'x', { duration, ease, force3D: true });
    const yTo = gsap.quickTo(el, 'y', { duration, ease, force3D: true });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
      const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

      xTo(clampedX);
      yTo(clampedY);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      xTo(0);
      yTo(0);
    };
  }, [strength, maxDistance, ease, duration]);

  return ref;
}

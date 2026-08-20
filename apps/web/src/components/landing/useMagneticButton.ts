'use client';

import { useEffect, useRef } from 'react';
import { gsap, createRafThrottle, hasFineHoverPointer, isTouchDevice, prefersReducedMotion } from '@/lib/animations';

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

    if (isTouchDevice() || !hasFineHoverPointer() || prefersReducedMotion()) return;

    const xTo = gsap.quickTo(el, 'x', { duration, ease, force3D: true });
    const yTo = gsap.quickTo(el, 'y', { duration, ease, force3D: true });

    let rect = el.getBoundingClientRect();
    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };

    const applyMouseMove = createRafThrottle((clientX: number, clientY: number) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (clientX - centerX) * strength;
      const deltaY = (clientY - centerY) * strength;

      const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
      const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

      xTo(clampedX);
      yTo(clampedY);
    });

    const handleMouseMove = (e: MouseEvent) => {
      applyMouseMove(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      applyMouseMove.cancel();
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mouseenter', updateRect);
    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', updateRect, { passive: true });

    return () => {
      applyMouseMove.cancel();
      el.removeEventListener('mouseenter', updateRect);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updateRect);
      xTo(0);
      yTo(0);
    };
  }, [strength, maxDistance, ease, duration]);

  return ref;
}

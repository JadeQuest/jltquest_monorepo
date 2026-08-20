'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/animations';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const ScrollProgressBar: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = barRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        scaleX: 1,
        ease: 'none',
        force3D: true,
        overwrite: 'auto',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] via-[#FFA28D] to-[#00F0FF] origin-left scale-x-0 pointer-events-none drop-shadow-[0_0_8px_rgba(255,162,141,0.8)]"
      aria-hidden="true"
    />
  );
};

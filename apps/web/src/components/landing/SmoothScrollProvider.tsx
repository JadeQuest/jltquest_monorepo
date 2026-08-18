'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: isTouchDevice ? 1.2 : 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Initial settle refreshes
    const initialRefreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      lenis.resize();
    }, 150);

    const secondaryRefreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      lenis.resize();
    }, 600);

    // Handle external refresh events
    const handleRefresh = () => {
      ScrollTrigger.refresh();
      lenis.resize();
    };

    const handleScrollTo = (e: Event) => {
      const customEvent = e as CustomEvent<{ target: string; offset?: number }>;
      if (customEvent.detail?.target) {
        lenis.scrollTo(customEvent.detail.target, {
          offset: customEvent.detail.offset ?? -40,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    window.addEventListener('resize', handleRefresh);
    window.addEventListener('refresh-scroll-trigger', handleRefresh);
    window.addEventListener('scroll-to-target', handleScrollTo);

    return () => {
      clearTimeout(initialRefreshTimer);
      clearTimeout(secondaryRefreshTimer);
      window.removeEventListener('resize', handleRefresh);
      window.removeEventListener('refresh-scroll-trigger', handleRefresh);
      window.removeEventListener('scroll-to-target', handleScrollTo);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
};

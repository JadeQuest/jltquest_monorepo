'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, createDebouncedCallback, isTouchDevice, prefersReducedMotion } from '@/lib/animations';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isTouch = isTouchDevice();
    const reduceMotion = prefersReducedMotion();

    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: isTouch ? 1.2 : 1.5,
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
    gsap.ticker.lagSmoothing(500, 33);

    const refresh = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    const debouncedRefresh = createDebouncedCallback(refresh, 140);

    // Initial settle refreshes
    const initialRefreshTimer = setTimeout(() => {
      refresh();
    }, 150);

    const secondaryRefreshTimer = setTimeout(() => {
      refresh();
    }, 600);

    // Handle external refresh events
    const handleRefresh = () => {
      debouncedRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
      } else {
        lenis.start();
        debouncedRefresh();
      }
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

    window.addEventListener('resize', handleRefresh, { passive: true });
    window.addEventListener('refresh-scroll-trigger', handleRefresh);
    window.addEventListener('scroll-to-target', handleScrollTo);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialRefreshTimer);
      clearTimeout(secondaryRefreshTimer);
      debouncedRefresh.cancel();
      window.removeEventListener('resize', handleRefresh);
      window.removeEventListener('refresh-scroll-trigger', handleRefresh);
      window.removeEventListener('scroll-to-target', handleScrollTo);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
};

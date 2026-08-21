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

    // On touch devices, native momentum scrolling is already smooth and
    // battery-efficient. Lenis adds overhead and fights the OS gesture system.
    if (reduceMotion || isTouch) return;

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

    // Initial settle once document fonts / layout are ready
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        debouncedRefresh();
      });
    }

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
    window.addEventListener('load', handleRefresh);
    window.addEventListener('refresh-scroll-trigger', handleRefresh);
    window.addEventListener('scroll-to-target', handleScrollTo);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      debouncedRefresh.cancel();
      window.removeEventListener('resize', handleRefresh);
      window.removeEventListener('load', handleRefresh);
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

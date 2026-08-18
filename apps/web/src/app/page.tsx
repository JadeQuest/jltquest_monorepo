'use client';

import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from '@/components/landing/LandingPage';
import Splash from '@/app/Splash';
import { ScrollTrigger } from '@/lib/animations';

type ViewState = 'splash' | 'transitioning' | 'landing';

export default function HomePage() {
  const [viewState, setViewState] = useState<ViewState>('splash');

  // Control Lenis scrolling during splash overlay
  useEffect(() => {
    if (viewState === 'splash' || viewState === 'transitioning') {
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && window.__lenis) {
        window.__lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      if (typeof window !== 'undefined' && window.__lenis) {
        window.__lenis.start();
        window.__lenis.resize();
        ScrollTrigger.refresh();
      }
    }
  }, [viewState]);

  const handleStartTransition = useCallback(() => {
    setViewState('transitioning');
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setViewState('landing');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refresh-scroll-trigger'));
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (window.__lenis) {
          window.__lenis.start();
          window.__lenis.resize();
        }
      });
    }
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-[#080411]">
      {/* Landing page mounted in natural document flow */}
      <div className="w-full min-h-screen">
        <LandingPage />
      </div>

      {/* Splash overlay active strictly during splash and transitioning states */}
      {viewState !== 'landing' && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
          <Splash
            onStartTransition={handleStartTransition}
            onComplete={handleTransitionComplete}
          />
        </div>
      )}
    </main>
  );
}

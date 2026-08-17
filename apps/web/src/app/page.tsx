'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Splash from '@/app/Splash';

const LandingPage = dynamic(() => import('@/components/landing/LandingPage'), {
  ssr: false,
  loading: () => <div className="min-h-screen w-full bg-[#080411]" aria-hidden="true" />,
});

type ViewState = 'splash' | 'transitioning' | 'landing';

const scheduleIdleTask = (task: () => void) => {
  const requestIdle = window.requestIdleCallback?.bind(window);
  const cancelIdle = window.cancelIdleCallback?.bind(window);

  if (requestIdle && cancelIdle) {
    const idleId = requestIdle(task, { timeout: 1200 });
    return () => cancelIdle(idleId);
  }

  const timeoutId = globalThis.setTimeout(task, 350);
  return () => globalThis.clearTimeout(timeoutId);
};

export default function HomePage() {
  const [viewState, setViewState] = useState<ViewState>('splash');

  useEffect(() => {
    const cancelIdleTask = scheduleIdleTask(() => {
      void import('@/components/landing/LandingPage');
    });

    return cancelIdleTask;
  }, []);

  // Lock body scroll during splash and transition states
  useEffect(() => {
    if (viewState === 'splash' || viewState === 'transitioning') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [viewState]);

  const handleStartTransition = useCallback(() => {
    setViewState('transitioning');
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setViewState('landing');
  }, []);

  return (
    <main className={`relative w-full min-h-screen bg-[#080411] ${viewState === 'landing' ? '' : 'overflow-hidden'}`}>
      {/* Landing page mounts ONLY when transitioning or active */}
      {(viewState === 'transitioning' || viewState === 'landing') && (
        <div className={viewState === 'transitioning' ? 'fixed inset-0 z-0 overflow-hidden pointer-events-none' : 'w-full min-h-screen'}>
          <LandingPage />
        </div>
      )}

      {/* Splash overlay active strictly during splash and transitioning states */}
      {viewState !== 'landing' && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <Splash
            onStartTransition={handleStartTransition}
            onComplete={handleTransitionComplete}
          />
        </div>
      )}
    </main>
  );
}

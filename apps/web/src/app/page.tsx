'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Splash from '@/app/Splash';
import LandingPage from '@/components/landing/LandingPage';

type ViewState = 'splash' | 'transitioning' | 'landing';

export default function HomePage() {
  const [viewState, setViewState] = useState<ViewState>('splash');

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
    <main className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Landing page mounts ONLY when transitioning or active */}
      {(viewState === 'transitioning' || viewState === 'landing') && (
        <div className={viewState === 'transitioning' ? 'fixed inset-0 z-0 overflow-hidden pointer-events-none' : 'w-full min-h-screen'}>
          <LandingPage />
        </div>
      )}

      {/* Splash overlay active strictly during splash and transitioning states */}
      {viewState !== 'landing' && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black">
          <Splash
            onStartTransition={handleStartTransition}
            onComplete={handleTransitionComplete}
          />
        </div>
      )}
    </main>
  );
}

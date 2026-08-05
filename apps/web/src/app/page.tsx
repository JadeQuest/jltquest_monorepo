'use client';

import React, { useState, useCallback } from 'react';
import Splash from '@/app/Splash';
import LandingPage from '@/components/landing/LandingPage';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleEnter = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <Splash onClick={handleEnter} />;
  }

  return <LandingPage />;
}

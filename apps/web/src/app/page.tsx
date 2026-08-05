'use client';

import { useState } from 'react';
import Splash from '@/app/Splash';
import LandingPage from '@/components/landing/LandingPage';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onClick={() => setShowSplash(false)} />;
  }

  return <LandingPage />;
}


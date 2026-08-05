'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';

// Dynamic Code Splitting for below-the-fold sections
const FeaturesSection = dynamic(() => import('./FeaturesSection').then((mod) => mod.FeaturesSection), {
  ssr: true,
});
const HowItWorksSection = dynamic(() => import('./HowItWorksSection').then((mod) => mod.HowItWorksSection), {
  ssr: true,
});
const CTASection = dynamic(() => import('./CTASection').then((mod) => mod.CTASection), {
  ssr: true,
});
const LandingFooter = dynamic(() => import('./LandingFooter').then((mod) => mod.LandingFooter), {
  ssr: true,
});

/**
 * LandingPage
 * Full public-facing landing page for JLTQuest.
 * Optimized with code splitting, instant hero hydration, and zero main thread blocking.
 */
const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#080411] text-white overflow-x-hidden select-none font-gilroyRegular antialiased">
      {/* Fixed navigation bar */}
      <LandingNav />

      {/* Hero section */}
      <HeroSection />

      {/* Lazy code-split below-the-fold sections */}
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default React.memo(LandingPage);

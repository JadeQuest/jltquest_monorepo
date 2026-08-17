'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { LandingFooter } from './LandingFooter';
import { JLTBackgroundMotion } from './JLTBackgroundMotion';
import { ScrollProgressBar } from './ScrollProgressBar';
import { SmoothScrollProvider } from './SmoothScrollProvider';

// Dynamic Code Splitting for heavy below-the-fold sections
const FeaturesSection = dynamic(() => import('./FeaturesSection').then((mod) => mod.FeaturesSection), {
  ssr: true,
});
const HowItWorksSection = dynamic(() => import('./HowItWorksSection').then((mod) => mod.HowItWorksSection), {
  ssr: true,
});
const CTASection = dynamic(() => import('./CTASection').then((mod) => mod.CTASection), {
  ssr: true,
});

/**
 * LandingPage
 * Full public-facing landing page for JLTQuest with Lenis Smooth Scrolling,
 * Scroll-linked progress bar, and living JLT Background Token Motion.
 */
const LandingPage: React.FC = () => {
  return (
    <SmoothScrollProvider>
      <div className="relative w-full min-h-screen bg-[#080411] text-white overflow-x-hidden select-none font-gilroyRegular antialiased">
        {/* Scroll Progress Indicator */}
        <ScrollProgressBar />

        {/* Floating Living JLT Token Motion System */}
        <JLTBackgroundMotion />

        {/* Fixed navigation bar */}
        <LandingNav />

        {/* Hero section */}
        <div className="relative z-10">
          <HeroSection />
        </div>

        {/* Lazy code-split below-the-fold sections */}
        <div className="relative z-10">
          <FeaturesSection />
          <HowItWorksSection />
          <CTASection />
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <LandingFooter />
        </div>
      </div>
    </SmoothScrollProvider>
  );
};

export default React.memo(LandingPage);

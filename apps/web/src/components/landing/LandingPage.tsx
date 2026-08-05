'use client';

import React from 'react';
import {
  LandingNav,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

/**
 * LandingPage
 * Full public-facing landing page for JLTQuest.
 * Composed of modular section components for easy maintenance.
 */
const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#080411] text-white overflow-x-hidden select-none font-gilroyRegular">
      {/* Fixed navigation bar */}
      <LandingNav />

      {/* Page sections */}
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;

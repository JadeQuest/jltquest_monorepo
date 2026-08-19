'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { LandingFooter } from './LandingFooter';
import { JLTBackgroundMotion } from './JLTBackgroundMotion';
import { ScrollProgressBar } from './ScrollProgressBar';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import { CustomCursor } from './CustomCursor';

import { CosmicOriginsSection } from './CosmicOriginsSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CTASection } from './CTASection';

/**
 * LandingPage
 * Full public-facing landing page for JLTQuest with TRIONN & MetaMask interaction philosophy:
 * Lenis Smooth Scrolling, ScrollTrigger synchronized progress, living background motion,
 * custom cursor, magnetic button pulls, 3D card perspective, and cinematic page transitions.
 */
const LandingPage: React.FC = () => {
  return (
    <SmoothScrollProvider>
      <div className="relative w-full min-h-screen bg-[#080411] text-white overflow-x-hidden select-none font-gilroyRegular antialiased">
        {/* Global Desktop Custom Cursor */}
        <CustomCursor />

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

        {/* Season 01: Cosmic Origins Showcase Section */}
        <div className="relative z-10">
          <CosmicOriginsSection />
        </div>

        {/* Below-the-fold sections */}
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

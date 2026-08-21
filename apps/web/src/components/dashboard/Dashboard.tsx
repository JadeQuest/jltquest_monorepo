'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { gsap, prefersReducedMotion, MotionEases } from '@/lib/animations';
import { LevelCard } from './LevelCard';
import { StreakCard } from './StreakCard';
import { DailyCheckInCard } from './DailyCheckInCard';
import { SpinToWinCard } from './SpinToWinCard';
import { CollectRaresCard } from './CollectRaresCard';
import { RarePassCard } from './RarePassCard';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const Dashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-card-item',
        {
          opacity: 0,
          y: 20,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.06,
          ease: MotionEases.backOut,
          force3D: true,
          overwrite: 'auto',
          clearProps: 'transform,opacity',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto select-none">
      {/* Top Row Cards */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="dash-card-item col-span-6 lg:col-span-3 will-change-transform">
          <LevelCard />
        </div>

        <div className="dash-card-item col-span-6 lg:col-span-3 will-change-transform">
          <StreakCard />
        </div>

        <div className="dash-card-item col-span-12 lg:col-span-6 will-change-transform">
          <DailyCheckInCard />
        </div>
      </div>

      {/* Middle Row Cards */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="dash-card-item col-span-6 lg:col-span-3 will-change-transform">
          <SpinToWinCard />
        </div>

        <div className="dash-card-item col-span-6 lg:col-span-3 will-change-transform">
          <CollectRaresCard />
        </div>

        <div className="dash-card-item col-span-12 lg:col-span-6 will-change-transform">
          <RarePassCard />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
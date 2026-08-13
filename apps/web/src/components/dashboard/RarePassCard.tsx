'use client';

import React from 'react';
import { useRarePass } from '@/hooks/useRarePass';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const RarePassCardComponent: React.FC = () => {
  const { isConnected } = useAccount();
  const { status } = useRarePass();

  const seasonName = status?.season?.name || 'Season 01: Cosmic Origins';
  const currentLevel = status?.progression?.currentLevel ?? 1;
  const totalRpXp = status?.progression?.totalRpXp ?? 0;
  const xpInCurrentLevel = status?.progression?.xpInCurrentLevel ?? 0;
  const xpRequiredForNext = status?.progression?.xpRequiredForNext ?? 100;
  const progressPercent = status?.progression?.progress ?? 0;
  const isPremium = status?.progression?.isPremium ?? false;

  return (
    <div className="cosmic-space-card glass-panel p-5 sm:p-6 flex flex-col justify-between h-[320px] sm:h-[360px] relative overflow-hidden group select-none">
      {/* Base Dark Background */}
      <div className="absolute inset-0 bg-[#180C30] z-0" />

      {/* Full Background Official RarePassBG SVG */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden rounded-[25px]">
        <img
          src="/rare-pass-bg.webp"
          alt="Rare Pass Background"
          width={709}
          height={401}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
        />
        {/* Dark Vignette / Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#180C30]/90 via-[#180C30]/60 to-transparent" />
      </div>

      {/* Floating Constellation Sparkle Accents */}
      <div className="absolute top-6 right-10 text-yellow-300 opacity-90 animate-sparkle z-10">✦</div>
      <div className="absolute top-16 right-28 text-purple-300 opacity-70 animate-sparkle z-10" style={{ animationDelay: '1.2s' }}>★</div>
      <div className="absolute bottom-20 left-1/3 text-pink-300 opacity-80 animate-sparkle z-10" style={{ animationDelay: '2.5s' }}>✦</div>

      {/* Card Text Content */}
      <div className="flex flex-col gap-2 z-20 max-w-[360px]">
        <h2 className="text-white font-gilroyBold text-2xl font-bold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          {seasonName}
        </h2>

        <p className="text-purple-200 font-gilroyRegular text-xs sm:text-sm font-normal leading-relaxed opacity-95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Earn RP XP from quests, check-ins & spins to level up your pass and unlock exclusive rewards.
        </p>

        {/* RP XP Progress Bar */}
        {isConnected && status && (
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between items-center text-xs text-purple-200 font-gilroyMedium">
              <span className="font-gilroyBold text-white">Level {currentLevel}</span>
              <span>
                {xpInCurrentLevel} / {xpRequiredForNext} RP XP ({totalRpXp} Total)
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full p-0.5 border border-purple-500/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] via-[#7B2CBF] to-[#FFA28D] transition-all duration-500 shadow-[0_0_10px_#00F0FF]"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-3">
          <Link href="/dashboard/rare-pass">
            <button className="glass-btn px-5 py-2 rounded-xl text-white font-gilroyMedium text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(54,12,159,0.5)] hover:shadow-[0_0_25px_#FFA28D] transition-all">
              {isConnected && status ? 'View Pass & Missions →' : 'Explore Pass →'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const RarePassCard = React.memo(RarePassCardComponent);

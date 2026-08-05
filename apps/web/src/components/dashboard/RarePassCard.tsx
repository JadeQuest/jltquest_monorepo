'use client';

import React from 'react';

export const RarePassCard: React.FC = () => {
  return (
    <div className="cosmic-space-card glass-panel p-6 flex flex-col justify-between h-[360px] relative overflow-hidden group select-none">
      {/* Base Dark Background */}
      <div className="absolute inset-0 bg-[#180C30] z-0" />

      {/* Full Background Official RarePassBG SVG */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden rounded-[25px]">
        <img
          src="/RarePassBG.svg"
          alt="Rare Pass Background"
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
        />
        {/* Dark Vignette / Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#180C30]/80 via-[#180C30]/30 to-transparent" />
      </div>

      {/* Floating Constellation Sparkle Accents */}
      <div className="absolute top-6 right-10 text-yellow-300 opacity-90 animate-sparkle z-10">✦</div>
      <div className="absolute top-16 right-28 text-purple-300 opacity-70 animate-sparkle z-10" style={{ animationDelay: '1.2s' }}>★</div>
      <div className="absolute bottom-20 left-1/3 text-pink-300 opacity-80 animate-sparkle z-10" style={{ animationDelay: '2.5s' }}>✦</div>

      {/* Card Text Content (Top Left Aligned) */}
      <div className="flex flex-col gap-2 z-20 max-w-[340px]">
        <h2 className="text-white font-gilroyBold text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          Rare Pass
        </h2>
        <p className="text-purple-200 font-gilroyRegular text-base font-normal leading-relaxed opacity-95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Collect and Open Rare Passes for a special reveal on Mainnet
        </p>

        {/* View Coin CTA Button */}
        <div className="mt-3">
          <button className="glass-btn px-6 py-2 rounded-xl text-white font-gilroyMedium text-base font-semibold tracking-wide shadow-[0_0_20px_rgba(54,12,159,0.5)] hover:shadow-[0_0_25px_#FFA28D]">
            View Coin
          </button>
        </div>
      </div>
    </div>
  );
};

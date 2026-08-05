'use client';

import React from 'react';
import Link from 'next/link';

export const CTASection: React.FC = () => {
  return (
    <section id="rewards" className="relative w-full py-24 px-6 overflow-hidden bg-[#080411]">
      {/* Top separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-[#7B2CBF]/60 to-transparent" />

      {/* Ambient blurs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[400px] rounded-full bg-radial from-[#360C9F]/30 via-[#340073]/15 to-transparent blur-[140px]" />
      </div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-radial from-[#FFA28D]/10 via-transparent to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 text-center relative z-10">
        {/* Mascot decorative */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-radial from-[#360C9F]/60 via-[#7B2CBF]/30 to-transparent blur-2xl scale-150" />
          <img
            src="/Mascot.svg"
            alt="JLT Quest Mascot"
            className="relative w-36 h-36 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-float"
          />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h2 className="font-gilroyBold text-6xl text-white tracking-tight leading-tight">
            Ready to Start Your
          </h2>
          <h2 className="font-gilroyBold text-6xl tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] via-[#CC66FF] to-[#360C9F]">
              Quest Journey?
            </span>
          </h2>
        </div>

        <p className="font-gilroyRegular text-gray-400 text-xl max-w-[520px] leading-relaxed">
          Join thousands of players already earning JLT coins inside the JaxMart ecosystem. Your quests await.
        </p>

        {/* Coin counter decoration */}
        <div className="flex items-center gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-pill px-5 py-2.5 flex items-center gap-2.5 animate-float"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <img src="/Coin.svg" alt="JLT Coin" className="w-6 h-6 object-contain animate-sparkle" style={{ animationDelay: `${i * 0.3}s` }} />
              <span className="font-gilroyBold text-white text-sm">
                {i === 1 ? '+250 Coins' : i === 2 ? 'Rare Drop' : '2× Bonus'}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="/dashboard"
          id="cta-enter-app-btn"
          className="glass-btn px-12 py-5 rounded-2xl font-gilroyBold text-white text-xl tracking-wide shadow-[0_0_40px_rgba(54,12,159,0.6)] flex items-center gap-3 group hover:shadow-[0_0_60px_rgba(255,162,141,0.4)] transition-shadow duration-300"
        >
          Enter JLTQuest
          <svg
            className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="font-gilroyRegular text-gray-600 text-sm">
          Free to play · No downloads required · Powered by JaxMart
        </p>
      </div>
    </section>
  );
};

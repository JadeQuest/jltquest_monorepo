'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

// Animated floating particle
const Particle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={style}
  />
);

export const HeroSection: React.FC = () => {
  const particlesRef = useRef<Array<{ x: number; y: number; size: number; opacity: number; color: string }>>([]);

  // Generate stable particle data on first render
  if (particlesRef.current.length === 0) {
    const colors = ['#FFA28D', '#360C9F', '#7B2CBF', '#340073', '#ffffff'];
    particlesRef.current = Array.from({ length: 40 }, (_, i) => ({
      x: (i * 7.3 + 13) % 100,
      y: (i * 11.7 + 5) % 100,
      size: (i % 4) + 2,
      opacity: ((i % 5) + 2) / 10,
      color: colors[i % colors.length],
    }));
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#080411]">
      {/* Ambient Background Blurs */}
      <div className="absolute top-[-150px] left-[-200px] w-[700px] h-[700px] rounded-full bg-radial from-[#360C9F]/60 via-[#340073]/30 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-150px] w-[800px] h-[800px] rounded-full bg-radial from-[#7B2CBF]/45 via-[#340073]/20 to-transparent blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-radial from-[#FFA28D]/20 via-transparent to-transparent blur-[110px] pointer-events-none" />

      {/* Floating Particles */}
      {particlesRef.current.map((p, i) => (
        <Particle
          key={i}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: p.opacity,
            animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.3) % 3}s`,
          }}
        />
      ))}

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col items-start gap-8">
          {/* Badge */}
          <div className="glass-pill px-5 py-2 flex items-center gap-2.5 animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <img src="/Flame.svg" alt="Hot" className="w-5 h-5 object-contain animate-flame" />
            <span className="font-gilroyMedium text-sm text-white/90 tracking-wider uppercase">
              A Trusted Partner of JaxMart
            </span>
          </div>

          {/* Main Heading */}
          <div className="flex flex-col gap-2">
            <h1
              className="font-gilroyBold text-6xl xl:text-7xl text-white leading-[1.05] tracking-tight animate-fade-up"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              Welcome to
            </h1>
            <h2
              className="font-gilroyBold text-7xl xl:text-8xl leading-[1.0] tracking-tight animate-fade-up"
              style={{ animationDelay: '0.35s', opacity: 0 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] via-[#CC66FF] to-[#360C9F]">
                JLTQuest
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <p
            className="font-gilroyRegular text-lg xl:text-xl text-gray-300 leading-relaxed max-w-[520px] animate-fade-up"
            style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            Complete quests, collect rare passes, earn JLT coins, and climb the leaderboard — all within the JaxMart ecosystem.
          </p>

          {/* Stats Row */}
          <div
            className="flex items-center gap-8 animate-fade-up"
            style={{ animationDelay: '0.65s', opacity: 0 }}
          >
            {[
              { label: 'Active Players', value: '10K+' },
              { label: 'Quests Available', value: '50+' },
              { label: 'JLT Coins Earned', value: '2M+' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-gilroyBold text-3xl text-white">{stat.value}</span>
                <span className="font-gilroyRegular text-sm text-gray-400 whitespace-nowrap">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className="flex items-center gap-4 animate-fade-up"
            style={{ animationDelay: '0.8s', opacity: 0 }}
          >
            <Link
              href="/dashboard"
              id="hero-enter-app-btn"
              className="glass-btn px-8 py-4 rounded-2xl font-gilroyBold text-white text-lg tracking-wide shadow-[0_0_30px_rgba(54,12,159,0.5)] flex items-center gap-2 group"
            >
              Start Questing
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              id="hero-learn-more-btn"
              className="px-8 py-4 rounded-2xl font-gilroyMedium text-white/80 text-lg tracking-wide border border-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right: Mascot + JLT Logo Composition */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Outer glow ring */}
          <div className="absolute w-[420px] h-[420px] rounded-full border border-[#360C9F]/30 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-[#FFA28D]/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

          {/* Glow behind mascot */}
          <div className="absolute w-[380px] h-[380px] rounded-full bg-radial from-[#360C9F]/50 via-[#7B2CBF]/30 to-transparent blur-3xl" />

          {/* JLT color logo badge */}
          <div className="absolute top-4 right-8 z-20">
            <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-2.5">
              <img src="/jltcolor.svg" alt="JLT" className="w-8 h-8 object-contain" />
              <span className="font-gilroyBold text-white text-base">JLT</span>
            </div>
          </div>

          {/* Mascot */}
          <div className="relative w-[380px] h-[380px] flex items-center justify-center animate-float">
            <img
              src="/Mascot.svg"
              alt="JLT Quest Mascot"
              className="w-[360px] h-[360px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Floating stat chips */}
          <div className="absolute left-0 top-[20%] glass-pill px-4 py-2.5 flex items-center gap-2.5 animate-float" style={{ animationDelay: '0.5s' }}>
            <img src="/Coin.svg" alt="Coins" className="w-6 h-6 object-contain" />
            <span className="font-gilroyBold text-white text-sm">+500 Coins</span>
          </div>
          <div className="absolute right-0 bottom-[25%] glass-pill px-4 py-2.5 flex items-center gap-2.5 animate-float" style={{ animationDelay: '1.2s' }}>
            <img src="/Level.svg" alt="Level" className="w-6 h-6 object-contain" />
            <span className="font-gilroyBold text-white text-sm">Level Up!</span>
          </div>
          <div className="absolute left-4 bottom-[10%] glass-pill px-4 py-2.5 flex items-center gap-2.5 animate-float" style={{ animationDelay: '0.8s' }}>
            <img src="/Spin.svg" alt="Spin" className="w-6 h-6 object-contain" />
            <span className="font-gilroyBold text-white text-sm">Spin &amp; Win</span>
          </div>
        </div>
      </div>

      {/* Bottom scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10">
        <span className="font-gilroyRegular text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};

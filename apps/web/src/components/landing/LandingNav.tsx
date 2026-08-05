'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-panel border-b border-white/5 rounded-none'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src="/jltcolor.svg"
            alt="JLT Logo"
            className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(255,162,141,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(255,162,141,0.8)] transition-all duration-300"
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Leaderboard'].map((item) => (
            <button
              key={item}
              className="text-gray-300 hover:text-white font-gilroyMedium text-base tracking-wide transition-colors duration-200 relative group"
            >
              {item}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-[#360C9F] to-[#FFA28D] group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="glass-btn px-6 py-2.5 rounded-xl font-gilroyBold text-white text-base tracking-wide shadow-[0_0_20px_rgba(54,12,159,0.4)]"
        >
          Enter App
        </Link>
      </div>
    </nav>
  );
};

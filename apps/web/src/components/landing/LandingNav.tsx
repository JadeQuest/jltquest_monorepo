'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = React.useCallback((id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#080411]/85 backdrop-blur-xl animated-border-b shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/jltcolor.svg"
              alt="JLT Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_15px_rgba(255,162,141,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(255,162,141,0.9)] group-hover:scale-105 transition-all duration-300"
            />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 glass-pill px-6 py-2 border border-white/10 shadow-inner">
          {[
            { label: 'Features', target: 'features' },
            { label: 'How It Works', target: 'how-it-works' },
            { label: 'Rewards', target: 'rewards' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.target)}
              type="button"
              className="text-gray-300 hover:text-white font-gilroyMedium text-sm tracking-wide transition-colors duration-200 relative group py-1 cursor-pointer"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            id="nav-enter-app-btn"
            className="glass-btn px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl font-gilroyBold text-white text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(54,12,159,0.4)] flex items-center gap-2 group hover:shadow-[0_0_30px_rgba(255,162,141,0.5)] transition-all duration-300"
          >
            <span>Enter App</span>
            <Sparkles className="w-4 h-4 text-[#FFA28D] group-hover:rotate-12 transition-transform duration-300" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080411]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 flex flex-col gap-4 animate-fade-down shadow-2xl">
          {[
            { label: 'Features', target: 'features' },
            { label: 'How It Works', target: 'how-it-works' },
            { label: 'Rewards', target: 'rewards' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.target)}
              type="button"
              className="text-left text-gray-200 font-gilroyMedium text-lg py-2 border-b border-white/5 hover:text-[#FFA28D] transition-colors"
            >
              {item.label}
            </button>
          ))}

          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="glass-btn w-full py-3.5 rounded-xl font-gilroyBold text-white text-center text-base tracking-wide mt-2 flex items-center justify-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
};

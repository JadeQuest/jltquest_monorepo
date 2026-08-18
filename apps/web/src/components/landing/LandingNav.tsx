'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { gsap, prefersReducedMotion, MotionEases } from '@/lib/animations';
import { useMagneticButton } from './useMagneticButton';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const LandingNav: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const enterAppBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 12, strength: 0.25 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = React.useCallback((id: string) => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(`#${id}`, { offset: -70, duration: 1.2 });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // 1. Initial Load: Logo scales from 0 -> 1 with blur, Nav slides down from y: -30
      gsap.fromTo(
        logoRef.current,
        { scale: 0, opacity: 0, filter: 'blur(10px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: MotionEases.backOut, delay: 0.1 }
      );

      gsap.fromTo(
        navRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15 }
      );

      gsap.fromTo(
        ['.nav-item', '#nav-enter-app-btn'],
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.25 }
      );
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 py-5 bg-transparent select-none">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="nav-brand flex items-center gap-3 group">
          <div ref={logoRef} className="relative">
            <img
              src="/jltcolor.svg"
              alt="JLT Logo"
              width={56}
              height={56}
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
              data-cursor="pointer"
              className="nav-item text-gray-300 hover:text-white font-gilroyMedium text-sm tracking-wide transition-colors duration-200 relative group py-1 cursor-pointer"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            ref={enterAppBtnRef}
            href="/dashboard"
            id="nav-enter-app-btn"
            data-cursor="cta"
            data-cursor-text="ENTER"
            className="glass-btn gsap-magnetic-btn px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl font-gilroyBold text-white text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(54,12,159,0.4)] flex items-center gap-2 group hover:shadow-[0_0_30px_rgba(255,162,141,0.5)] hover:scale-[1.025] active:scale-[0.98] transition-all duration-200"
          >
            <span>Enter App</span>
            <Sparkles className="w-4 h-4 text-[#FFA28D] group-hover:rotate-12 transition-transform duration-300 magnetic-icon" />
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
            className="glass-btn w-full py-3.5 rounded-xl font-gilroyBold text-white text-center text-base tracking-wide mt-2 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
};

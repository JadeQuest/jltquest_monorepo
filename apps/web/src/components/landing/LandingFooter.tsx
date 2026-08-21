'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import {
  gsap,
  prefersReducedMotion,
  hasFineHoverPointer,
  createParticleBurst,
  ReversibleToggleActions,
  MotionEases,
} from '@/lib/animations';
import { ShieldCheck, Sparkles, ArrowUp, Zap, Trophy, Play } from 'lucide-react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const LandingFooter: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogoHover = () => {
    if (logoWrapperRef.current && hasFineHoverPointer() && !prefersReducedMotion()) {
      createParticleBurst(logoWrapperRef.current, { count: 16, radius: 45 });
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !footerRef.current) return;

    const ctx = gsap.context(() => {
      // Reversible Divider line animation
      gsap.fromTo(
        '.footer-divider-line',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          transformOrigin: 'center',
          duration: 0.8,
          ease: 'power2.out',
          force3D: true,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            toggleActions: ReversibleToggleActions,
          },
        }
      );

      // Reversible Staggered columns entrance
      gsap.fromTo(
        '.footer-col',
        { y: 25, opacity: 0.3 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: MotionEases.powerOut,
          force3D: true,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            toggleActions: ReversibleToggleActions,
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative w-full pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 bg-[#06030D] overflow-hidden border-t border-white/5 select-none">
      {/* Top Animated Glowing Border */}
      <div className="footer-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl h-[2px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] via-[#00F0FF] to-transparent shadow-[0_0_20px_rgba(255,162,141,0.6)] pointer-events-none" />

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-radial from-[#360C9F]/20 via-transparent to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] rounded-full bg-radial from-[#FFA28D]/15 via-transparent to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 sm:gap-12 relative z-10">
        
        {/* ── TOP SECTION: Multi-column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-10 lg:gap-8 pb-8 sm:pb-10 border-b border-white/10">
          
          {/* Column 1: Brand Info & Mission (Col 1-5) */}
          <div className="footer-col sm:col-span-2 md:col-span-5 flex flex-col items-start gap-3.5 sm:gap-4">
            <Link
              href="/"
              onMouseEnter={handleLogoHover}
              className="flex items-center gap-2.5 sm:gap-3 group"
            >
              <div ref={logoWrapperRef} className="relative">
                <img
                  src="/jltcolor.svg"
                  alt="JLT Logo"
                  width={56}
                  height={56}
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_20px_rgba(255,162,141,0.7)] group-hover:scale-110 group-hover:rotate-6 group-hover:drop-shadow-[0_0_35px_rgba(255,162,141,0.95)] transition-all duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-gilroyBold text-xl sm:text-2xl text-white tracking-wide group-hover:text-[#FFA28D] transition-colors">
                  JLTQuest
                </span>
                <span className="font-gilroyRegular text-[11px] sm:text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] to-purple-300">
                  Play Daily · Earn Real Perks
                </span>
              </div>
            </Link>

            <p className="font-gilroyRegular text-gray-300 text-xs sm:text-sm leading-relaxed max-w-sm">
              The premier Web3 gaming and rewards ecosystem powered by JaxMart. Complete daily quests, spin for rare passes, and build your multiplier streak with friends.
            </p>

            {/* Official Partner Badge */}
            <div className="glass-pill px-3 sm:px-3.5 py-1 sm:py-1.5 inline-flex items-center gap-2 text-[11px] sm:text-xs border border-purple-500/30 bg-purple-950/40 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFA28D]" />
              <span className="text-gray-200 font-gilroyMedium">Official JaxMart Partner Platform</span>
            </div>
          </div>

          {/* Column 2: Game Features (Col 6-8) */}
          <div className="footer-col sm:col-span-1 md:col-span-3 flex flex-col gap-3">
            <span className="font-gilroyBold text-xs sm:text-sm text-white uppercase tracking-wider text-purple-200 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFA28D]" />
              <span>Features</span>
            </span>
            <ul className="flex flex-col gap-2 sm:gap-2.5 text-xs sm:text-sm font-gilroyRegular">
              {[
                { label: 'Daily Quests', href: '/dashboard' },
                { label: 'Spin to Win Wheel', href: '/dashboard' },
                { label: 'Rare Pass Drops', href: '/dashboard/rare-pass', badge: 'NEW' },
                { label: 'Global Leaderboards', href: '/dashboard' },
                { label: 'Daily Streak Bonuses', href: '/dashboard' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1.5 inline-flex items-center gap-2 transition-all duration-200 relative group"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-gilroyBold text-[10px]">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Ecosystem & Legal (Col 9-12) */}
          <div className="footer-col sm:col-span-1 md:col-span-4 flex flex-col gap-3">
            <span className="font-gilroyBold text-xs sm:text-sm text-white uppercase tracking-wider text-purple-200 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFA28D]" />
              <span>Ecosystem</span>
            </span>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-400 font-gilroyRegular leading-relaxed">
                Connect seamlessly with MetaMask, Coinbase, Rainbow, or any EVM wallet. No gas fees required for daily questing.
              </p>

              {/* Quick Launch CTA */}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/dashboard"
                  data-cursor="cta"
                  data-cursor-text="LAUNCH"
                  className="glass-btn px-3.5 sm:px-4 py-2 rounded-xl text-xs font-gilroyBold text-white flex items-center gap-2 shadow-[0_0_15px_rgba(54,12,159,0.4)] hover:shadow-[0_0_25px_rgba(255,162,141,0.5)] hover:scale-[1.02] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch App</span>
                </Link>

                <button
                  onClick={scrollToTop}
                  type="button"
                  data-cursor="pointer"
                  className="glass-pill p-2 rounded-xl text-gray-300 hover:text-white hover:border-[#FFA28D]/50 transition-all cursor-pointer"
                  title="Back to top"
                  aria-label="Back to top"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── BOTTOM SECTION: Copyright & Policy Links ── */}
        <div className="footer-col flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs font-gilroyRegular text-gray-400">
          
          {/* Left: Copyright */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} JLTQuest. Powered by JaxMart Ecosystem.</span>
          </div>

          {/* Right: Interactive Privacy & Cookie Modal Triggers */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-6">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-modal'))}
              type="button"
              className="text-gray-400 hover:text-[#FFA28D] transition-colors cursor-pointer flex items-center gap-1 group"
            >
              <Sparkles className="w-3 h-3 text-[#FFA28D] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>Cookie &amp; Privacy Preferences</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-modal'))}
              type="button"
              className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>

            <button
              type="button"
              className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};

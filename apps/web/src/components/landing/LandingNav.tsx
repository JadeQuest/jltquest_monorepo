'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { gsap, ScrollTrigger, prefersReducedMotion, MotionEases } from '@/lib/animations';
import { useMagneticButton } from './useMagneticButton';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const LandingNav: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoScrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const btnEnterRef = useRef<HTMLDivElement>(null);
  const enterAppBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 12, strength: 0.25 });

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !navRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial Load: Logo scales from 0.7 -> 1 with blur reduction, Nav slides down from y: -30
      gsap.fromTo(
        logoRef.current,
        { scale: 0.7, opacity: 0, filter: 'blur(12px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.85,
          ease: MotionEases.backOut,
          delay: 0.15,
          force3D: true,
          overwrite: 'auto',
        }
      );

      gsap.fromTo(
        navRef.current,
        { y: -30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.2,
          force3D: true,
          overwrite: 'auto',
        }
      );

      // Button initial entrance animation
      if (btnEnterRef.current) {
        gsap.fromTo(
          btnEnterRef.current,
          { y: -15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            delay: 0.3,
            force3D: true,
            overwrite: 'auto',
          }
        );
      }

      // 2. Scroll Animation: Smoothly move towards top-left / top-right corners and hide on scroll, reverse on scrolling back to top
      if (logoScrollWrapperRef.current) {
        gsap.to(logoScrollWrapperRef.current, {
          x: -55,
          y: -35,
          scale: 0.78,
          autoAlpha: 0,
          filter: 'blur(4px)',
          ease: 'power2.inOut',
          force3D: true,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: '+=140',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
      }

      if (scrollWrapperRef.current) {
        gsap.to(scrollWrapperRef.current, {
          x: 55,
          y: -35,
          scale: 0.78,
          autoAlpha: 0,
          filter: 'blur(4px)',
          ease: 'power2.inOut',
          force3D: true,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: '+=140',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 py-5 bg-transparent select-none">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand Logo with Scroll Hide Animation */}
        <div ref={logoScrollWrapperRef} className="flex items-center origin-top-left will-change-transform">
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
        </div>

        {/* Action Button with Scroll Hide Animation */}
        <div ref={scrollWrapperRef} className="flex items-center origin-top-right will-change-transform">
          <div ref={btnEnterRef}>
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
          </div>
        </div>
      </div>
    </header>
  );
};

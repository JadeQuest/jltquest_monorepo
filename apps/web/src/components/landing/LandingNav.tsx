'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useMagneticButton } from './useMagneticButton';
import { getStoredReferralCode } from '@/lib/authCookie';

export const LandingNav: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const enterAppBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 12, strength: 0.25 });

  useEffect(() => {
    const code = getStoredReferralCode();
    if (code) setReferralCode(code);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only open/show header when user scrolls back to the top of the page (< 60px)
      if (currentScrollY < 60) {
        setIsVisible(true);
      } else {
        // Hide header on scrolling down past top region
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-3.5 sm:py-5 bg-transparent select-none transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="nav-brand flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative">
              <img
                src="/jltcolor.svg"
                alt="JLT Logo"
                width={56}
                height={56}
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_15px_rgba(255,162,141,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(255,162,141,0.9)] group-hover:scale-105 transition-all duration-300"
              />
            </div>
          </Link>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <Link
            ref={enterAppBtnRef}
            href={referralCode ? `/dashboard?ref=${encodeURIComponent(referralCode)}` : '/dashboard'}
            id="nav-enter-app-btn"
            data-cursor="cta"
            data-cursor-text="ENTER"
            className="glass-btn gsap-magnetic-btn px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-gilroyBold text-white text-xs sm:text-base tracking-wide shadow-[0_0_20px_rgba(54,12,159,0.4)] flex items-center gap-1.5 sm:gap-2 group hover:shadow-[0_0_30px_rgba(255,162,141,0.5)] hover:scale-[1.025] active:scale-[0.98] transition-all duration-200"
          >
            <span>Enter App</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFA28D] group-hover:rotate-12 transition-transform duration-300 magnetic-icon" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingNav;

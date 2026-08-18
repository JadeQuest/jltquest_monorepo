'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap, prefersReducedMotion } from '@/lib/animations';

export function usePageTransition() {
  const router = useRouter();

  const navigateWithTransition = (href: string) => {
    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }
    window.dispatchEvent(
      new CustomEvent('start-page-transition', {
        detail: { href },
      })
    );
  };

  return { navigateWithTransition };
}

export const PageTransitionOverlay: React.FC = () => {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleStartTransition = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string }>;
      const targetHref = customEvent.detail?.href || '/dashboard';

      setIsTransitioning(true);

      const overlay = overlayRef.current;
      const logo = logoRef.current;
      const glow = glowRef.current;
      if (!overlay || !logo || !glow) {
        router.push(targetHref);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          router.push(targetHref);
          // Auto-fade out on new page
          setTimeout(() => {
            gsap.to(overlay, {
              opacity: 0,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => setIsTransitioning(false),
            });
          }, 300);
        },
      });

      tl.fromTo(
        overlay,
        { opacity: 0, scale: 1 },
        { opacity: 1, duration: 0.35, ease: 'power3.inOut' },
        0
      )
        .fromTo(
          glow,
          { scale: 0.5, opacity: 0 },
          { scale: 1.5, opacity: 1, duration: 0.55, ease: 'power2.out' },
          0.1
        )
        .fromTo(
          logo,
          { scale: 0.6, opacity: 0, rotation: -10 },
          { scale: 1.15, opacity: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.5)' },
          0.12
        );
    };

    window.addEventListener('start-page-transition', handleStartTransition);
    return () => {
      window.removeEventListener('start-page-transition', handleStartTransition);
    };
  }, [router]);

  if (!isTransitioning) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] bg-[#080411] flex flex-col items-center justify-center pointer-events-auto select-none"
      aria-hidden="true"
    >
      {/* Expanding Ambient Radial Glow */}
      <div
        ref={glowRef}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] opacity-60 blur-[100px] pointer-events-none"
      />

      {/* Center JLT Logo */}
      <div ref={logoRef} className="relative z-10 flex flex-col items-center gap-4">
        <img
          src="/jltcolor.svg"
          alt="JLT Logo"
          width={96}
          height={96}
          className="w-24 h-24 object-contain drop-shadow-[0_0_40px_rgba(255,162,141,0.9)]"
        />
        <div className="flex flex-col items-center gap-1">
          <span className="font-gilroyBold text-2xl text-white tracking-widest uppercase">
            Entering JLTQuest
          </span>
          <span className="font-gilroyRegular text-xs text-purple-300 tracking-wider">
            Preparing your quest arena...
          </span>
        </div>
      </div>
    </div>
  );
};

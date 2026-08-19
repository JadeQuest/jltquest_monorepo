'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import {
  gsap,
  prefersReducedMotion,
  isTouchDevice,
  ReversibleToggleActions,
  MotionEases,
} from '@/lib/animations';
import { useMagneticButton } from './useMagneticButton';
import { SplitText } from './SplitText';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const CTASection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const mascotImgRef = useRef<HTMLImageElement>(null);
  const glowRingRef = useRef<HTMLDivElement>(null);

  const ctaBtnRef = useMagneticButton<HTMLAnchorElement>({ maxDistance: 15, strength: 0.28 });

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Reversible Divider Line
      gsap.fromTo(
        '.cta-divider-line',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          transformOrigin: 'center',
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: ReversibleToggleActions,
          },
        }
      );

      // Reversible Master Entrance Sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: ReversibleToggleActions,
        },
      });

      tl.fromTo(
        '.cta-mascot-container',
        { scale: 0.85, y: 40, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.75, ease: MotionEases.powerOut }
      )
        .fromTo(
          '.cta-heading-block',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: MotionEases.powerOut },
          '-=0.35'
        )
        .fromTo(
          '.cta-desc',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: MotionEases.powerOut },
          '-=0.3'
        )
        .fromTo(
          '.cta-badge',
          { y: 10, scale: 0.94, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, stagger: 0.08, duration: 0.45, ease: MotionEases.backOut },
          '-=0.25'
        )
        .fromTo(
          '#cta-enter-app-btn',
          { y: 15, scale: 0.94, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: MotionEases.backOut },
          '-=0.2'
        )
        .fromTo(
          '.cta-subtext',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: MotionEases.powerOut },
          '-=0.25'
        );

      // 13. Mascot space animation: Floating y: ±12px, Sway rotation ±3°, Breathing Glow
      if (mascotImgRef.current) {
        gsap.to(mascotImgRef.current, {
          y: -12,
          rotation: 3,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (glowRingRef.current) {
        gsap.to(glowRingRef.current, {
          scale: 1.6,
          opacity: 0.7,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // 14. Mascot scroll scale transformation: scale 1 -> 1.15 on scroll
      if (mascotRef.current) {
        gsap.to(mascotRef.current, {
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="rewards" ref={sectionRef} className="relative w-full py-24 px-6 overflow-hidden bg-transparent select-none">
      {/* Section Separator Line */}
      <div className="cta-divider-line absolute top-0 left-1/2 -translate-x-1/2 w-[75%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#FF007F] via-[#00F0FF] to-transparent pointer-events-none" />

      {/* Ambient blurs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[400px] rounded-full bg-radial from-[#360C9F]/30 via-[#340073]/15 to-transparent blur-[140px]" />
      </div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-radial from-[#FFA28D]/10 via-transparent to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 text-center relative z-10">
        {/* 13. Mascot decorative with breathing glow & orbiting XP particles */}
        <div ref={mascotRef} className="cta-mascot-container relative w-44 h-44 flex items-center justify-center">
          <div
            ref={glowRingRef}
            className="absolute inset-0 rounded-full bg-radial from-[#360C9F]/65 via-[#7B2CBF]/35 to-transparent blur-2xl scale-125"
          />

          {/* Orbiting XP sparkles */}
          <div className="absolute -top-3 left-4 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_10px_#FCD34D] animate-sparkle" />
          <div className="absolute bottom-2 right-4 w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF] animate-sparkle" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-10 -right-2 w-2 h-2 rounded-full bg-[#FFA28D] shadow-[0_0_8px_#FFA28D] animate-sparkle" style={{ animationDelay: '0.6s' }} />

          <img
            ref={mascotImgRef}
            src="/icon/mascot.webp"
            alt="JLT Quest Mascot"
            width={160}
            height={160}
            loading="lazy"
            decoding="async"
            className="relative w-40 h-40 object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Heading with SplitText */}
        <div className="cta-heading-block flex flex-col gap-3">
          <h2 className="font-gilroyBold text-4xl sm:text-6xl text-white tracking-tight leading-tight">
            <SplitText scrollTrigger={false}>Ready to Start Your</SplitText>
          </h2>
          <h2 className="font-gilroyBold text-4xl sm:text-6xl tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA28D] via-[#CC66FF] to-[#360C9F] animate-text-shimmer">
              Quest Journey?
            </span>
          </h2>
        </div>

        <p className="cta-desc font-gilroyRegular text-gray-400 text-lg sm:text-xl max-w-[520px] leading-relaxed">
          Join thousands of players already earning JLT coins inside the JaxMart ecosystem. Your quests await.
        </p>

        {/* Coin counter decoration */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              data-cursor="reward"
              data-cursor-text="BONUS"
              className="cta-badge glass-pill px-5 py-2.5 flex items-center gap-2.5 shadow-lg"
            >
              <img src="/icon/coin.webp" alt="JLT Coin" width={24} height={24} loading="lazy" decoding="async" className="w-6 h-6 object-contain animate-sparkle" style={{ animationDelay: `${i * 0.3}s` }} />
              <span className="font-gilroyBold text-white text-sm">
                {i === 1 ? '+250 Coins' : i === 2 ? 'Rare Drop' : '2× Bonus'}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button with Magnetic interaction */}
        <Link
          ref={ctaBtnRef}
          href="/dashboard"
          id="cta-enter-app-btn"
          data-cursor="cta"
          data-cursor-text="ENTER →"
          className="glass-btn gsap-magnetic-btn px-10 py-4 sm:px-12 sm:py-5 rounded-2xl font-gilroyBold text-white text-lg sm:text-xl tracking-wide shadow-[0_0_40px_rgba(54,12,159,0.6)] flex items-center gap-3 group hover:shadow-[0_0_60px_rgba(255,162,141,0.4)] hover:scale-[1.025] active:scale-[0.98] transition-all duration-200"
        >
          <span>Enter JLTQuest</span>
          <svg
            className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-200 magnetic-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="cta-subtext font-gilroyRegular text-gray-600 text-sm">
          Free to play · No downloads required · Powered by JaxMart
        </p>
      </div>
    </section>
  );
};

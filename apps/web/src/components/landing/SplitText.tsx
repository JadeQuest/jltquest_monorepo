'use client';

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion, MotionEases, ReversibleToggleActions } from '@/lib/animations';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface SplitTextProps {
  children: string;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  mode?: 'words' | 'chars';
  stagger?: number;
  duration?: number;
  delay?: number;
  trigger?: string | HTMLElement;
  start?: string;
  scrollTrigger?: boolean;
  blur?: boolean;
}

export const SplitText: React.FC<SplitTextProps> = ({
  children,
  className = '',
  wordClassName = '',
  charClassName = '',
  mode = 'words',
  stagger = 0.05,
  duration = 0.7,
  delay = 0,
  trigger,
  start = 'top 88%',
  scrollTrigger = true,
  blur = true,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const el = containerRef.current;
    const targets = el.querySelectorAll(mode === 'chars' ? '.split-char' : '.split-word');
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      const animProps: gsap.TweenVars = {
        y: 0,
        opacity: 1,
        stagger,
        duration,
        delay,
        ease: MotionEases.powerOut,
      };

      if (blur) {
        animProps.filter = 'blur(0px)';
      }

      const initialProps: gsap.TweenVars = {
        y: 28,
        opacity: 0,
      };

      if (blur) {
        initialProps.filter = 'blur(8px)';
      }

      if (scrollTrigger) {
        animProps.scrollTrigger = {
          trigger: trigger || el,
          start,
          toggleActions: ReversibleToggleActions,
        };
      }

      gsap.fromTo(targets, initialProps, animProps);
    }, el);

    return () => ctx.revert();
  }, [children, mode, stagger, duration, delay, trigger, start, scrollTrigger, blur]);

  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  if (mode === 'chars') {
    const words = children.split(' ');
    return (
      <span ref={containerRef} className={`inline-block ${className}`}>
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className={`inline-block whitespace-nowrap mr-[0.25em] ${wordClassName}`}>
            {word.split('').map((char, charIdx) => (
              <span
                key={charIdx}
                className={`split-char inline-block will-change-transform ${charClassName}`}
                style={{ transform: 'translate3d(0, 0, 0)' }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </span>
    );
  }

  // mode === 'words'
  const words = children.split(' ');
  return (
    <span ref={containerRef} className={`inline-block ${className}`}>
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden mr-[0.28em] align-top">
          <span
            className={`split-word inline-block will-change-transform ${wordClassName}`}
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

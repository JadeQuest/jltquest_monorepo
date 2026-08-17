import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once across the entire client application
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Check if the user has requested reduced motion at OS level.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if the device is a primary touch/mobile device.
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Common curated easing curves for high-end Web3/Game UI.
 */
export const MotionEases = {
  powerOut: 'power3.out',
  powerInOut: 'power3.inOut',
  backOut: 'back.out(1.4)',
  elasticOut: 'elastic.out(1, 0.75)',
  smoothSine: 'sine.inOut',
  linear: 'none',
} as const;

/**
 * Default Toggle Actions:
 * onEnter: play
 * onLeave: reverse (or none)
 * onEnterBack: play
 * onLeaveBack: reverse
 */
export const ReversibleToggleActions = 'play reverse play reverse';
export const PlayOnceToggleActions = 'play none none none';

export { gsap, ScrollTrigger };

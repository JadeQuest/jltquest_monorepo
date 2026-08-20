import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once across the entire client application
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({
    autoSleep: 60,
    force3D: true,
    nullTargetWarn: false,
  });
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });
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
 * Pointer capability check for effects that are only worthwhile with a mouse.
 */
export const hasFineHoverPointer = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
};

/**
 * Canvas particle effects look the same at a capped DPR but cost much less
 * on high-density displays.
 */
export const getSafeCanvasDpr = (maxDpr = 1.5): number => {
  if (typeof window === 'undefined') return 1;
  return Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1));
};

export const resizeCanvasToDisplaySize = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  maxDpr = 1.5
) => {
  const width = Math.max(1, Math.floor(cssWidth));
  const height = Math.max(1, Math.floor(cssHeight));
  const dpr = getSafeCanvasDpr(maxDpr);
  const nextWidth = Math.floor(width * dpr);
  const nextHeight = Math.floor(height * dpr);

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, dpr };
};

export const isDocumentVisible = (): boolean => {
  if (typeof document === 'undefined') return true;
  return document.visibilityState !== 'hidden';
};

type RafThrottled<T extends (...args: any[]) => void> = T & { cancel: () => void };

/**
 * Coalesces noisy pointer/scroll/resize events into one browser frame.
 */
export function createRafThrottle<T extends (...args: any[]) => void>(fn: T): RafThrottled<T> {
  let frameId: number | null = null;
  let lastArgs: Parameters<T>;

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (frameId !== null) return;

    frameId = requestAnimationFrame(() => {
      frameId = null;
      fn(...lastArgs);
    });
  }) as RafThrottled<T>;

  throttled.cancel = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return throttled;
}

type Debounced<T extends (...args: any[]) => void> = T & { cancel: () => void };

export function createDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay = 120
): Debounced<T> {
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T>;

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      fn(...lastArgs);
    }, delay);
  }) as Debounced<T>;

  debounced.cancel = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

export function observeElementVisibility(
  element: Element,
  onChange: (isVisible: boolean) => void,
  options: IntersectionObserverInit = { rootMargin: '240px 0px' }
) {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true);
    return () => {};
  }

  const observer = new IntersectionObserver(([entry]) => {
    onChange(Boolean(entry?.isIntersecting));
  }, options);

  observer.observe(element);
  return () => observer.disconnect();
}

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

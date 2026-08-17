import { gsap, ScrollTrigger, prefersReducedMotion, isTouchDevice, MotionEases, ReversibleToggleActions } from './gsapCore';

export interface RevealOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  duration?: number;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  stagger?: number;
  toggleActions?: string;
  scrub?: boolean | number;
  ease?: string;
}

/**
 * Creates a reversible reveal animation that plays forward on scroll down
 * and smoothly reverses when scrolling back up.
 */
export function createReversibleReveal(
  target: string | Element | Element[],
  options: RevealOptions = {}
) {
  if (prefersReducedMotion()) return null;

  const {
    trigger = target,
    start = 'top 88%',
    duration = 0.65,
    delay = 0,
    y = 25,
    x = 0,
    scale = 1,
    stagger = 0,
    toggleActions = ReversibleToggleActions,
    ease = MotionEases.powerOut,
  } = options;

  return gsap.fromTo(
    target,
    {
      y,
      x,
      scale,
      opacity: 0,
      visibility: 'hidden',
    },
    {
      y: 0,
      x: 0,
      scale: 1,
      opacity: 1,
      visibility: 'visible',
      duration,
      delay,
      stagger,
      ease,
      scrollTrigger: {
        trigger: trigger as gsap.DOMTarget,
        start,
        toggleActions,
      },
    }
  );
}

/**
 * Creates a reversible section header reveal (Badge, Title, Description).
 */
export function createHeaderReveal(
  badge: string | Element,
  title: string | Element,
  desc: string | Element,
  trigger: string | Element,
  options: RevealOptions = {}
) {
  if (prefersReducedMotion()) return null;

  const {
    start = 'top 85%',
    toggleActions = ReversibleToggleActions,
    duration = 0.6,
  } = options;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger as gsap.DOMTarget,
      start,
      toggleActions,
    },
  });

  tl.fromTo(
    badge,
    { y: 15, opacity: 0, scale: 0.94 },
    { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: MotionEases.powerOut }
  )
    .fromTo(
      title,
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration, ease: MotionEases.powerOut },
      '-=0.25'
    )
    .fromTo(
      desc,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: duration * 0.9, ease: MotionEases.powerOut },
      '-=0.3'
    );

  return tl;
}

/**
 * Attaches a 3D cursor tilt effect to a card element using gsap.quickTo.
 */
export function createCardTiltEffect(
  card: HTMLElement,
  options: { maxRotation?: number; translateY?: number } = {}
) {
  if (isTouchDevice() || prefersReducedMotion()) return () => {};

  const { maxRotation = 3, translateY = -5 } = options;

  const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.35, ease: 'power2.out' });
  const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.35, ease: 'power2.out' });
  const yTo = gsap.quickTo(card, 'y', { duration: 0.35, ease: 'power2.out' });

  const handleMouseMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXVal = ((y - centerY) / centerY) * -maxRotation;
    const rotateYVal = ((x - centerX) / centerX) * maxRotation;

    rotX(rotateXVal);
    rotY(rotateYVal);
    yTo(translateY);
  };

  const handleMouseLeave = () => {
    rotX(0);
    rotY(0);
    yTo(0);
  };

  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    card.removeEventListener('mousemove', handleMouseMove);
    card.removeEventListener('mouseleave', handleMouseLeave);
    rotX(0);
    rotY(0);
    yTo(0);
  };
}

/**
 * Attaches a magnetic cursor pull effect to a button element using gsap.quickTo.
 */
export function createMagneticButtonEffect(
  button: HTMLElement,
  options: { maxDistance?: number; strength?: number } = {}
) {
  if (isTouchDevice() || prefersReducedMotion()) return () => {};

  const { maxDistance = 12, strength = 0.25 } = options;

  const xTo = gsap.quickTo(button, 'x', { duration: 0.3, ease: 'power3.out' });
  const yTo = gsap.quickTo(button, 'y', { duration: 0.3, ease: 'power3.out' });

  const handleMouseMove = (e: MouseEvent) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

    xTo(clampedX);
    yTo(clampedY);
  };

  const handleMouseLeave = () => {
    xTo(0);
    yTo(0);
  };

  button.addEventListener('mousemove', handleMouseMove);
  button.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    button.removeEventListener('mousemove', handleMouseMove);
    button.removeEventListener('mouseleave', handleMouseLeave);
    xTo(0);
    yTo(0);
  };
}

/**
 * Creates a reversible numeric counter that animates on enter and reverses back down on leave.
 */
export function createReversibleCounter(
  element: HTMLElement,
  targetValue: number,
  options: {
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    startTrigger?: string;
  } = {}
) {
  if (prefersReducedMotion()) {
    element.textContent = `${options.prefix || ''}${targetValue}${options.suffix || ''}`;
    return null;
  }

  const {
    duration = 1.6,
    prefix = '',
    suffix = '',
    decimals = 0,
    startTrigger = 'top 85%',
  } = options;

  const counterObj = { val: 0 };

  return ScrollTrigger.create({
    trigger: element,
    start: startTrigger,
    toggleActions: ReversibleToggleActions,
    onEnter: () => {
      gsap.to(counterObj, {
        val: targetValue,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          const formatted =
            decimals > 0
              ? counterObj.val.toFixed(decimals)
              : Math.floor(counterObj.val).toLocaleString();
          element.textContent = `${prefix}${formatted}${suffix}`;
        },
      });
    },
    onLeaveBack: () => {
      gsap.to(counterObj, {
        val: 0,
        duration: 0.5,
        ease: 'power2.in',
        onUpdate: () => {
          const formatted =
            decimals > 0
              ? counterObj.val.toFixed(decimals)
              : Math.floor(counterObj.val).toLocaleString();
          element.textContent = `${prefix}${formatted}${suffix}`;
        },
      });
    },
  });
}

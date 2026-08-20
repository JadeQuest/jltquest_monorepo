import {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
  isTouchDevice,
  hasFineHoverPointer,
  createRafThrottle,
  MotionEases,
  ReversibleToggleActions,
} from './gsapCore';

export interface RevealOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  duration?: number;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  rotation?: number;
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
    rotation = 0,
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
      rotation,
      opacity: 0,
      visibility: 'hidden',
    },
    {
      y: 0,
      x: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      visibility: 'visible',
      duration,
      delay,
      stagger,
      ease,
      force3D: true,
      overwrite: 'auto',
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
      { y: 0, opacity: 1, duration: duration * 0.9, ease: MotionEases.powerOut, force3D: true },
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
  if (isTouchDevice() || !hasFineHoverPointer() || prefersReducedMotion()) return () => {};

  const { maxRotation = 4, translateY = -6 } = options;

  const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.35, ease: 'power2.out', force3D: true });
  const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.35, ease: 'power2.out', force3D: true });
  const yTo = gsap.quickTo(card, 'y', { duration: 0.35, ease: 'power2.out', force3D: true });

  let rect = card.getBoundingClientRect();
  const updateRect = () => {
    rect = card.getBoundingClientRect();
  };

  const applyMouseMove = createRafThrottle((clientX: number, clientY: number) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXVal = ((y - centerY) / centerY) * -maxRotation;
    const rotateYVal = ((x - centerX) / centerX) * maxRotation;

    rotX(rotateXVal);
    rotY(rotateYVal);
    yTo(translateY);
  });

  const handleMouseMove = (e: MouseEvent) => {
    applyMouseMove(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    applyMouseMove.cancel();
    rotX(0);
    rotY(0);
    yTo(0);
  };

  card.addEventListener('mouseenter', updateRect);
  card.addEventListener('mousemove', handleMouseMove, { passive: true });
  card.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('resize', updateRect, { passive: true });

  return () => {
    applyMouseMove.cancel();
    card.removeEventListener('mouseenter', updateRect);
    card.removeEventListener('mousemove', handleMouseMove);
    card.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('resize', updateRect);
    rotX(0);
    rotY(0);
    yTo(0);
  };
}

/**
 * Attaches a dynamic Web3 light beam / spotlight sweep following the cursor over a card.
 */
export function createCardLightBeamEffect(card: HTMLElement) {
  if (isTouchDevice() || !hasFineHoverPointer() || prefersReducedMotion()) return () => {};

  let rect = card.getBoundingClientRect();
  const updateRect = () => {
    rect = card.getBoundingClientRect();
  };

  const applyMouseMove = createRafThrottle((clientX: number, clientY: number) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--mouse-active', '1');
  });

  const handleMouseMove = (e: MouseEvent) => {
    applyMouseMove(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    applyMouseMove.cancel();
    card.style.setProperty('--mouse-active', '0');
  };

  card.addEventListener('mouseenter', updateRect);
  card.addEventListener('mousemove', handleMouseMove, { passive: true });
  card.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('resize', updateRect, { passive: true });

  return () => {
    applyMouseMove.cancel();
    card.removeEventListener('mouseenter', updateRect);
    card.removeEventListener('mousemove', handleMouseMove);
    card.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('resize', updateRect);
  };
}

/**
 * Attaches a magnetic cursor pull effect to a button element using gsap.quickTo,
 * including independent child icon shift and elastic recovery.
 */
export function createMagneticButtonEffect(
  button: HTMLElement,
  options: { maxDistance?: number; strength?: number; iconSelector?: string } = {}
) {
  if (isTouchDevice() || !hasFineHoverPointer() || prefersReducedMotion()) return () => {};

  const { maxDistance = 14, strength = 0.28, iconSelector = 'svg, img, .magnetic-icon' } = options;

  const xTo = gsap.quickTo(button, 'x', { duration: 0.35, ease: 'power3.out' });
  const yTo = gsap.quickTo(button, 'y', { duration: 0.35, ease: 'power3.out' });

  const iconEl = button.querySelector<HTMLElement>(iconSelector);
  const iconXTo = iconEl ? gsap.quickTo(iconEl, 'x', { duration: 0.3, ease: 'power2.out' }) : null;
  const iconYTo = iconEl ? gsap.quickTo(iconEl, 'y', { duration: 0.3, ease: 'power2.out' }) : null;

  let rect = button.getBoundingClientRect();
  const updateRect = () => {
    rect = button.getBoundingClientRect();
  };

  const applyMouseMove = createRafThrottle((clientX: number, clientY: number) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;

    const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

    xTo(clampedX);
    yTo(clampedY);

    if (iconXTo && iconYTo) {
      iconXTo(clampedX * 0.45);
      iconYTo(clampedY * 0.45);
    }
  });

  const handleMouseMove = (e: MouseEvent) => {
    applyMouseMove(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    applyMouseMove.cancel();
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: MotionEases.elasticOut,
      force3D: true,
      overwrite: 'auto',
    });
    if (iconEl) {
      gsap.to(iconEl, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: MotionEases.elasticOut,
        force3D: true,
        overwrite: 'auto',
      });
    }
  };

  button.addEventListener('mouseenter', updateRect);
  button.addEventListener('mousemove', handleMouseMove, { passive: true });
  button.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('resize', updateRect, { passive: true });

  return () => {
    applyMouseMove.cancel();
    button.removeEventListener('mouseenter', updateRect);
    button.removeEventListener('mousemove', handleMouseMove);
    button.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('resize', updateRect);
    xTo(0);
    yTo(0);
    if (iconEl) {
      gsap.set(iconEl, { x: 0, y: 0 });
    }
  };
}

/**
 * Creates a lightweight particle burst around an element (15-25 particles).
 */
export function createParticleBurst(
  container: HTMLElement,
  options: {
    count?: number;
    colors?: string[];
    radius?: number;
    duration?: number;
  } = {}
) {
  if (prefersReducedMotion()) return;

  const {
    count = 20,
    colors = ['#FFA28D', '#7B2CBF', '#00F0FF', '#FF007F', '#FFD700', '#FFFFFF'],
    radius = 70,
    duration = 0.9,
  } = options;

  const rect = container.getBoundingClientRect();
  const originX = rect.width / 2;
  const originY = rect.height / 2;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const color = colors[i % colors.length];
    const size = Math.random() * 4 + 3;

    particle.style.cssText = `
      position: absolute;
      left: ${originX}px;
      top: ${originY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 50;
      box-shadow: 0 0 8px ${color};
    `;

    container.appendChild(particle);

    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = radius * (0.6 + Math.random() * 0.6);
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    gsap.to(particle, {
      x: destX,
      y: destY,
      scale: Math.random() * 0.5 + 0.2,
      opacity: 0,
      duration: duration * (0.7 + Math.random() * 0.5),
      ease: 'power3.out',
      onComplete: () => {
        if (particle.parentNode === container) {
          container.removeChild(particle);
        }
      },
    });
  }
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

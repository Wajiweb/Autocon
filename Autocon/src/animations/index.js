/**
 * animations/index.js — Unified animation layer.
 * Merges: variants.js + ParallaxScroll.jsx + TiltCard.jsx
 *
 * Import from this barrel:
 *   import { slideUp, TiltCard, ParallaxScroll } from '../animations';
 */

// ─────────────────────────────────────────────────────────────────────────────
// Motion Variants
// ─────────────────────────────────────────────────────────────────────────────
export { default as TiltCard } from './TiltCard';
export { default as ParallaxScroll } from './ParallaxScroll';

export const easing = {
  smooth: [0.25, 0.1, 0.25, 1],
  spring: { type: 'spring', bounce: 0.25, duration: 0.5 },
};

export const transitionProps = {
  duration: 0.3,
  ease: 'easeOut'
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitionProps
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...transitionProps, ease: easing.smooth }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const slideLeft = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...transitionProps, ease: easing.smooth }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...transitionProps, ease: easing.smooth }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: easing.spring
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

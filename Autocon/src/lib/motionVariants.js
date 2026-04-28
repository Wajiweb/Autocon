/**
 * motionVariants.js
 * Central Framer Motion animation configuration.
 * Import from here — never define one-off variants inline.
 */

// ── Reduced Motion Support ────────────────────────────────────────────────
// Detects OS-level "reduce motion" preference and small screens.
// Import and spread into motion components that support it.

/**
 * Returns true if the user prefers reduced motion OR is on a small screen.
 * Call inside a component; result is stable per render.
 */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Returns true on mobile viewports (< 768px).
 * Used to disable heavy float/parallax animations.
 */
export const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;

/**
 * Conditionally returns animation props.
 * If reducedMotion or mobile → returns empty object (no animation).
 * Usage: <motion.div {...conditionalMotion(floatY)} />
 */
export const conditionalMotion = (variant, { allowOnMobile = false } = {}) => {
  if (prefersReducedMotion()) return {};
  if (!allowOnMobile && isMobileViewport()) return {};
  return variant;
};

// ── Fade Up (section reveal) ──────────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Fade In (simple opacity) ──────────────────────────────────────────────
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// ── Scale In (cards, badges) ──────────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Slide In Right (split-layout visuals) ────────────────────────────────
export const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Slide In Left ────────────────────────────────────────────────────────
export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Stagger Container (wraps staggered children) ──────────────────────────
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

// ── Float Y (Hero visual, bubbles) ────────────────────────────────────────
export const floatY = {
  animate: {
    y: [0, -14, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ── Float Y Slow (background blobs) ──────────────────────────────────────
export const floatYSlow = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ── Rotate Float (Hero card tilt) ─────────────────────────────────────────
export const rotateFloat = {
  animate: {
    y: [0, -14, 0],
    rotate: [-3, -5, -3],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ── Marquee (infinite horizontal scroll) ─────────────────────────────────
export const marqueeX = {
  animate: {
    x: ['0%', '-50%'],
    transition: {
      duration: 22,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ── Marquee Reverse ──────────────────────────────────────────────────────
export const marqueeXReverse = {
  animate: {
    x: ['-50%', '0%'],
    transition: {
      duration: 28,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ── Hover Scale ───────────────────────────────────────────────────────────
export const hoverScale = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap:   { scale: 0.97 },
};

// ── Hover Lift (cards) ────────────────────────────────────────────────────
export const hoverLift = {
  whileHover: { y: -6, transition: { duration: 0.25, ease: 'easeOut' } },
  whileTap:   { scale: 0.98 },
};

// ── Navbar Slide Down ────────────────────────────────────────────────────
export const navbarSlideDown = {
  initial: { y: -80, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Accordion Content ─────────────────────────────────────────────────────
export const accordionContent = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.28, ease: 'easeIn' },
  },
};

// ── Viewport trigger defaults ─────────────────────────────────────────────
export const viewportConfig = { once: true, amount: 0.18 };

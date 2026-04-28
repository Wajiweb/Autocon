/**
 * LandingCard.jsx — Landing Page Card Primitive
 * Provides consistent border-based dark card styling with hover lift animation.
 * Use for feature cards, testimonial cards, etc.
 * Separate from dashboard Card.jsx to avoid API conflicts.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from '../../lib/motionVariants';

export default function LandingCard({
  children,
  style     = {},
  className = '',
  elevated  = false,
  ...rest
}) {
  return (
    <motion.div
      {...hoverLift}
      style={{
        background:   elevated ? 'var(--lp-surface-elevated)' : 'var(--lp-surface)',
        border:       '1px solid var(--lp-border-subtle)',
        borderRadius: '18px',
        padding:      '28px',
        position:     'relative',
        overflow:     'hidden',
        willChange:   'transform',
        ...style,
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export { LandingCard };

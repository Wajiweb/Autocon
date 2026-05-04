/**
 * LandingCard.jsx — Optimized Feature Card
 * Performance: No continuous animations, blur ≤20px, transform/opacity only
 */
import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from '../../lib/motionVariants';

function CardGlow({ glowIntensity = 'medium', accentColor = '14' }) {
  const intensityMap = {
    low: '0.1',
    medium: '0.15',
    high: '0.2',
  };
  const intensity = intensityMap[glowIntensity] || intensityMap.medium;

  return (
    <div
      className="card-glow-layer"
      style={{
        position:   'absolute',
        top:        '-30%',
        left:       '-20%',
        right:      '-20%',
        bottom:     '-30%',
        zIndex:     0,
        background: `radial-gradient(
          ellipse 100% 80% at 35% 0%,
          hsla(${accentColor},100%,50%,${intensity}) 0%,
          hsla(${accentColor},100%,50%,${intensity * 0.5}) 50%,
          transparent 80%
        )`,
        pointerEvents: 'none',
        borderRadius: '24px',
        filter: 'blur(16px)',
        willChange: 'opacity',
      }}
    />
  );
}

function BorderGlow({ accentColor = '14' }) {
  return (
    <div
      className="card-border-glow"
      style={{
        position:   'absolute',
        inset:      '-1px',
        zIndex:     1,
        borderRadius: '21px',
        background: `linear-gradient(145deg, hsla(${accentColor},100%,50%,0.2) 0%, transparent 60%)`,
        opacity:    0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }}
    />
  );
}

export default function LandingCard({
  children,
  style = {},
  className = '',
  elevated = false,
  glowIntensity = 'medium',
  accentColor = '14',
  ...rest
}) {
  return (
    <motion.div
      {...hoverLift}
      style={{
        background: elevated
          ? 'linear-gradient(165deg, hsl(240, 8%, 14%) 0%, hsl(240, 8%, 10%) 30%, hsl(240, 8%, 6%) 100%)'
          : 'linear-gradient(165deg, hsl(240, 6%, 12%) 0%, hsl(240, 6%, 9%) 30%, hsl(240, 6%, 5%) 100%)',
        border: '1px solid hsla(0,0%,100%,0.04)',
        borderRadius: '20px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        ...style,
      }}
      className={`premium-feature-card ${className}`}
      {...rest}
    >
      <CardGlow glowIntensity={glowIntensity} accentColor={accentColor} />
      <BorderGlow accentColor={accentColor} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
}

export { LandingCard };
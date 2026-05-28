import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ACCENT_GLOW_MAP = {
  orange: 'hsla(25, 100%, 50%, 0.08)',
  blue: 'hsla(217, 91%, 60%, 0.08)',
  green: 'hsla(142, 70%, 50%, 0.06)',
  neutral: 'rgba(255, 255, 255, 0.03)',
  none: 'transparent',
};

const PADDING_MAP = {
  none: '0px',
  sm: '12px 16px',
  md: '20px 24px',
  lg: '28px 32px',
};

export function GlassCard({
  children,
  as: Component = 'div',
  accent = 'none',
  padding = 'md',
  hoverable = true,
  delay = 0,
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  const shouldReduceMotion = useReducedMotion();
  const glowColor = ACCENT_GLOW_MAP[accent] ?? ACCENT_GLOW_MAP.none;
  const paddingVal = PADDING_MAP[padding] ?? PADDING_MAP.md;

  const containerVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: delay,
      },
    },
  };

  const interactiveProps = hoverable && !shouldReduceMotion
    ? {
        whileHover: { y: -2, transition: { duration: 0.2, ease: 'easeOut' } },
        whileTap: { y: 0 },
      }
    : {};

  // Custom component wrapper that could be a motion div or normal component
  const Element = onClick || hoverable ? motion[Component] ?? motion.div : Component;

  return (
    <Element
      initial={shouldReduceMotion ? 'visible' : 'hidden'}
      animate='visible'
      variants={containerVariants}
      className={`surface-card ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
      style={{
        padding: paddingVal,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...interactiveProps}
      {...rest}
    >
      {/* Background Glow Ambient Element */}
      {glowColor !== 'transparent' && (
        <div
          aria-hidden='true'
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: glowColor,
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Internal Content Container */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </Element>
  );
}

export default GlassCard;

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const VARIANT_MAP = {
  default: {
    borderColor: 'var(--outline-subtle)',
    glowBg: 'transparent',
    shadow: 'var(--shadow-card)',
  },
  primary: {
    borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
    glowBg: 'color-mix(in srgb, var(--primary) 8%, transparent)',
    shadow: 'var(--shadow-glow), var(--shadow-card)',
  },
  elevated: {
    borderColor: 'var(--outline)',
    glowBg: 'color-mix(in srgb, var(--ai-accent) 6%, transparent)',
    shadow: 'var(--shadow-card-hover)',
  },
};

export function AnimatedCard({
  children,
  delay = 0,
  className = '',
  style = {},
  variant = 'default',
  as: Component = 'div',
}) {
  const shouldReduceMotion = useReducedMotion();
  const tokens = VARIANT_MAP[variant] ?? VARIANT_MAP.default;

  const containerVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 280,
        damping: 28,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
      variants={containerVariants}
      className={className}
      style={{
        background: 'linear-gradient(145deg, var(--card), var(--card-elevated))',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `0.5px solid ${tokens.borderColor}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: `${tokens.shadow}, inset 0 1px 0 rgba(255,255,255,0.025)`,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {tokens.glowBg !== 'transparent' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: tokens.glowBg,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}

export default AnimatedCard;

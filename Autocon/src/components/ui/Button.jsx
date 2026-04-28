/**
 * Button.jsx — Landing Page Button Primitive
 * Variants: primary | secondary | ghost
 * Supports: href (renders <a>), onClick, disabled, children, aria-label
 */
import React from 'react';
import { motion } from 'framer-motion';

const styles = {
  base: {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '8px',
    borderRadius:   '12px',
    fontFamily:     '"Inter", sans-serif',
    fontWeight:     700,
    fontSize:       '0.95rem',
    cursor:         'pointer',
    border:         'none',
    outline:        'none',
    textDecoration: 'none',
    willChange:     'transform',
    padding:        '13px 28px',
    transition:     'background 0.2s, color 0.2s, border-color 0.2s',
  },
  primary: {
    background: 'var(--lp-accent)',
    color:      'var(--surface)',
  },
  secondary: {
    background:  'transparent',
    color:       'var(--lp-text-primary)',
    border:      '1.5px solid var(--lp-border)',
  },
  ghost: {
    background:  'var(--lp-accent-soft)',
    color:       'var(--lp-accent)',
    border:      '1.5px solid var(--lp-accent)',
  },
  disabled: {
    opacity:       0.45,
    cursor:        'not-allowed',
    pointerEvents: 'none',
  },
};

function Button({
  children,
  variant   = 'primary',
  href,
  onClick,
  disabled  = false,
  className = '',
  style     = {},
  'aria-label': ariaLabel,
  ...rest
}) {
  const combined = {
    ...styles.base,
    ...styles[variant],
    ...(disabled ? styles.disabled : {}),
    ...style,
  };

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.04, transition: { duration: 0.18 } },
    whileTap:   disabled ? {} : { scale: 0.97 },
  };

  if (href) {
    return (
      <motion.a
        href={href}
        style={combined}
        className={className}
        aria-label={ariaLabel}
        {...motionProps}
        {...rest}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      style={combined}
      className={className}
      aria-label={ariaLabel}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export default Button;
// Named export for backward compatibility with dashboard imports using { Button }
export { Button };

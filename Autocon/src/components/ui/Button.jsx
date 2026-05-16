/**
 * Button.jsx — Standardized Dashboard Button Component
 * Variants: primary | secondary | ghost | danger
 * Sizes: sm | md | lg
 * Supports: loading state, href (renders <a>), onClick, disabled, framer-motion interactions
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  href,
  onClick,
  disabled  = false,
  loading   = false,
  className = '',
  style     = {},
  'aria-label': ariaLabel,
  ...rest
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const loadingClass = loading ? 'btn-loading' : '';
  
  const combinedClasses = [
    baseClass,
    variantClass,
    sizeClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const motionProps = {
    whileHover: (disabled || loading) ? {} : { scale: 1.02, transition: { duration: 0.18 } },
    whileTap:   (disabled || loading) ? {} : { scale: 0.98 },
  };

  const content = (
    <>
      {loading && <Loader2 className="btn-spinner" size={16} />}
      <span className="btn-content" style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={combinedClasses}
        style={style}
        aria-label={ariaLabel}
        onClick={(e) => {
          if (disabled || loading) e.preventDefault();
          else if (onClick) onClick(e);
        }}
        {...motionProps}
        {...rest}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      style={style}
      aria-label={ariaLabel}
      {...motionProps}
      {...rest}
    >
      {content}
    </motion.button>
  );
}

export default Button;

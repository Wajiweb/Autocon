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
  icon      = null,
  iconPosition = 'left',
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
    whileHover: (disabled || loading) ? {} : { y: -1, transition: { duration: 0.18, ease: "easeOut" } },
    whileTap:   (disabled || loading) ? {} : { y: 0 },
  };

  const content = (
    <>
      {loading && <Loader2 className="btn-spinner" size={16} />}
      <span className="btn-content flex items-center justify-center gap-2" style={{ opacity: loading ? 0 : 1 }}>
        {icon && iconPosition === 'left' && <span className="btn-icon flex items-center">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="btn-icon flex items-center">{icon}</span>}
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

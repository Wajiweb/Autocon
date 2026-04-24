import React from 'react';

/**
 * Shared Card Component
 * Standardizes card backgrounds, padding, and borders.
 */
export const Card = ({
  children,
  className = '',
  padding = 'p-6', // default to 24px padding
  variant = 'default', // 'default', 'glass', 'highlight'
  ...props
}) => {
  const baseStyles = 'rounded-2xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-[var(--surface)] border-[var(--outline-variant)]',
    glass: 'bg-[var(--surface)]/80 backdrop-blur-md border-[var(--outline-variant)] shadow-[var(--shadow-ambient)]',
    highlight: 'bg-[var(--surface-highest)] border-[var(--primary)]/30 shadow-[var(--shadow-primary)]'
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${padding} ${className}`} {...props}>
      {children}
    </div>
  );
};

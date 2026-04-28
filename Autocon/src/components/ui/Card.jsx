import React from 'react';

/**
 * Shared Card Component
 * Standardizes card backgrounds, padding, and borders for the AutoCon Dashboard Theme.
 */
export const Card = ({
  children,
  className = '',
  padding = 'p-6', // default to 24px padding
  variant = 'default', // 'default' (gradient), 'solid' (small cards), 'glass', 'highlight'
  style,
  ...props
}) => {
  const baseStyles = 'rounded-[var(--radius-lg)] border transition-all duration-300';
  
  const variants = {
    default: 'bg-gradient-to-br from-[var(--card)] to-[var(--card-elevated)] text-[color:var(--text-primary)] border-[var(--border-dark)] shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]',
    solid: 'bg-[var(--card-elevated)] text-[color:var(--text-primary)] border-[var(--border-dark)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:bg-[var(--card-hover)]',
    glass: 'bg-gradient-to-br from-[var(--card)] to-[var(--card-elevated)] text-[color:var(--text-primary)] border-[var(--border-dark)] shadow-[var(--shadow-card)]',
    highlight: 'bg-[var(--card-active)] text-[color:var(--text-primary)] border-[var(--primary)]/30 shadow-[var(--shadow-glow)] hover:-translate-y-1',
    light: 'bg-[var(--surface-low)] text-[color:var(--text-primary)] border-[var(--border-light)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5'
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant] || variants.default} ${padding} ${className}`}
      style={{
        '--on-surface': variant === 'light' ? 'var(--text-primary)' : 'var(--text-dark-primary)',
        '--on-surface-variant': variant === 'light' ? 'var(--text-secondary)' : 'var(--text-dark-secondary)',
        '--on-surface-muted': variant === 'light' ? 'var(--text-muted)' : 'var(--text-dark-muted)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

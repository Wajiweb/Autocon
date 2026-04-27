import React from 'react';

/**
 * Shared Button Component
 * Standardizes button styles, sizes, and states across the application.
 */
export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'danger'
  size = 'md',         // 'sm', 'md', 'lg', 'icon'
  disabled = false,
  isLoading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg)] active:scale-95';
  
  const variants = {
    primary: 'bg-[var(--primary)] text-[#022C22] hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 focus:ring-[var(--primary)] border-none shadow-[0_10px_24px_rgba(34,197,94,0.18)]',
    secondary: 'bg-[var(--card-elevated)] text-[var(--text-primary)] border border-[var(--border-dark)] hover:border-[var(--primary)]/30 hover:bg-[var(--card-hover)] focus:ring-[var(--primary)]',
    ghost: 'bg-transparent text-[var(--primary)] hover:bg-[rgba(34,197,94,0.08)] border-none',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500',
    ai: 'btn-ai hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 focus:ring-[var(--ai-accent)] border-none'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-[var(--radius-sm)] gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-[var(--radius-md)] gap-2',
    lg: 'text-[1.05rem] px-6 py-3.5 rounded-[var(--radius-lg)] gap-2.5 w-full',
    icon: 'p-2 rounded-[var(--radius-sm)]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

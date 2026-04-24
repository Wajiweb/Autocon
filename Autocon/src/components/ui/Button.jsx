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
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] active:scale-95';
  
  const variants = {
    primary: 'bg-[var(--primary-gradient)] text-white shadow-[var(--shadow-primary)] hover:shadow-lg hover:-translate-y-0.5 focus:ring-[#7C3AED] border-none',
    secondary: 'bg-[var(--surface-highest)] text-[var(--on-surface)] border border-[var(--outline-variant)] hover:border-[var(--outline)] hover:bg-[var(--surface-hover)] focus:ring-[var(--outline)]',
    ghost: 'bg-transparent text-[var(--outline)] hover:text-[var(--on-surface)] hover:bg-[var(--surface)] border-none',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-[1.05rem] px-6 py-3.5 rounded-[14px] gap-2.5 w-full',
    icon: 'p-2 rounded-lg'
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

import React, { forwardRef } from 'react';

/**
 * Shared Input Component
 * Standardizes text inputs and textareas across the application.
 */
export const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  wrapperClassName = '',
  type = 'text',
  multiline = false,
  rows = 4,
  ...props
}, ref) => {
  const baseInputStyles = `
    w-full bg-[var(--surface)] text-[var(--on-surface)] border border-[var(--outline-variant)] 
    rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200
    placeholder:text-[var(--outline)]
    hover:border-[var(--outline)] 
    focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  const inputClasses = `${baseInputStyles} ${errorStyles} ${className}`;

  return (
    <div className={`flex flex-col gap-2 mb-6 ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-bold text-[var(--outline)] uppercase tracking-wider">
          {label}
        </label>
      )}
      
      {multiline ? (
        <textarea
          ref={ref}
          className={`${inputClasses} resize-y min-h-[100px]`}
          rows={rows}
          {...props}
        />
      ) : (
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
      )}

      {(error || helperText) && (
        <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-[var(--outline)]'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

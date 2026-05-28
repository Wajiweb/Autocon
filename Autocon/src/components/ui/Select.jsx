import React, { forwardRef } from 'react';
import { FormField } from './FormSection';

export const Select = forwardRef(({
  label,
  hint,
  error,
  required,
  options = [],
  placeholder = 'Select an option...',
  className = '',
  id,
  children,
  ...rest
}, ref) => {
  const selectEl = (
    <div className="relative flex items-center w-full">
      <select
        ref={ref}
        id={id}
        className={`input select surface-input appearance-none pr-10 cursor-pointer ${error ? 'border-red-500/50' : ''} ${className}`}
        required={required}
        {...rest}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children ? children : options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      
      {/* Premium custom caret dropdown indicator */}
      <span className="absolute right-3.5 text-on-surface-muted pointer-events-none flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );

  if (label || hint || error) {
    return (
      <FormField label={label} hint={hint} error={error} required={required}>
        {selectEl}
      </FormField>
    );
  }

  return selectEl;
});

Select.displayName = 'Select';
export default Select;

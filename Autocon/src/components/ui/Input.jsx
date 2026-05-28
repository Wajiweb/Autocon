import React, { forwardRef } from 'react';
import { FormField } from './FormSection';

export const Input = forwardRef(({
  label,
  hint,
  error,
  required,
  icon,
  className = '',
  id,
  type = 'text',
  ...rest
}, ref) => {
  const inputEl = (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-3.5 text-on-surface-muted pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`input surface-input ${icon ? 'pl-10' : ''} ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        required={required}
        {...rest}
      />
    </div>
  );

  if (label || hint || error) {
    return (
      <FormField label={label} hint={hint} error={error} required={required}>
        {inputEl}
      </FormField>
    );
  }

  return inputEl;
});

Input.displayName = 'Input';
export default Input;

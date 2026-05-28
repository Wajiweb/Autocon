import React from 'react';

/**
 * FormSection
 * Renders a standardized form section header and input grid container.
 */
export function FormSection({
  title,
  description,
  children,
  className = '',
  ...rest
}) {
  return (
    <section className={`form-section mb-8 pb-6 border-b border-white/5 last:border-0 last:pb-0 ${className}`} {...rest}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Info panel */}
        {(title || description) && (
          <div className="md:w-1/3 flex flex-col gap-1.5">
            {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-on-surface-variant leading-relaxed">{description}</p>}
          </div>
        )}
        
        {/* Content panel */}
        <div className={`flex-1 flex flex-col gap-4 ${title || description ? 'md:w-2/3' : 'w-full'}`}>
          {children}
        </div>
      </div>
    </section>
  );
}

/**
 * FormField
 * Wraps individual input components with standardized label, required indicator, hint message, and error alerts.
 */
export function FormField({
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
  ...rest
}) {
  return (
    <div className={`form-field flex flex-col gap-1.5 w-full ${className}`} {...rest}>
      {label && (
        <label className="micro-label flex items-center gap-1 select-none">
          {label}
          {required && <span className="text-primary font-bold" aria-hidden="true">*</span>}
        </label>
      )}
      
      {/* Input container slot */}
      <div className="form-field-control relative w-full">
        {children}
      </div>

      {/* Status feedback */}
      {error && (
        <span className="text-xs text-error font-medium animate-fade-in" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span className="text-xs text-on-surface-muted leading-normal">
          {hint}
        </span>
      )}
    </div>
  );
}

export default FormSection;

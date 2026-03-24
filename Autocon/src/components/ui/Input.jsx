import React, { forwardRef } from 'react';

/**
 * Input — Accessible, standardized form input component.
 * Links label via htmlFor/id. Supports all native input props.
 * 
 * @param {string}  id          - Required for a11y label linkage.
 * @param {string}  label       - Visible label text above the field.
 * @param {string}  className   - Extra classes for the wrapper div.
 * @param {string}  inputClass  - Extra classes for the input element.
 */
const Input = forwardRef(function Input(
    { id, label, type = 'text', placeholder, className = '', inputClass = '', ...props },
    ref
) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                type={type}
                placeholder={placeholder}
                className={[
                    // Base
                    'w-full px-4 py-3 rounded-xl text-sm font-medium',
                    // Colors
                    'bg-[#161d2b] text-white placeholder-gray-500',
                    // Border
                    'border border-white/10',
                    // Focus — glow ring, no default outline
                    'focus:outline-none focus:border-transparent',
                    'focus:ring-2 focus:ring-[#a78bfa]/50',
                    // Transition — only opacity/transform-safe props
                    'transition-all duration-200',
                    inputClass,
                ].join(' ')}
                {...props}
            />
        </div>
    );
});

export default Input;

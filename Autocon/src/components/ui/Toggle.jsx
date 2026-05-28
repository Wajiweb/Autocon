import React from 'react';

export function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  variant = 'button', // 'button' (like Wizard select block) or 'switch' (inline classic switch)
  className = '',
  ...rest
}) {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`wz-toggle text-left ${checked ? 'on' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...rest}
      >
        <div className="wz-toggle-knob" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          {label && <span className="wz-toggle-name">{label}</span>}
          {description && <span className="text-[10px] text-on-surface-muted leading-tight">{description}</span>}
        </div>
      </button>
    );
  }

  // Classic inline switch layout
  return (
    <div
      onClick={handleToggle}
      className={`flex items-center justify-between gap-4 p-3 border border-white/5 rounded-xl bg-white/[0.015] backdrop-blur-md cursor-pointer select-none transition-colors hover:border-white/10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...rest}
    >
      <div className="flex flex-col gap-0.5">
        {label && <span className="text-sm font-semibold text-white">{label}</span>}
        {description && <span className="text-xs text-on-surface-muted leading-normal">{description}</span>}
      </div>
      <div
        className={`wz-toggle-knob ${checked ? 'bg-primary border-primary' : 'bg-surface'}`}
        style={{
          width: '36px',
          height: '20px',
          borderRadius: '10px',
          border: '0.5px solid var(--border-dark)',
          position: 'relative',
          flexShrink: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <div
          style={{
            content: "''",
            position: 'absolute',
            top: '3px',
            left: '3px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#fff',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 0.15s ease',
          }}
        />
      </div>
    </div>
  );
}

export default Toggle;

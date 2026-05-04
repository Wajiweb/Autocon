import React from 'react';

export function Toggle({
  name,
  checked,
  onChange,
  label,
  description,
  disabled = false
}) {
  const handleChange = () => {
    onChange({
      target: {
        name,
        value: !checked
      }
    });
  };

  return (
    <label className={`flex items-center justify-between py-2 px-3 rounded-lg border cursor-pointer transition-all ${checked ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30' : 'bg-transparent border-[var(--border-light)] hover:border-[var(--primary)]/30'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--on-surface)]">{label}</span>
        {description && (
          <span className="text-xs text-[var(--on-surface-muted)]">{description}</span>
        )}
      </div>
      <div 
        onClick={!disabled ? handleChange : undefined}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--border-light)]'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </label>
  );
}

export function Select({
  name,
  value,
  onChange,
  label,
  options = [],
  placeholder = 'Select...',
  wrapperClassName = ''
}) {
  return (
    <div className={`flex flex-col gap-2 mb-4 ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full bg-[var(--bg-secondary)] text-[color:var(--text-primary)] border border-[var(--border-dark)] rounded-[var(--radius-md)] px-4 py-3 text-sm outline-none transition-all duration-200 hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
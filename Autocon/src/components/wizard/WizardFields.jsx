import React from 'react';

export function Field({ label, required, hint, error, children, span2 }) {
  return (
    <div className={`wz-field${span2 ? ' span2' : ''}`}>
      <label className="wz-label">{label}{required && <span>*</span>}</label>
      {children}
      {hint  && <span className="wz-hint">{hint}</span>}
      {error && <span className="wz-error-msg">{error}</span>}
    </div>
  );
}

export function Toggle({ label, value, onChange }) {
  return (
    <div className={`wz-toggle${value ? ' on' : ''}`} onClick={() => onChange(!value)}>
      <div className="wz-toggle-knob" />
      <span className="wz-toggle-name">{label}</span>
    </div>
  );
}

export function Inp({ params, k, placeholder, type = 'text', onChange, errors }) {
  return (
    <input
      className={`wz-input${errors[k] ? ' error' : ''}`}
      value={params[k] ?? ''}
      onChange={e => onChange({ ...params, [k]: e.target.value })}
      placeholder={placeholder} type={type}
    />
  );
}

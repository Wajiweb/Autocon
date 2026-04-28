import React from 'react';

/* ─── Reusable scroll-reveal wrapper ─── */
export const Reveal = ({ children, delay = 0, y = 30, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

/* ─── Pill Badge ─── */
export const PillBadge = ({ children }) => (
  <span style={{
    display: 'inline-block', padding: '6px 18px', borderRadius: '99px',
    background: 'var(--surface-elevated)', border: '1px solid var(--border)',
    fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)',
    letterSpacing: '0.01em', marginBottom: '24px',
  }}>{children}</span>
);

/* ─── Section heading ─── */
export const SectionHeading = ({ pre, highlight, after, sub, center = true }) => (
  <div style={{ textAlign: center ? 'center' : 'left' }}>
    <h2 style={{
      fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', fontWeight: 700,
      color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1,
      marginBottom: sub ? '20px' : 0,
    }}>
      {pre}{' '}
      {highlight && (
        <span style={{ color: 'var(--primary)' }}>{highlight}</span>
      )}
      {after && <> {after}</>}
    </h2>
    {sub && (
      <p style={{
        color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7,
        maxWidth: center ? '560px' : '100%', margin: center ? '0 auto' : '0',
      }}>{sub}</p>
    )}
  </div>
);
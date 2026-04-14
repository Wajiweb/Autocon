import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─── Reusable scroll-reveal wrapper ─── */
export const Reveal = ({ children, delay = 0, y = 30, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Pill Badge ─── */
export const PillBadge = ({ children }) => (
  <span style={{
    display: 'inline-block', padding: '6px 18px', borderRadius: '99px',
    background: 'var(--surface-low)', border: '1px solid var(--outline-variant)',
    fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)',
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
        <span style={{
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{highlight}</span>
      )}
      {after && <> {after}</>}
    </h2>
    {sub && (
      <p style={{
        color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7,
        maxWidth: center ? '560px' : '100%', margin: center ? '0 auto' : '0',
      }}>{sub}</p>
    )}
  </div>
);
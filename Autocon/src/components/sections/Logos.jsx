/**
 * Logos.jsx — Infinite horizontal partner/chain logo marquee
 * Duplicated list for seamless loop. aria-hidden on decorative content.
 */
import React from 'react';
import { motion } from 'framer-motion';
import Container from '../layout/Container';
import { marqueeX } from '../../lib/motionVariants';

const LOGOS = [
  { name: 'Ethereum',      emoji: '⟠' },
  { name: 'Polygon',       emoji: '⬡' },
  { name: 'BNB Chain',     emoji: '◆' },
  { name: 'Avalanche',     emoji: '▲' },
  { name: 'Chainlink',     emoji: '⬡' },
  { name: 'OpenZeppelin',  emoji: '🛡' },
  { name: 'MetaMask',      emoji: '🦊' },
  { name: 'Solidity',      emoji: '◎' },
];

function LogoItem({ name, emoji }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '12px 28px',
        borderRadius: '12px',
        border:       '1px solid var(--lp-border-subtle)',
        background:   'var(--lp-surface)',
        whiteSpace:   'nowrap',
        flexShrink:   0,
        marginRight:  '14px',
        userSelect:   'none',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--lp-text-muted)', letterSpacing: '-0.01em' }}>
        {name}
      </span>
    </div>
  );
}

export default function Logos() {
  // Duplicate for seamless loop
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <section
      aria-label="Partner and technology logos"
      style={{
        paddingTop:    'clamp(32px, 6vw, 64px)',
        paddingBottom: 'clamp(32px, 6vw, 64px)',
        borderTop:     '1px solid var(--lp-border-subtle)',
        borderBottom:  '1px solid var(--lp-border-subtle)',
        overflow:      'hidden',
        position:      'relative',
      }}
    >
      {/* Screen reader text */}
      <p className="sr-only">
        Supported technologies and partners: {LOGOS.map(l => l.name).join(', ')}
      </p>

      {/* Fade edges */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', zIndex: 1,
        background: 'linear-gradient(to right, var(--lp-bg), transparent)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', zIndex: 1,
        background: 'linear-gradient(to left, var(--lp-bg), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Marquee track */}
      <motion.div
        variants={marqueeX}
        animate="animate"
        style={{ display: 'inline-flex', willChange: 'transform' }}
      >
        {doubled.map((logo, i) => (
          <LogoItem key={`${logo.name}-${i}`} {...logo} />
        ))}
      </motion.div>
    </section>
  );
}

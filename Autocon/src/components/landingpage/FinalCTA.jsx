import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from './Shared';

/* ══════════════════════════════════════════════════════
   FINAL CTA BANNER — Clean, professional
══════════════════════════════════════════════════════ */
const FinalCTA = ({ onGetStarted }) => (
  <section style={{ padding: '0 48px 120px', background: 'var(--bg)', position: 'relative' }}>
    <Reveal>
      <div style={{
        maxWidth: '1160px', margin: '0 auto', textAlign: 'center',
        padding: '80px 40px', background: 'var(--surface)',
        borderRadius: '32px', position: 'relative', overflow: 'hidden',
        border: '1px solid var(--outline-subtle)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 700, color: 'var(--on-surface)',
            lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: '20px',
          }}>Empower Your Web3 Journey<br />with AutoCon</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.75 }}>
            Join developers worldwide and deploy production-ready smart contracts today — no Solidity expertise required.
          </p>
          <button onClick={onGetStarted}
            style={{
              padding: '15px 44px', borderRadius: '12px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '0.97rem', fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.2s ease', letterSpacing: '-0.01em',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = ''; }}>
            Get Started Free
          </button>
        </div>
      </div>
    </Reveal>
  </section>
);

export default FinalCTA;

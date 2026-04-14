import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from './Shared';

/* ══════════════════════════════════════════════════════
   FINAL CTA BANNER
══════════════════════════════════════════════════════ */
const FinalCTA = ({ onGetStarted }) => (
  <section style={{ padding: '0 48px 120px', background: 'var(--bg)', position: 'relative' }}>
    <Reveal>
      <div style={{
        maxWidth: '1160px', margin: '0 auto', textAlign: 'center',
        padding: '80px 40px', background: 'linear-gradient(135deg, var(--surface-low) 0%, var(--bg) 100%)',
        borderRadius: '32px', position: 'relative', overflow: 'hidden',
        border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 60%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 700, color: 'var(--text-primary)',
            lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: '20px',
          }}>Empower Your Web3 Journey<br />with AutoCon</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.75 }}>
            Join developers worldwide and deploy production-ready smart contracts today — no Solidity expertise required.
          </p>
          <motion.button onClick={onGetStarted} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '15px 44px', borderRadius: '12px', border: 'none',
              background: '#c6f100', color: '#000', fontSize: '0.97rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(198,241,0,0.35)', letterSpacing: '-0.01em',
            }}>
            Get Started Free
          </motion.button>
        </div>
      </div>
    </Reveal>
  </section>
);

export default FinalCTA;

import React from 'react';
import { Reveal } from './Shared';

const FinalCTA = ({ onGetStarted }) => (
  <section style={{ padding: '0 48px 120px', background: 'var(--surface)', position: 'relative' }}>
    <Reveal>
      <div style={{
        maxWidth: '1160px', margin: '0 auto', textAlign: 'center',
        padding: '80px 40px', background: 'var(--surface-elevated)',
        borderRadius: '32px', position: 'relative', overflow: 'hidden',
        border: '1px solid #ddd',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 700, color: 'var(--text-primary)',
            lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: '20px',
          }}>Empower Your Web3 Journey<br />with AutoCon</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.75 }}>
            Join developers worldwide and deploy production-ready smart contracts today — no Solidity expertise required.
          </p>
          <button onClick={onGetStarted}
            style={{
              padding: '15px 44px', borderRadius: '12px', border: 'none',
              background: 'var(--primary)', color: 'var(--surface)', fontSize: '0.97rem', fontWeight: 800, cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}>
            Get Started Free
          </button>
        </div>
      </div>
    </Reveal>
  </section>
);

export default FinalCTA;

import React from 'react';
import { Shield, Check } from 'lucide-react';
import { Reveal, PillBadge, SectionHeading } from './Shared';

/* ══════════════════════════════════════════════════════
   SECURITY SECTION — Clean, no animated pulses
══════════════════════════════════════════════════════ */
const SecuritySection = () => (
  <section id="security" style={{ background: 'var(--bg)', padding: '80px 48px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <Reveal>
      <PillBadge>Enterprise Grade Security</PillBadge>
      <SectionHeading highlight="Security" sub="Your smart contracts are protected by multi-layer audits, formal verification, and real-time monitoring." />
    </Reveal>
    <Reveal delay={0.2}>
      <div style={{ position: 'relative', display: 'inline-block', marginTop: '60px' }}>
        {/* Static rings — no animation */}
        {[200, 280, 360].map((size, i) => (
          <div key={i}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: `${size}px`, height: `${size}px`, borderRadius: '50%',
              border: '1px solid var(--outline-subtle)', pointerEvents: 'none',
              opacity: 0.3 - i * 0.05,
            }}
          />
        ))}
        <div
          style={{
            width: '120px', height: '120px', borderRadius: '50%', position: 'relative', zIndex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--primary-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Shield size={52} style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    </Reveal>
    <Reveal delay={0.3}>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '60px', maxWidth: '900px', margin: '60px auto 0' }}>
        {[
          { title: 'Reentrancy Protection', desc: 'Guards against recursive call exploits.' },
          { title: 'Overflow Checks', desc: 'Safe math operations on all arithmetic.' },
          { title: 'Access Control', desc: 'Owner-only function enforcement.' },
          { title: 'Gas Limit Safety', desc: 'Prevents out-of-gas transaction failures.' },
        ].map(p => (
          <div key={p.title} style={{
            padding: '22px 28px', borderRadius: '14px', flex: '1 1 200px', maxWidth: '240px',
            background: 'var(--surface)', border: '1px solid var(--outline-subtle)', textAlign: 'left',
            transition: 'transform 0.3s ease, border-color 0.3s ease',
          }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary-muted)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--outline-subtle)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>{p.title}</h4>
            </div>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.82rem', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </Reveal>
  </section>
);

export default SecuritySection;

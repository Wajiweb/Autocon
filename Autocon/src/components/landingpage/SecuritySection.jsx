import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';
import { Reveal, PillBadge, SectionHeading } from './Shared';

/* ══════════════════════════════════════════════════════
   SECURITY SECTION
══════════════════════════════════════════════════════ */
const SecuritySection = () => (
  <section id="security" style={{ background: 'var(--bg)', padding: '80px 48px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `radial-gradient(circle at 50% 50%, var(--accent-glow) 0%, transparent 60%), linear-gradient(rgba(198,241,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,0,0.03) 1px, transparent 1px)`,
      backgroundSize: '100% 100%, 60px 60px, 60px 60px',
    }} />
    <Reveal>
      <PillBadge>Enterprise Grade Security</PillBadge>
      <SectionHeading highlight="Security" sub="Your smart contracts are protected by multi-layer audits, formal verification, and real-time monitoring." />
    </Reveal>
    <Reveal delay={0.2}>
      <div style={{ position: 'relative', display: 'inline-block', marginTop: '60px' }}>
        {[200, 280, 360].map((size, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.04, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: `${size}px`, height: `${size}px`, borderRadius: '50%',
              border: '1px solid var(--border-color)', pointerEvents: 'none',
            }}
          />
        ))}
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '120px', height: '120px', borderRadius: '50%', position: 'relative', zIndex: 1,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--primary-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)',
          }}>
          <Shield size={52} style={{ color: 'var(--primary)' }} />
        </motion.div>
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
            background: 'var(--surface-low)', border: '1px solid var(--border-color)', textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{p.title}</h4>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </Reveal>
  </section>
);

export default SecuritySection;

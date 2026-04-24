import React from 'react';
import { Reveal } from './Shared';

/* ══════════════════════════════════════════════════════
   STATS BAR — Clean, no gradient backgrounds
══════════════════════════════════════════════════════ */
const StatsSection = () => {
  const stats = [
    { label: 'Contracts Deployed', value: '+100', sub: 'Smart contracts live on-chain' },
    { label: 'Gas Cost Reduction', value: '+40%', sub: 'Compared to manual deployment' },
    { label: 'Deploy Success Rate', value: '99%',  sub: 'Successful transaction rate'   },
  ];
  return (
    <section style={{ background: 'var(--bg)', padding: '60px 48px 40px' }}>
      <Reveal>
        <div style={{
          maxWidth: '1160px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'
        }} className="stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} style={{
              padding: '28px 20px', textAlign: 'center',
              border: '1px solid var(--outline-subtle)',
              borderRadius: '16px', position: 'relative',
              background: 'var(--surface)',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary-muted)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--outline-subtle)'; }}
            >
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</p>
              <div style={{
                fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1, marginBottom: '8px',
                color: 'var(--on-surface)'
              }}>{s.value}</div>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
};

export default StatsSection;

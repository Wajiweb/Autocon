import React from 'react';
import { Reveal, SectionHeading } from './Shared';

/* ══════════════════════════════════════════════════════
   SUB-HEADING BRIDGE
══════════════════════════════════════════════════════ */
const SimplifyingSection = () => (
  <section style={{ background: 'var(--bg)', padding: '80px 48px 40px', textAlign: 'center' }}>
    <Reveal y={30}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <SectionHeading
          pre="Simplifying Blockchain"
          highlight="Development."
        />
      </div>
    </Reveal>
  </section>
);

export default SimplifyingSection;

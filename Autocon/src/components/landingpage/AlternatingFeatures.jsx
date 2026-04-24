import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileCode2, ShieldAlert, Cpu } from 'lucide-react';
import { Reveal } from './Shared';

/* ══════════════════════════════════════════════════════
   ALTERNATING FEATURES — Cleaned up mockups
══════════════════════════════════════════════════════ */

const CryptoMockupOne = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--surface)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'relative', background: 'var(--surface-low)', border: '1px solid var(--outline-subtle)', padding: '24px', borderRadius: '16px', width: '70%' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
      </div>
      <div style={{ color: 'var(--on-surface-variant)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--primary)' }}></span> npm run deploy<br />
        <span style={{ color: 'var(--on-surface)' }}>Compiling smart contracts...</span><br />
        <span style={{ color: 'var(--primary)' }}>Target:</span> Ethereum Mainnet<br />
        <span style={{ color: 'var(--primary)' }}>Status:</span> Deployed Successfully!
      </div>
    </div>
  </div>
);

const CryptoMockupTwo = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--surface)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', width: '70%' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-low)', border: '1px solid var(--outline-subtle)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: i === 1 ? 'var(--primary)' : 'var(--surface-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={16} color={i === 1 ? '#fff' : 'var(--on-surface-variant)'} />
            </div>
            <div>
              <div style={{ color: 'var(--on-surface)', fontSize: '0.9rem', fontWeight: 600 }}>{i === 1 ? 'Reentrancy Check' : i === 2 ? 'Overflow Alert' : 'Access Control'}</div>
              <div style={{ color: i === 1 ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: '0.75rem' }}>{i === 1 ? 'Passed' : 'Checking...'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CryptoMockupThree = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--surface)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <div style={{ position: 'relative', width: '60%', height: '60%', border: '2px dashed var(--outline)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Cpu size={40} color="#fff" />
        </div>
     </div>
  </div>
);

const features = [
  {
    icon: <FileCode2 size={24} color="#fff" />, title: 'Future-Forward Contract Generation',
    desc: 'Our no-code platform simplifies complex smart contract creation for everyone. With AI-powered templates and one-click deployment, we make the blockchain future accessible — no Solidity expertise required.',
    illustration: <CryptoMockupOne />,
  },
  {
    icon: <ShieldAlert size={24} color="#fff" />, title: 'Efficient Smart Contract Security',
    desc: 'Our platform ensures your smart contracts are audited before deployment, automatically detecting reentrancy attacks, integer overflows, and access control vulnerabilities before they reach mainnet.',
    illustration: <CryptoMockupTwo />,
  },
  {
    icon: <Cpu size={24} color="#fff" />, title: 'Intelligent Web3 Assistance',
    desc: 'Chat with an AI trained on Solidity and Ethereum architecture. Get real-time guidance on contract configurations, gas optimization strategies, and deployment best practices.',
    illustration: <CryptoMockupThree />,
  },
];

const AlternatingFeatures = ({ onLearnMore }) => (
  <section id="features" style={{ background: 'var(--bg)', padding: '0 48px 32px' }}>
    {features.map((f, i) => (
      <Reveal key={f.title} delay={0.1}>
        <div style={{
          maxWidth: '1160px', margin: '0 auto 40px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '40px', alignItems: 'center',
        }} className="feature-row">
          <div style={{ order: i % 2 !== 0 ? 2 : 1 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>{f.icon}</div>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)', fontWeight: 700, color: 'var(--on-surface)',
              lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '12px',
            }}>{f.title}</h2>
            <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, fontSize: '0.875rem', marginBottom: '20px' }}>
              {f.desc}
            </p>
            <button
              onClick={onLearnMore}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 22px', borderRadius: '8px', border: 'none',
                background: 'var(--primary)', color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = ''; }}
            >Learn More <ChevronRight size={14} /></button>
          </div>
          <div style={{
            order: i % 2 !== 0 ? 1 : 2,
            borderRadius: '16px', overflow: 'hidden',
            border: '1px solid var(--outline-subtle)', aspectRatio: '4 / 3',
          }}>
            {f.illustration}
          </div>
        </div>
      </Reveal>
    ))}
  </section>
);

export default AlternatingFeatures;

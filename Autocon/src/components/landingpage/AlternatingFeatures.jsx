import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileCode2, ShieldAlert, Cpu } from 'lucide-react';
import { Reveal } from './Shared';

/* ══════════════════════════════════════════════════════
   ALTERNATING FEATURES 
══════════════════════════════════════════════════════ */

const CryptoMockupOne = () => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface-low) 0%, var(--bg) 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Grid Background */}
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--accent-glow) 1px, transparent 1px), linear-gradient(90deg, var(--accent-glow) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
    
    <div style={{ position: 'relative', background: 'var(--surface-low)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', width: '70%', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
      </div>
      <div style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--primary)' }}></span> npm run deploy<br />
        <span style={{ color: 'var(--text-primary)' }}>Compiling smart contracts...</span><br />
        <span style={{ color: 'var(--primary)' }}>Target:</span> Ethereum Mainnet<br />
        <span style={{ color: 'var(--primary)' }}>Status:</span> Deployed Successfully!
      </div>
    </div>
  </div>
);

const CryptoMockupTwo = () => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface-low) 0%, var(--bg) 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Radial Glow */}
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: 'var(--bg-gradient-glow)', opacity: 0.3, filter: 'blur(30px)' }} />
    
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', width: '70%' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: i === 1 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={16} color={i === 1 ? 'var(--bg)' : 'var(--text-secondary)'} />
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{i === 1 ? 'Reentrancy Check' : i === 2 ? 'Overflow Alert' : 'Access Control'}</div>
              <div style={{ color: i === 1 ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.75rem' }}>{i === 1 ? 'Passed' : 'Checking...'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CryptoMockupThree = () => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface-low) 0%, var(--bg) 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', border: '40px solid var(--accent-glow)', opacity: 0.5 }} />
     <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', borderRadius: '50%', border: '40px solid var(--accent-glow)', opacity: 0.5 }} />
     
     <div style={{ position: 'relative', width: '60%', height: '60%', border: '2px dashed var(--primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)' }}>
           <Cpu size={40} color="var(--bg)" />
        </div>
     </div>
  </div>
);

const features = [
  {
    icon: <FileCode2 size={24} color="#000" />, title: 'Future-Forward Contract Generation',
    desc: 'Our no-code platform simplifies complex smart contract creation for everyone. With AI-powered templates and one-click deployment, we make the blockchain future accessible — no Solidity expertise required.',
    illustration: <CryptoMockupOne />,
  },
  {
    icon: <ShieldAlert size={24} color="#000" />, title: 'Efficient Smart Contract Security',
    desc: 'Our platform ensures your smart contracts are audited before deployment, automatically detecting reentrancy attacks, integer overflows, and access control vulnerabilities before they reach mainnet.',
    illustration: <CryptoMockupTwo />,
  },
  {
    icon: <Cpu size={24} color="#000" />, title: 'Intelligent Web3 Assistance',
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
              marginBottom: '16px', boxShadow: '0 4px 16px var(--primary-glow)'
            }}>{f.icon}</div>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)', fontWeight: 700, color: 'var(--text-primary)',
              lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '12px',
            }}>{f.title}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.875rem', marginBottom: '20px' }}>
              {f.desc}
            </p>
            <motion.button
              onClick={onLearnMore} whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 22px', borderRadius: '8px', border: 'none',
                background: 'var(--primary)', color: 'var(--bg)', fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', boxShadow: 'var(--shadow-primary)',
              }}
            >Learn More <ChevronRight size={14} /></motion.button>
          </div>
          <div style={{
            order: i % 2 !== 0 ? 1 : 2,
            borderRadius: '16px', overflow: 'hidden',
            border: '1px solid var(--border-color)', aspectRatio: '4 / 3',
            boxShadow: 'var(--shadow-md)'
          }}>
            {f.illustration}
          </div>
        </div>
      </Reveal>
    ))}
  </section>
);

export default AlternatingFeatures;

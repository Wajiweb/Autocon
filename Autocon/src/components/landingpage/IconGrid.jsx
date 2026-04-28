import React from 'react';
import { Wallet, Code2, BarChart3, Shield, Cpu, Globe } from 'lucide-react';
import { Reveal, PillBadge, SectionHeading } from './Shared';

/* ══════════════════════════════════════════════════════
   ICON GRID — Clean, no hover glow
══════════════════════════════════════════════════════ */
const iconFeatures = [
  { icon: <Wallet size={22} />,    title: 'MetaMask Native',     desc: 'Connect wallets instantly with MetaMask integration.' },
  { icon: <Code2 size={22} />,     title: 'ABI & Source Export', desc: 'Download verified ABI, bytecode, and source for any contract.' },
  { icon: <BarChart3 size={22} />, title: 'Real-Time Analytics', desc: 'Track deployments, gas costs, and contract events.' },
  { icon: <Shield size={22} />,    title: 'Vulnerability Scanner', desc: 'AI-powered Solidity security audits before deployment.' },
  { icon: <Cpu size={22} />,       title: 'Gas Optimizer',       desc: 'Automatically minimize gas usage on every generated contract.' },
  { icon: <Globe size={22} />,     title: 'Multi-Chain Ready',   desc: 'Deploy on Ethereum, Polygon, BSC, and any EVM chain.' },
];

const IconGrid = () => (
  <section style={{ background: 'var(--surface)', padding: '0 48px 100px' }}>
    <Reveal>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}><PillBadge>Unlock the Potential of Web3 Finance</PillBadge></div>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <SectionHeading pre="Everything You Need to" highlight="Deploy" after="On-Chain" />
      </div>
    </Reveal>
    <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1px', background: 'var(--border-dark)',
        border: '1px solid #ddd', borderRadius: '18px', overflow: 'hidden',
      }} className="icon-grid">
        {iconFeatures.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.07}>
            <div
              style={{ padding: '40px 36px', background: 'var(--surface)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--surface)'; }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px', marginBottom: '18px',
                background: 'var(--primary-subtle)', border: '1px solid #ddd',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '0.97rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ color: '#666', fontSize: '0.855rem', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default IconGrid;

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Code2, BarChart3, Shield, Cpu, Globe } from 'lucide-react';
import { Reveal, PillBadge, SectionHeading } from './Shared';

/* ══════════════════════════════════════════════════════
   ICON GRID
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
  <section style={{ background: 'var(--bg)', padding: '0 48px 100px' }}>
    <Reveal>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}><PillBadge>Unlock the Potential of Web3 Finance</PillBadge></div>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <SectionHeading pre="Everything You Need to" highlight="Deploy" after="On-Chain" />
      </div>
    </Reveal>
    <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1px', background: 'var(--border-color)',
        border: '1px solid var(--border-color)', borderRadius: '18px', overflow: 'hidden',
      }} className="icon-grid">
        {iconFeatures.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.07}>
            <motion.div whileHover={{ background: 'var(--accent-glow)' }}
              style={{ padding: '40px 36px', background: 'var(--bg)', cursor: 'default', transition: 'background 0.25s ease' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px', marginBottom: '18px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '0.97rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.855rem', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default IconGrid;

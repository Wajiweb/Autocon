/**
 * Logos.jsx — Infinite horizontal partner/chain logo marquee
 * Duplicated list for seamless loop. aria-hidden on decorative content.
 */
import React from 'react';
import SectionGlow from '../landingpage/SectionGlow';

const LOGOS = [
  { name: 'Ethereum',      emoji: '⟠' },
  { name: 'Polygon',       emoji: '⬡' },
  { name: 'BNB Chain',     emoji: '◆' },
  { name: 'Avalanche',     emoji: '▲' },
  { name: 'Chainlink',     emoji: '⬡' },
  { name: 'OpenZeppelin',  emoji: '🛡' },
  { name: 'MetaMask',      emoji: '🦊' },
  { name: 'Solidity',      emoji: '◎' },
];

const marqueeStyle = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    animation: scroll 25s linear infinite;
    display: flex;
    width: max-content;
  }
  .marquee-track:hover {
    animation-play-state: paused;
  }
`;

function LogoItem({ name, emoji }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '12px 28px',
        borderRadius: '12px',
        border:       '1px solid var(--lp-border-subtle)',
        background:   'rgba(0, 0, 0, 0.6)',
        whiteSpace:   'nowrap',
        flexShrink:   0,
        marginRight:  '14px',
        userSelect:   'none',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(14 100% 50%)', letterSpacing: '-0.01em' }}>
        {name}
      </span>
    </div>
  );
}

export default function Logos() {
  return (
    <section
      aria-label="Partner and technology logos"
      style={{
        paddingTop:    'clamp(16px, 3vw, 32px)',
        paddingBottom: 'clamp(16px, 3vw, 32px)',
        overflow:      'hidden',
        position:      'relative',
        background:    'linear-gradient(135deg, var(--lp-surface) 0%, hsla(14, 100%, 50%, 0.05) 100%)',
        transform:     'rotate(-1.75deg)',
      }}
    >
      <style>{marqueeStyle}</style>
      <SectionGlow position="both" intensity="low" size="sm" variations={{ leftTop: '30%', rightTop: '40%' }} />

      <p className="sr-only">
        Supported technologies and partners: {LOGOS.map(l => l.name).join(', ')}
      </p>

      {/* Fade edges */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', zIndex: 1,
        background: 'linear-gradient(to right, var(--lp-bg), transparent)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', zIndex: 1,
        background: 'linear-gradient(to left, var(--lp-bg), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Marquee wrapper */}
      <div style={{ 
        display: 'flex',
        width: '100%',
        overflow: 'hidden',
      }}>
        {/* Marquee track with duplicated content */}
        <div className="marquee-track">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <LogoItem key={`${logo.name}-${i}`} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}

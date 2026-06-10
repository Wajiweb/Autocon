/**
 * Logos.jsx — Infinite horizontal partner/chain logo marquee
 * Uses real CDN-hosted brand logos with emoji fallback on error.
 * Duplicated list for seamless loop. aria-hidden on decorative content.
 */
import React from 'react';
import { 
  Globe, 
  Hammer, 
  Layers, 
  Mountain, 
  Link as LinkIcon, 
  Shield, 
  Wallet, 
  Code 
} from 'lucide-react';

const LOGOS = [
  {
    name: 'Ethereum',
    img: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',
    fallback: Globe,
  },
  {
    name: 'Hardhat',
    img: 'https://hardhat.org/favicon.ico',
    fallback: Hammer,
  },
  {
    name: 'BNB Chain',
    img: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040',
    fallback: Layers,
  },
  {
    name: 'Avalanche',
    img: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=040',
    fallback: Mountain,
  },
  {
    name: 'Chainlink',
    img: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=040',
    fallback: LinkIcon,
  },
  {
    name: 'OpenZeppelin',
    img: 'https://avatars.githubusercontent.com/u/20820676?s=200&v=4',
    fallback: Shield,
  },
  {
    name: 'MetaMask',
    img: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    fallback: Wallet,
  },
  {
    name: 'Solidity',
    img: 'https://docs.soliditylang.org/en/latest/_static/logo.svg',
    fallback: Code,
  },
];

const marqueeStyle = `
  @keyframes scroll {
    0%   { transform: translateX(0); }
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

function LogoItem({ name, img, fallback }) {
  const [imgFailed, setImgFailed] = React.useState(false);

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
      {!imgFailed ? (
        <img
          src={img}
          alt=""
          loading="lazy"
          width="24"
          height="24"
          onError={() => setImgFailed(true)}
          style={{
            display: 'block',
            width: '24px',
            height: '24px',
            objectFit: 'contain',
            filter: 'brightness(1.1)',
          }}
        />
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(14 100% 50%)' }}>
          {React.createElement(fallback, { size: 20 })}
        </span>
      )}
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
      <div style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
        {/* Marquee track — duplicated for seamless loop */}
        <div className="marquee-track">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <LogoItem key={`${logo.name}-${i}`} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LayoutGrid, Coins, Image, CheckCircle2 } from 'lucide-react';

const BTCSVG = () => (<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M22.56 14.17c.3-2.02-1.23-3.1-3.33-3.83l.68-2.73-1.66-.41-.66 2.66c-.44-.11-.89-.21-1.33-.31l.67-2.68-1.66-.41-.68 2.73c-.36-.08-.72-.17-1.07-.26l-2.29-.57-.44 1.77s1.23.28 1.2.3c.67.17.79.6.77.95l-.77 3.1c.05.01.11.03.17.06l-.17-.04-1.09 4.36c-.08.2-.29.5-.75.39.02.02-1.2-.3-1.2-.3l-.82 1.9 2.16.54c.4.1.8.21 1.19.31l-.69 2.76 1.66.41.68-2.73c.46.12.9.24 1.34.34l-.68 2.72 1.66.41.69-2.76c2.83.54 4.96.32 5.86-2.24.72-2.06-.04-3.25-1.53-4.02 1.09-.25 1.91-1 2.13-2.52zm-3.81 5.35c-.51 2.06-3.98.95-5.1.67l.91-3.65c1.12.28 4.72.83 4.19 2.98zm.52-5.38c-.47 1.88-3.36.93-4.3.69l.83-3.31c.94.23 3.98.67 3.47 2.62z" fill="#fff"/></svg>);
const ETHSVG = () => (<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16.498 4v8.87l7.497 3.35z" fill="#fff" opacity=".6"/><path d="M16.498 4L9 16.22l7.498-3.35z" fill="#fff"/><path d="M16.498 21.968v6.027L24 17.616z" fill="#fff" opacity=".6"/><path d="M16.498 27.995v-6.028L9 17.616z" fill="#fff"/><path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="#fff" opacity=".2"/><path d="M9 16.22l7.498 4.353v-7.701z" fill="#fff" opacity=".6"/></svg>);
const USDTSVG = () => (<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#26A17B"/><path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.663 0-.816 2.902-1.49 6.79-1.666v2.655c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.654c3.88.175 6.775.85 6.775 1.664 0 .816-2.895 1.49-6.775 1.662m0-3.59v-2.366h5.414V8.558H8.595v2.869h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.126 0 1.052 3.309 1.923 7.709 2.125v7.588h3.913v-7.588c4.393-.202 7.694-1.073 7.694-2.125 0-1.052-3.3-1.924-7.694-2.126" fill="#fff"/></svg>);
const BNBSVG = () => (<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26 2.26 2.26-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.276-.002h.002V16L16 18.206l-2.204-2.204-.003-.002v-.003L16 13.794l2.204 2.204z" fill="#fff"/></svg>);
const SOLSVG = () => (<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#9945FF"/><path d="M10.02 20.28a.57.57 0 0 1 .4-.16h13.4a.28.28 0 0 1 .2.48l-2.36 2.36a.57.57 0 0 1-.4.16H7.86a.28.28 0 0 1-.2-.48zm0-11.24A.57.57 0 0 1 10.42 9h13.4a.28.28 0 0 1 .2.48l-2.36 2.36a.57.57 0 0 1-.4.16H7.86a.28.28 0 0 1-.2-.48zm13.96 5.56a.57.57 0 0 1-.4.16H10.18a.28.28 0 0 1-.2-.48l2.36-2.36a.57.57 0 0 1 .4-.16h13.4a.28.28 0 0 1 .2.48z" fill="#fff"/></svg>);
const DOTSVG = () => (<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#E6007A"/><ellipse cx="16" cy="8.5" rx="4.5" ry="2.5" fill="#fff"/><ellipse cx="16" cy="23.5" rx="4.5" ry="2.5" fill="#fff"/><ellipse cx="9" cy="12.5" rx="2.5" ry="4.5" transform="rotate(-30 9 12.5)" fill="#fff"/><ellipse cx="23" cy="19.5" rx="2.5" ry="4.5" transform="rotate(-30 23 19.5)" fill="#fff"/><ellipse cx="9" cy="19.5" rx="2.5" ry="4.5" transform="rotate(30 9 19.5)" fill="#fff"/><ellipse cx="23" cy="12.5" rx="2.5" ry="4.5" transform="rotate(30 23 12.5)" fill="#fff"/></svg>);

const cryptoIcons = [
  { name: 'BTC', color: '#F7931A', svg: <BTCSVG /> },
  { name: 'ETH', color: '#627EEA', svg: <ETHSVG /> },
  { name: 'USDT', color: '#26A17B', svg: <USDTSVG /> },
  { name: 'BNB', color: '#F3BA2F', svg: <BNBSVG /> },
  { name: 'SOL', color: '#9945FF', svg: <SOLSVG /> },
  { name: 'DOT', color: '#E6007A', svg: <DOTSVG /> },
];

const OrbitalRing = ({ size, duration, reverse = false, children }) => (
  <motion.div
    initial={{ x: '-50%', y: '-50%', rotate: 0 }}
    animate={{ x: '-50%', y: '-50%', rotate: reverse ? -360 : 360 }}
    transition={{ repeat: Infinity, ease: 'linear', duration }}
    className="absolute rounded-full will-change-transform"
    style={{ width: size, height: size, left: '50%', top: '50%', border: '1px solid rgba(93,169,233,0.10)' }}
  >{children}</motion.div>
);

const OrbitingCoin = ({ coin, angle, duration, reverse = false }) => (
  <div className="absolute inset-0 will-change-transform" style={{ transform: `rotate(${angle}deg)` }}>
    <motion.div
      initial={{ x: '-50%', y: '-50%', rotate: 0 }}
      animate={{ x: '-50%', y: '-50%', rotate: reverse ? 360 : -360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration }}
      className="absolute flex items-center justify-center rounded-full will-change-transform"
      style={{ width: 44, height: 44, left: '50%', top: 0, border: `1.5px solid ${coin.color}40`, background: 'var(--surface)', overflow: 'hidden' }}
    ><div style={{ width: 36, height: 36 }}>{coin.svg}</div></motion.div>
  </div>
);

const OrbitalBackground = () => (
  <div className="absolute inset-0 overflow-hidden z-0 flex items-center justify-center pointer-events-none" role="img" aria-label="Animated orbital rings with cryptocurrency logos">
    <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, var(--bg))' }} />
    {/* Passive glow — 60s drift, barely perceptible */}
    <div className="hero-glow" aria-hidden="true" />
    <OrbitalRing size={400} duration={60} reverse>
      <OrbitingCoin coin={cryptoIcons[0]} angle={0}   duration={60} reverse />
      <OrbitingCoin coin={cryptoIcons[1]} angle={180} duration={60} reverse />
    </OrbitalRing>
    <OrbitalRing size={700} duration={90}>
      <OrbitingCoin coin={cryptoIcons[2]} angle={90}  duration={90} />
      <OrbitingCoin coin={cryptoIcons[3]} angle={270} duration={90} />
    </OrbitalRing>
    <OrbitalRing size={1000} duration={120} reverse>
      <OrbitingCoin coin={cryptoIcons[4]} angle={45}  duration={120} reverse />
      <OrbitingCoin coin={cryptoIcons[5]} angle={225} duration={120} reverse />
    </OrbitalRing>
    {[400, 700, 1000, 1300].map((s, i) => (
      <motion.div key={s}
        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 200 + i * 50 }}
        className="absolute rounded-full will-change-transform"
        style={{ width: s, height: s, border: `1px solid rgba(93,169,233,${0.07 - i * 0.012})`, borderStyle: i % 2 === 1 ? 'dashed' : 'solid' }}
        aria-hidden="true" />
    ))}
    <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, ease: 'easeInOut', duration: 8 }}
      className="absolute top-[18%] left-[12%] w-14 h-14 rounded-full will-change-transform"
      style={{ background: 'var(--surface)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-hidden="true">
      <div style={{ width: 36, height: 36 }}><BTCSVG /></div>
    </motion.div>
    <motion.div animate={{ y: [0, -20, 0], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, ease: 'easeInOut', duration: 10, delay: 0.5 }}
      className="absolute top-[28%] right-[15%] w-16 h-16 rounded-full will-change-transform"
      style={{ background: 'var(--surface)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-hidden="true">
      <div style={{ width: 40, height: 40 }}><ETHSVG /></div>
    </motion.div>
    <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, ease: 'easeInOut', duration: 9, delay: 1.5 }}
      className="absolute top-[50%] right-[8%] will-change-transform"
      style={{ display: 'flex', gap: 8 }} aria-hidden="true">
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', border: '1px solid rgba(93,169,233,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28 }}><SOLSVG /></div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid rgba(182,181,216,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24 }}><BNBSVG /></div>
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════
   PARTNER LOGOS — kept, simplified presentation
══════════════════════════════════════════════════════ */
const partnerNames = ['Ethereum', 'Polygon', 'Binance', 'OpenZeppelin', 'Chainlink', 'MetaMask'];

const PartnerBanner = () => (
  <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ zIndex: 20 }}>
    <span className="sr-only">Our trusted partners include: {partnerNames.join(', ')}</span>
    <div
      className="w-full h-[72px] md:h-[88px] flex items-center border-t"
      style={{
        background: 'var(--surface-low)',
        borderColor: 'var(--outline-subtle)',
      }}
    >
      <div className="flex items-center justify-around w-full px-8 md:px-16 gap-6 md:gap-12">
        {partnerNames.map((name, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm md:text-base font-bold tracking-tight"
            style={{ color: 'var(--on-surface-muted)' }}
          >
            {name}
          </motion.span>
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   DASHBOARD MOCKUP — colors aligned to design system
══════════════════════════════════════════════════════ */
const DashboardMockup = () => {
  const mockDeployments = [
    { _id: '1', name: 'MyToken', symbol: 'MTK', _type: 'ERC-20', contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f6', network: 'Sepolia', createdAt: new Date() },
    { _id: '2', name: 'ArtCollection', _type: 'ERC-721', contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', network: 'Sepolia', createdAt: new Date() },
    { _id: '3', name: 'BidAuction', _type: 'Auction', contractAddress: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', network: 'Sepolia', createdAt: new Date() },
  ];
  const mockStats = [
    { label: 'Total Assets',    value: '3',      subtext: 'All contract types' },
    { label: 'ERC-20 Tokens',   value: '1',      subtext: 'Fungible tokens deployed' },
    { label: 'NFT Collections', value: '1',      subtext: 'ERC-721 collections' },
    { label: 'Status',          value: 'Online', subtext: 'All services operational', isStatus: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="w-full max-w-[950px] mx-auto mt-8 relative z-10 pointer-events-auto cursor-default"
    >
      <div className="w-full rounded-[20px] border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--outline-subtle)', boxShadow: 'var(--shadow-lg)' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--outline-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99,
              background: 'var(--primary-subtle)', border: '1px solid var(--primary-muted)',
              fontSize: '0.66rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              Live Dashboard
            </div>
            <h2 style={{ color: 'var(--on-surface)', fontSize: '1.1rem', fontWeight: 800 }}>Executive <span style={{ color: 'var(--primary)' }}>Overview</span></h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['📊', 'CSV'], ['📄', 'PDF']].map(([icon, label]) => (
              <div key={label} style={{ padding: '6px 14px', borderRadius: 9, border: '1px solid var(--outline-subtle)',
                background: 'var(--surface-low)', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                {icon} <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, padding: '18px 24px' }}>
          {mockStats.map((s, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 14,
              background: 'var(--surface-low)', border: '1px solid var(--outline-subtle)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
              </div>
              {s.isStatus
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{s.value}</p>
                  </div>
                : <p style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--on-surface)', lineHeight: 1 }}>{s.value}</p>
              }
              <p style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>{s.subtext}</p>
            </div>
          ))}
        </div>

        {/* Deployment table */}
        <div style={{ borderTop: '1px solid var(--outline-subtle)' }}>
          <div style={{ padding: '13px 24px', borderBottom: '1px solid var(--outline-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)' }}>Deployment Registry</h3>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary-muted)', fontFamily: 'monospace' }}>0x7a2…f3e1</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--outline-subtle)' }}>
                {['Asset', 'Type', 'Contract', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 20px', fontSize: '0.58rem', fontWeight: 700, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockDeployments.map((item, i) => {
                const t = item._type === 'Auction'
                  ? { bg: 'rgba(245,158,11,.06)', br: 'rgba(245,158,11,.15)', c: 'var(--warning)', label: 'Auction' }
                  : item._type === 'ERC-721'
                    ? { bg: 'rgba(167,139,250,.06)', br: 'rgba(167,139,250,.15)', c: '#a78bfa', label: 'ERC-721' }
                    : { bg: 'var(--primary-subtle)', br: 'var(--primary-muted)', c: 'var(--primary)', label: 'ERC-20' };
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--outline-subtle)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 33, height: 33, borderRadius: 9, background: t.bg, border: `1px solid ${t.br}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 800, color: t.c }}>
                          {(item.symbol || item.name || '').substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.78rem' }}>{item.name}</p>
                          <p style={{ fontSize: '0.58rem', color: 'var(--on-surface-variant)' }}>{item.network}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: '0.58rem', fontWeight: 700, background: t.bg, color: t.c, border: `1px solid ${t.br}` }}>{t.label}</span>
                    </td>
                    <td style={{ padding: '12px 20px', fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>
                      {item.contractAddress.slice(0, 10)}…{item.contractAddress.slice(-4)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.62rem', padding: '5px 10px', borderRadius: 7, background: 'var(--surface-low)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-subtle)', cursor: 'pointer' }}>📋</span>
                        <span style={{ fontSize: '0.62rem', padding: '5px 10px', borderRadius: 7, background: 'var(--surface-low)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-subtle)', cursor: 'pointer' }}>↗</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   HERO SECTION — Clean, professional
══════════════════════════════════════════════════════ */
export default function HeroSection({ onGetStarted }) {
  return (
    <section id="home" className="relative w-full min-h-screen flex flex-col items-center pt-28 pb-32 md:pb-40 overflow-hidden font-inter"
      style={{ background: 'var(--bg)' }}>

      <OrbitalBackground />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6 text-center flex flex-col items-center">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] md:text-sm font-semibold tracking-wide"
            style={{ border: '1px solid var(--outline)', background: 'var(--surface)', color: 'var(--on-surface-variant)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
            No-Code Smart Contract Platform on Web3
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-[clamp(2.5rem,6vw,4.8rem)] font-black leading-[1.1] tracking-tight mb-6 max-w-[900px]"
          style={{ color: 'var(--on-surface)' }}>
          Deploy Smart Contracts{' '}
          <br className="hidden sm:block" />
          <span style={{ color: 'var(--primary)' }}>Without Writing Code</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-sm md:text-[1.1rem] max-w-[620px] mb-10 leading-relaxed font-medium"
          style={{ color: 'var(--on-surface-variant)' }}>
          Generate, audit, and deploy ERC-20 tokens, NFT collections, and auctions on Sepolia in minutes — powered by AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex flex-row gap-4 justify-center items-center">
          <button onClick={onGetStarted}
            className="group flex items-center justify-between gap-3 px-5 py-3 md:px-7 md:py-3.5 rounded-[14px] font-bold text-sm md:text-base transition-all hover:-translate-y-1 active:scale-[0.98]"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            <span>Get Started</span>
            <div className="rounded-full p-1 group-hover:translate-x-1 transition-transform"
              style={{ background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
              <ChevronRight size={16} strokeWidth={3} />
            </div>
          </button>

          <a href="#features"
            className="group flex items-center justify-between gap-3 border px-5 py-3 md:px-7 md:py-3.5 rounded-[14px] font-bold text-sm md:text-base transition-all hover:-translate-y-1 active:scale-[0.98]"
            style={{ borderColor: 'var(--outline)', color: 'var(--on-surface)', background: 'transparent' }}>
            <span>Explore</span>
            <div className="rounded-full p-1 group-hover:translate-x-1 transition-transform"
              style={{ background: 'var(--surface)', color: 'var(--on-surface-variant)' }}>
              <ChevronRight size={16} strokeWidth={3} />
            </div>
          </a>
        </motion.div>

    {/* DashboardMockup — float-card: single floating element, 7s loop */}
        <div className="mt-20 float-card">
          <DashboardMockup />
        </div>
      </div>

      {/* Partner Banner */}
      <PartnerBanner />
    </section>
  );
}

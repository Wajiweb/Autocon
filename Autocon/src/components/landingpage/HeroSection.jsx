import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LayoutGrid, Coins, Image, FileSpreadsheet, FileText, CheckCircle2, Sparkles } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   REAL CRYPTO LOGOS — official brand SVGs
══════════════════════════════════════════════════════ */
const BTCSVG = () => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M22.56 14.17c.3-2.02-1.23-3.1-3.33-3.83l.68-2.73-1.66-.41-.66 2.66c-.44-.11-.89-.21-1.33-.31l.67-2.68-1.66-.41-.68 2.73c-.36-.08-.72-.17-1.07-.26l-2.29-.57-.44 1.77s1.23.28 1.2.3c.67.17.79.6.77.95l-.77 3.1c.05.01.11.03.17.06l-.17-.04-1.09 4.36c-.08.2-.29.5-.75.39.02.02-1.2-.3-1.2-.3l-.82 1.9 2.16.54c.4.1.8.21 1.19.31l-.69 2.76 1.66.41.68-2.73c.46.12.9.24 1.34.34l-.68 2.72 1.66.41.69-2.76c2.83.54 4.96.32 5.86-2.24.72-2.06-.04-3.25-1.53-4.02 1.09-.25 1.91-1 2.13-2.52zm-3.81 5.35c-.51 2.06-3.98.95-5.1.67l.91-3.65c1.12.28 4.72.83 4.19 2.98zm.52-5.38c-.47 1.88-3.36.93-4.3.69l.83-3.31c.94.23 3.98.67 3.47 2.62z" fill="#fff"/>
  </svg>
);
const ETHSVG = () => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16.498 4v8.87l7.497 3.35z" fill="#fff" opacity=".6"/>
    <path d="M16.498 4L9 16.22l7.498-3.35z" fill="#fff"/>
    <path d="M16.498 21.968v6.027L24 17.616z" fill="#fff" opacity=".6"/>
    <path d="M16.498 27.995v-6.028L9 17.616z" fill="#fff"/>
    <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="#fff" opacity=".2"/>
    <path d="M9 16.22l7.498 4.353v-7.701z" fill="#fff" opacity=".6"/>
  </svg>
);
const USDTSVG = () => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.663 0-.816 2.902-1.49 6.79-1.666v2.655c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.654c3.88.175 6.775.85 6.775 1.664 0 .816-2.895 1.49-6.775 1.662m0-3.59v-2.366h5.414V8.558H8.595v2.869h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.126 0 1.052 3.309 1.923 7.709 2.125v7.588h3.913v-7.588c4.393-.202 7.694-1.073 7.694-2.125 0-1.052-3.3-1.924-7.694-2.126" fill="#fff"/>
  </svg>
);
const BNBSVG = () => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
    <path d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26 2.26 2.26-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.276-.002h.002V16L16 18.206l-2.204-2.204-.003-.002v-.003L16 13.794l2.204 2.204z" fill="#fff"/>
  </svg>
);
const SOLSVG = () => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#9945FF"/>
    <path d="M10.02 20.28a.57.57 0 0 1 .4-.16h13.4a.28.28 0 0 1 .2.48l-2.36 2.36a.57.57 0 0 1-.4.16H7.86a.28.28 0 0 1-.2-.48zm0-11.24A.57.57 0 0 1 10.42 9h13.4a.28.28 0 0 1 .2.48l-2.36 2.36a.57.57 0 0 1-.4.16H7.86a.28.28 0 0 1-.2-.48zm13.96 5.56a.57.57 0 0 1-.4.16H10.18a.28.28 0 0 1-.2-.48l2.36-2.36a.57.57 0 0 1 .4-.16h13.4a.28.28 0 0 1 .2.48z" fill="#fff"/>
  </svg>
);
const DOTSVG = () => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#E6007A"/>
    <ellipse cx="16" cy="8.5" rx="4.5" ry="2.5" fill="#fff"/>
    <ellipse cx="16" cy="23.5" rx="4.5" ry="2.5" fill="#fff"/>
    <ellipse cx="9" cy="12.5" rx="2.5" ry="4.5" transform="rotate(-30 9 12.5)" fill="#fff"/>
    <ellipse cx="23" cy="19.5" rx="2.5" ry="4.5" transform="rotate(-30 23 19.5)" fill="#fff"/>
    <ellipse cx="9" cy="19.5" rx="2.5" ry="4.5" transform="rotate(30 9 19.5)" fill="#fff"/>
    <ellipse cx="23" cy="12.5" rx="2.5" ry="4.5" transform="rotate(30 23 12.5)" fill="#fff"/>
  </svg>
);

/* ══════════════════════════════════════════════════════
   PARTNER LOGOS — real brand SVGs
══════════════════════════════════════════════════════ */
const BinanceLogo = () => (
  <svg viewBox="0 0 126.61 126.61" xmlns="http://www.w3.org/2000/svg">
    <path fill="#F3BA2F" d="M38.27 53.2 63.3 28.17l25.04 25.04 14.56-14.56L63.3-.01 23.71 38.64zm-24.5 24.5L0 63.3l13.77-13.77 13.77 13.77zm24.5 25.71L63.3 128.62l39.6-39.61L88.34 74.41 63.3 99.44 38.27 74.41zM100.07 49.52l-14.56 14.56 13.77 13.77 13.76-13.77zM75.03 63.3l-11.73-11.73-8.47 8.46-2.52 2.52-12.23 12.28 23.95 23.95 11.73-11.73-11.73-11.72z"/>
  </svg>
);
const CoinbaseLogo = () => (
  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <circle cx="512" cy="512" r="512" fill="#0052FF"/>
    <path d="M512 692a180 180 0 1 1 0-360 180 180 0 0 1 0 360z" fill="#fff"/>
    <path d="M412 472h200v80H412z" fill="#0052FF"/>
  </svg>
);
const EtherscanLogo = () => (
  <svg viewBox="0 0 293.775 293.604" xmlns="http://www.w3.org/2000/svg">
    <path d="M60.778 134.237a15.25 15.25 0 0 1 15.258-15.257l25.218.073a15.255 15.255 0 0 1 15.258 15.258v97.371c2.874-.81 6.564-1.574 10.609-2.328a12.714 12.714 0 0 0 10.254-12.508V99.244a15.254 15.254 0 0 1 15.258-15.258h25.26a15.254 15.254 0 0 1 15.258 15.258v113.26s6.41-2.6 12.659-5.19a12.72 12.72 0 0 0 7.754-11.7V64.482a15.255 15.255 0 0 1 15.258-15.258h25.26a15.255 15.255 0 0 1 15.258 15.258V167.77a196.534 196.534 0 0 1 12.657-13.86 15.047 15.047 0 0 0 4.338-10.609V29.734a15.255 15.255 0 0 1 15.258-15.258h25.26a15.255 15.255 0 0 1 15.258 15.258v76.946c25.8-24.87 42.02-57.085 42.02-93.27v-.735C348.042 40.75 289.48 0 220.01 0 150.54 0 91.978 40.756 91.978 91.978c0 36.144 16.208 68.334 42.07 93.2z" fill="#21325B"/>
    <path d="M14.476 217.48c0 36.22 16.17 68.41 42.07 93.28 25.84-24.868 42.05-57.077 42.05-93.28v-.735c0-7.6-1.476-14.944-4.09-21.84a196.18 196.18 0 0 0-12.657 13.864 15.252 15.252 0 0 0-4.338 10.609v-.735l-.064 49.388a15.254 15.254 0 0 1-15.258 15.258H37.03a15.254 15.254 0 0 1-15.258-15.258v-217.2A196.07 196.07 0 0 0 0 146.41v.735c0 24.987 5.3 48.82 14.476 70.33z" fill="#979695"/>
  </svg>
);
const OpenZeppelinLogo = () => (
  <svg viewBox="0 0 56.693 56.693" xmlns="http://www.w3.org/2000/svg">
    <path d="M28.347 0C12.688 0 0 12.688 0 28.347S12.688 56.693 28.347 56.693s28.347-12.688 28.347-28.346S44.005 0 28.347 0zm0 51.692C15.44 51.692 5 41.253 5 28.347S15.44 5 28.347 5s23.347 10.44 23.347 23.347-10.44 23.345-23.347 23.345z" fill="#4E5EE4"/>
    <path d="M35.22 18.72l-14.88 8.59v4.77l14.88-8.59V18.72zm0 8.89l-14.88 8.59v4.77l14.88-8.59v-4.77z" fill="#4E5EE4"/>
  </svg>
);
const ChainlinkLogo = () => (
  <svg viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0L9.6 1.4-4.8 9.3v9.4L9.6 26.6l2.4 1.4 2.4-1.4 4.8-2.8V21l-4.8 2.8L12 25l-2.4-1.4-4.8-2.8V9.3L9.6 6.5 12 5.1l2.4 1.4 4.8 2.8V12l4.8-2.8V7L19.2 4.2z" fill="#375BD2"/>
  </svg>
);
const MetaMaskLogo = () => (
  <svg viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1 35.5 174.6 109.4 193 65.8"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4 35.5 143.1 110.1 125.6 65.8"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="238.3 206.8 211.8 247.4 268.5 263 284.8 207.7"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="33.9 207.7 50.1 263 106.8 247.4 80.3 206.8"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="103.6 138.2 87.8 162.1 144.1 164.6 142.1 104.1"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="214.9 138.2 175.9 103.4 174.6 164.6 230.8 162.1"/>
    <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="106.8 247.4 140.6 230.9 111.4 208.1"/>
    <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="177.9 230.9 211.8 247.4 207.1 208.1"/>
    <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="211.8 247.4 177.9 230.9 180.6 253 180.3 262.3"/>
    <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="106.8 247.4 138.3 262.3 138.1 253 140.6 230.9"/>
    <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="138.8 193.5 110.6 185.2 130.5 176.1"/>
    <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="179.7 193.5 188 176.1 208 185.2"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="106.8 247.4 111.6 206.8 80.3 207.7"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="207 206.8 211.8 247.4 238.3 207.7"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="230.8 162.1 174.6 164.6 179.8 193.5 188.1 176.1 208.1 185.2"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="110.6 185.2 130.6 176.1 138.8 193.5 144.1 164.6 87.8 162.1"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="87.8 162.1 111.4 208.1 110.6 185.2"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="208.1 185.2 207.1 208.1 230.8 162.1"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="144.1 164.6 138.8 193.5 145.4 227.6 146.9 182.7"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="174.6 164.6 171.9 182.6 173.1 227.6 179.8 193.5"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="179.8 193.5 173.1 227.6 177.9 230.9 208.1 208.1 207 185.2"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="110.6 185.2 111.4 208.1 140.6 230.9 145.4 227.6 138.8 193.5"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="180.3 262.3 180.6 253 178.1 250.8 140.4 250.8 138.1 253 138.3 262.3 106.8 247.4 117.8 256.4 140.1 271.9 178.4 271.9 200.8 256.4 211.8 247.4"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="177.9 230.9 173.1 227.6 145.4 227.6 140.6 230.9 138.1 253 140.4 250.8 178.1 250.8 180.6 253"/>
    <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="278.3 114.2 286.8 73.4 274.1 35.5 177.9 106.9 214.9 138.2 267.2 153.5 278.8 140.1 273.8 136.6 281.8 129.3 275.6 124.5 283.6 118.4"/>
    <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="31.8 73.4 40.3 114.2 34.9 118.4 42.9 124.5 36.8 129.3 44.8 136.6 39.8 140.1 51.3 153.5 103.6 138.2 140.6 106.9 44.4 35.5"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="267.2 153.5 214.9 138.2 230.8 162.1 207.1 208.1 238.3 207.7 284.8 207.7"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="103.6 138.2 51.3 153.5 33.9 207.7 80.3 207.7 111.4 208.1 87.8 162.1"/>
    <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="174.6 164.6 177.9 106.9 193.2 65.8 125.6 65.8 140.6 106.9 144.1 164.6 145.3 182.8 145.4 227.6 173.1 227.6 173.2 182.8"/>
  </svg>
);

const cryptoIcons = [
  { name: 'BTC',  color: '#F7931A', svg: <BTCSVG /> },
  { name: 'ETH',  color: '#627EEA', svg: <ETHSVG /> },
  { name: 'USDT', color: '#26A17B', svg: <USDTSVG /> },
  { name: 'BNB',  color: '#F3BA2F', svg: <BNBSVG /> },
  { name: 'SOL',  color: '#9945FF', svg: <SOLSVG /> },
  { name: 'DOT',  color: '#E6007A', svg: <DOTSVG /> },
];

const partnerLogos = [
  { name: 'Binance',      color: '#F3BA2F', bg: '#1a1003', Logo: BinanceLogo },
  { name: 'Coinbase',     color: '#0052FF', bg: '#00061a', Logo: CoinbaseLogo },
  { name: 'Etherscan',    color: '#21325B', bg: '#0a0d14', Logo: EtherscanLogo },
  { name: 'OpenZeppelin', color: '#4E5EE4', bg: '#0b0c1f', Logo: OpenZeppelinLogo },
  { name: 'Chainlink',    color: '#375BD2', bg: '#080d1e', Logo: ChainlinkLogo },
  { name: 'MetaMask',     color: '#E2761B', bg: '#1a0e03', Logo: MetaMaskLogo },
];

/* ══════════════════════════════════════════════════════
   ORBITAL RING + COIN COMPONENTS
══════════════════════════════════════════════════════ */
const OrbitalRing = ({ size, duration, reverse = false, children }) => (
  <motion.div
    initial={{ x: '-50%', y: '-50%', rotate: 0 }}
    animate={{ x: '-50%', y: '-50%', rotate: reverse ? -360 : 360 }}
    transition={{ repeat: Infinity, ease: 'linear', duration }}
    className="absolute rounded-full will-change-transform"
    style={{
      width: size, height: size, left: '50%', top: '50%',
      border: '1px solid rgba(34,197,94,0.10)',
      boxShadow: '0 0 30px rgba(34,197,94,0.06)',
    }}
  >
    {children}
  </motion.div>
);

const OrbitingCoin = ({ coin, angle, duration, reverse = false }) => (
  <div className="absolute inset-0 will-change-transform" style={{ transform: `rotate(${angle}deg)` }}>
    <motion.div
      initial={{ x: '-50%', y: '-50%', rotate: 0 }}
      animate={{ x: '-50%', y: '-50%', rotate: reverse ? 360 : -360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration }}
      className="absolute flex items-center justify-center rounded-full will-change-transform"
      style={{
        width: 44, height: 44, left: '50%', top: 0,
        boxShadow: `0 8px 25px ${coin.color}50`,
        border: `1.5px solid ${coin.color}80`,
        background: '#1e4a2b',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: 36, height: 36 }}>{coin.svg}</div>
    </motion.div>
  </div>
);

const OrbitalBackground = () => (
  <div className="absolute inset-0 overflow-hidden z-0 flex items-center justify-center pointer-events-none"
    role="img" aria-label="Animated orbital rings with cryptocurrency logos">
    {/* Lighter green background */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#3c7d52] via-[#264a32] to-[#20422c]" />
    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px]"
      style={{ background: 'radial-gradient(circle at center,rgba(143,185,0,0.12) 0%,transparent 55%)', filter: 'blur(80px)' }}
      aria-hidden="true" />

    {/* Inner ring (400px) — BTC + ETH */}
    <OrbitalRing size={400} duration={60} reverse>
      <OrbitingCoin coin={cryptoIcons[0]} angle={0}   duration={60} reverse />
      <OrbitingCoin coin={cryptoIcons[1]} angle={180} duration={60} reverse />
    </OrbitalRing>

    {/* Middle ring (700px) — USDT + BNB */}
    <OrbitalRing size={700} duration={90}>
      <OrbitingCoin coin={cryptoIcons[2]} angle={90}  duration={90} />
      <OrbitingCoin coin={cryptoIcons[3]} angle={270} duration={90} />
    </OrbitalRing>

    {/* Outer ring (1000px) — SOL + DOT */}
    <OrbitalRing size={1000} duration={120} reverse>
      <OrbitingCoin coin={cryptoIcons[4]} angle={45}  duration={120} reverse />
      <OrbitingCoin coin={cryptoIcons[5]} angle={225} duration={120} reverse />
    </OrbitalRing>

    {/* Static decorative rings */}
    {[400, 700, 1000, 1300].map((s, i) => (
      <motion.div key={s}
        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 200 + i * 50 }}
        className="absolute rounded-full will-change-transform"
        style={{ width: s, height: s,
          border: `1px solid rgba(34,197,94,${0.04 - i * 0.008})`,
          borderStyle: i % 2 === 1 ? 'dashed' : 'solid' }}
        aria-hidden="true" />
    ))}

    {/* Floating orbs */}
    <motion.div
      animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, ease: 'easeInOut', duration: 6 }}
      className="absolute top-[18%] left-[12%] w-14 h-14 rounded-full will-change-transform"
      style={{ background: 'rgba(34,197,94,0.18)', border: '1.5px solid rgba(34,197,94,0.4)',
        boxShadow: '0 10px 30px rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-hidden="true">
      <div style={{ width: 36, height: 36 }}><BTCSVG /></div>
    </motion.div>

    <motion.div
      animate={{ y: [0, -20, 0], rotate: [0, -10, 10, 0] }}
      transition={{ repeat: Infinity, ease: 'easeInOut', duration: 8, delay: 0.5 }}
      className="absolute top-[28%] right-[15%] w-16 h-16 rounded-full will-change-transform"
      style={{ background: 'rgba(98,126,234,0.18)', border: '1.5px solid rgba(98,126,234,0.4)',
        boxShadow: '0 10px 30px rgba(98,126,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-hidden="true">
      <div style={{ width: 40, height: 40 }}><ETHSVG /></div>
    </motion.div>

    <motion.div
      animate={{ y: [0, 20, 0] }}
      transition={{ repeat: Infinity, ease: 'easeInOut', duration: 7, delay: 1.5 }}
      className="absolute top-[50%] right-[8%] will-change-transform"
      style={{ display: 'flex', gap: 8 }}
      aria-hidden="true">
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(153,69,255,0.18)',
        border: '1.5px solid rgba(153,69,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28 }}><SOLSVG /></div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(243,186,47,0.18)',
        border: '1.5px solid rgba(243,186,47,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24 }}><BNBSVG /></div>
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════
   PARTNER BANNER — scrolling marquee with real logos
══════════════════════════════════════════════════════ */
const PartnerBanner = () => (
  <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ zIndex: 20 }}>
    <span className="sr-only">Our trusted partners include: Binance, Coinbase, Etherscan, OpenZeppelin, Chainlink, MetaMask</span>
    <div
      className="w-[120%] -ml-[10%] h-[88px] md:h-[112px] flex items-center"
      style={{
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        transform: 'skewY(-2deg)',
        boxShadow: '0 -10px 40px rgba(34,197,94,0.25)',
      }}
    >
      <div className="flex items-center justify-around w-full px-8 md:px-16 gap-6 md:gap-12">
        {partnerLogos.map((partner, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2 md:gap-3"
          >
            {/* Logo circle with brand colour bg */}
            <div
              className="w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
              style={{ background: partner.bg, border: `1.5px solid ${partner.color}40` }}
            >
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                <partner.Logo />
              </div>
            </div>
            <span className="text-black font-bold text-xs md:text-sm whitespace-nowrap drop-shadow-sm">
              {partner.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   DASHBOARD MOCKUP
══════════════════════════════════════════════════════ */
const DashboardMockup = () => {
  const mockDeployments = [
    { _id: '1', name: 'MyToken', symbol: 'MTK', _type: 'ERC-20', contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f6', network: 'Sepolia', createdAt: new Date() },
    { _id: '2', name: 'ArtCollection', _type: 'ERC-721', contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', network: 'Sepolia', createdAt: new Date() },
    { _id: '3', name: 'BidAuction', _type: 'Auction', contractAddress: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', network: 'Sepolia', createdAt: new Date() },
  ];
  const mockStats = [
    { label: 'Total Assets',    value: '3',      icon: <LayoutGrid size={16} color="#22c55e" />,   grad: '#22c55e,#16a34a', subtext: 'All contract types' },
    { label: 'ERC-20 Tokens',   value: '1',      icon: <Coins size={16} color="#60a5fa" />,         grad: '#60a5fa,#3b82f6', subtext: 'Fungible tokens deployed' },
    { label: 'NFT Collections', value: '1',      icon: <Image size={16} color="#a78bfa" />,         grad: '#a78bfa,#8b5cf6', subtext: 'ERC-721 collections' },
    { label: 'Status',          value: 'Online', icon: <CheckCircle2 size={16} color="#22c55e" />,  grad: '#22c55e,#16a34a', subtext: 'All services operational', isStatus: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full max-w-[950px] mx-auto mt-8 relative z-10 pointer-events-none"
    >
      <div className="w-full rounded-[20px] border shadow-[0_40px_100px_-10px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#245534 0%,#163a20 100%)', borderColor: 'rgba(143,185,0,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(34,197,94,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99,
              background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.18)',
              fontSize: '0.66rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
              Live Dashboard
            </div>
            <h2 style={{ color: '#e2ede6', fontSize: '1.1rem', fontWeight: 800 }}>Executive <span style={{ color: '#22c55e' }}>Overview</span></h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['📊', 'CSV'], ['📄', 'PDF']].map(([icon, label]) => (
              <div key={label} style={{ padding: '6px 14px', borderRadius: 9, border: '1px solid rgba(34,197,94,0.14)',
                background: 'rgba(34,197,94,0.04)', color: 'rgba(226,237,230,0.6)', fontSize: '0.75rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5 }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, padding: '18px 24px' }}>
          {mockStats.map((s, i) => (
            <div key={i} style={{ position: 'relative', padding: 16, borderRadius: 14,
              background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${s.grad})` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(226,237,230,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
              </div>
              {s.isStatus
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e' }}>{s.value}</p>
                  </div>
                : <p style={{ fontSize: '1.9rem', fontWeight: 900, color: '#e2ede6', lineHeight: 1 }}>{s.value}</p>
              }
              <p style={{ fontSize: '0.62rem', color: 'rgba(226,237,230,0.4)', marginTop: 4 }}>{s.subtext}</p>
            </div>
          ))}
        </div>

        {/* Live crypto ticker */}
        <div style={{ padding: '10px 24px', borderTop: '1px solid rgba(34,197,94,0.08)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {cryptoIcons.slice(0,4).map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8,
              background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)' }}>
              <div style={{ width: 18, height: 18 }}>{c.svg}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e2ede6' }}>{c.name}</span>
              <span style={{ fontSize: '0.65rem', color: '#22c55e', fontFamily: 'monospace' }}>+{(Math.random()*3+0.5).toFixed(2)}%</span>
            </div>
          ))}
        </div>

        {/* Deployment table */}
        <div style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <div style={{ padding: '13px 24px', borderBottom: '1px solid rgba(34,197,94,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#e2ede6' }}>Deployment Registry</h3>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(34,197,94,0.10)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', fontFamily: 'monospace' }}>0x7a2…f3e1</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
                {['Asset', 'Type', 'Contract', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 20px', fontSize: '0.58rem', fontWeight: 700, color: 'rgba(34,197,94,0.55)', textTransform: 'uppercase', letterSpacing: '1.2px', textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockDeployments.map((item, i) => {
                const t = item._type === 'Auction'
                  ? { bg: 'rgba(245,158,11,.1)', br: 'rgba(245,158,11,.2)', c: '#f59e0b', icon: '🔨', label: 'Auction' }
                  : item._type === 'ERC-721'
                    ? { bg: 'rgba(167,139,250,.1)', br: 'rgba(167,139,250,.2)', c: '#a78bfa', icon: '🎨', label: 'ERC-721' }
                    : { bg: 'rgba(34,197,94,.1)',  br: 'rgba(34,197,94,.2)',  c: '#22c55e', icon: '🪙', label: 'ERC-20' };
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(34,197,94,0.04)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 33, height: 33, borderRadius: 9, background: t.bg, border: `1px solid ${t.br}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 800, color: t.c }}>
                          {(item.symbol || item.name || '').substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#e2ede6', fontSize: '0.78rem' }}>{item.name}</p>
                          <p style={{ fontSize: '0.58rem', color: 'rgba(34,197,94,0.5)' }}>{item.network}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: '0.58rem', fontWeight: 700, background: t.bg, color: t.c, border: `1px solid ${t.br}` }}>{t.icon} {t.label}</span>
                    </td>
                    <td style={{ padding: '12px 20px', fontFamily: 'monospace', fontSize: '0.68rem', color: 'rgba(226,237,230,0.55)' }}>
                      {item.contractAddress.slice(0, 10)}…{item.contractAddress.slice(-4)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.7rem', color: 'rgba(34,197,94,0.45)' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.62rem', padding: '5px 10px', borderRadius: 7, background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }}>📋</span>
                        <span style={{ fontSize: '0.62rem', padding: '5px 10px', borderRadius: 7, background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }}>↗</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating notification */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{ position: 'absolute', right: -18, bottom: 20, background: '#245534', padding: '11px 14px',
          borderRadius: 12, border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          width: 190, display: 'flex', alignItems: 'center', gap: 11, zIndex: 30 }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ color: '#e2ede6', fontSize: '0.72rem', fontWeight: 700, marginBottom: 2 }}>Deployment Successful</p>
          <span style={{ color: '#22c55e', fontSize: '0.62rem', fontWeight: 600 }}>ERC-20 Token Deployed</span>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={14} color="#22c55e" />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════ */
export default function HeroSection({ onGetStarted }) {
  return (
    <section id="home" className="relative w-full min-h-screen bg-[var(--bg)] flex flex-col items-center pt-28 pb-32 md:pb-40 overflow-hidden font-inter">
      <OrbitalBackground />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6 text-center flex flex-col items-center">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] backdrop-blur-sm text-[11px] md:text-sm font-semibold text-[rgba(255,255,255,0.85)] tracking-wide">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            No-Code Smart Contract Platform on Web3
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[clamp(2.5rem,6vw,4.8rem)] font-black leading-[1.1] tracking-tight mb-6 max-w-[900px]"
          style={{ color: '#e2ede6' }}>
          Deploy Smart Contracts{' '}
          <br className="hidden sm:block" />
          <span style={{ color: '#22c55e' }}>Without Writing Code</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-[1.1rem] max-w-[620px] mb-10 leading-relaxed font-medium"
          style={{ color: 'rgba(226,237,230,0.7)' }}>
          Generate, audit, and deploy ERC-20 tokens, NFT collections, and auctions on Sepolia in minutes — powered by AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-row gap-4 justify-center items-center">
          <button onClick={onGetStarted}
            className="group flex items-center justify-between gap-3 px-5 py-3 md:px-7 md:py-3.5 rounded-[14px] font-bold text-sm md:text-base transition-all hover:-translate-y-0.5"
            style={{ background: '#8FB900', color: '#0a1508', boxShadow: '0 0 24px rgba(143,185,0,0.35)' }}>
            <span>Get Started</span>
            <div className="bg-[#112d18] text-[#8FB900] rounded-full p-1 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={16} strokeWidth={3} />
            </div>
          </button>

          <a href="#features"
            className="group flex items-center justify-between gap-3 bg-transparent border-[1.5px] text-white px-5 py-3 md:px-7 md:py-3.5 rounded-[14px] font-bold text-sm md:text-base transition-all hover:-translate-y-0.5"
            style={{ borderColor: 'rgba(34,197,94,0.25)' }}>
            <span>Explore</span>
            <div className="rounded-full p-1 group-hover:translate-x-1 transition-transform"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              <ChevronRight size={16} strokeWidth={3} />
            </div>
          </a>
        </motion.div>

        {/* Dashboard Mockup */}
        <div className="mt-20">
          <DashboardMockup />
        </div>
      </div>

      {/* Partner Banner */}
      <PartnerBanner />
    </section>
  );
}

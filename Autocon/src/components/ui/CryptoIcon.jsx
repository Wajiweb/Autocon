/**
 * CryptoIcon.jsx — Centralised real crypto logo registry
 * CDN: cryptologos.cc (free, 400+ SVG brand logos, stable URLs)
 * All icons degrade gracefully to emoji if the CDN is unavailable.
 *
 * Usage:
 *   <CryptoIcon id="eth" size={24} />
 *   <CryptoIcon id="bnb" size={32} style={{ borderRadius: '50%' }} />
 *   getNetworkLogo('sepolia')  → { src, fallback }
 */
import React, { useState } from 'react';

/* ── Icon Registry ──────────────────────────────────────── */
export const CRYPTO_ICONS = {
  // Networks / Layer-1s
  eth:       { src: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',       fallback: 'ETH',  label: 'Ethereum' },
  bnb:       { src: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040',            fallback: 'BNB',  label: 'BNB Chain', bg: '#F0B90B' },
  avax:      { src: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=040',     fallback: 'AVAX', label: 'Avalanche' },
  matic:     { src: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=040',      fallback: 'MATIC',  label: 'Polygon' },
  arb:       { src: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=040',       fallback: 'ARB', label: 'Arbitrum' },
  op:        { src: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=040',fallback: 'OP', label: 'Optimism' },
  sepolia:   { src: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',       fallback: 'ETH',  label: 'Sepolia',  opacity: 0.7 },

  // Tokens
  usdt:      { src: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=040',        fallback: 'USDT', label: 'USDT' },
  usdc:      { src: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',      fallback: 'USDC', label: 'USDC' },
  link:      { src: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=040',     fallback: 'LINK',  label: 'Chainlink' },
  uni:       { src: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=040',        fallback: 'UNI', label: 'Uniswap' },

  // Tools / Ecosystem
  metamask:  { src: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', fallback: 'FOX', label: 'MetaMask' },
  hardhat:   { src: 'https://hardhat.org/favicon.ico',                                      fallback: 'H', label: 'Hardhat' },
  openzeppelin: { src: 'https://avatars.githubusercontent.com/u/20820676?s=200&v=4',        fallback: 'OZ',  label: 'OpenZeppelin' },
  solidity:  { src: 'https://docs.soliditylang.org/en/latest/_static/logo.svg',             fallback: 'SOL',  label: 'Solidity' },

  // Contract-type icons (Lucide-style, but using inline SVG for consistent sizing)
  erc20:     { src: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',       fallback: 'TK', label: 'ERC-20 Token' },
  erc721:    { src: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',       fallback: 'NFT', label: 'NFT' },
  auction:   { src: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',       fallback: 'AUC', label: 'Auction' },
};

/** Map from NetworkContext key → icon id */
export const NETWORK_ICON_MAP = {
  sepolia:   'sepolia',
  bnbTestnet:'bnb',
  mainnet:   'eth',
  polygon:   'matic',
  arbitrum:  'arb',
  optimism:  'op',
};

/** Returns { src, fallback, label } for a network key */
export function getNetworkLogo(networkKey) {
  const id = NETWORK_ICON_MAP[networkKey] || 'eth';
  return CRYPTO_ICONS[id] || CRYPTO_ICONS.eth;
}

/* ── Component ──────────────────────────────────────────── */
/**
 * @param {string}  id       — key from CRYPTO_ICONS (e.g. 'eth', 'bnb', 'metamask')
 * @param {number}  size     — pixel size (width & height), default 24
 * @param {object}  style    — extra inline styles
 * @param {string}  className
 * @param {boolean} circle   — clip to circle (useful for network badges)
 */
export default function CryptoIcon({ id, size = 24, style = {}, className = '', circle = false }) {
  const [failed, setFailed] = useState(false);
  const icon = CRYPTO_ICONS[id];

  if (!icon) return null;

  const baseStyle = {
    width:  size,
    height: size,
    display: 'inline-block',
    flexShrink: 0,
    objectFit: 'contain',
    verticalAlign: 'middle',
    ...(circle ? { borderRadius: '50%' } : {}),
    ...(icon.opacity ? { opacity: icon.opacity } : {}),
    ...(icon.bg && !failed ? { background: icon.bg, borderRadius: circle ? '50%' : 4, padding: 2 } : {}),
    ...style,
  };

  if (failed) {
    return (
      <span
        className={className}
        aria-label={icon.label}
        style={{ fontSize: size * 0.85, lineHeight: 1, ...style }}
      >
        {icon.fallback}
      </span>
    );
  }

  return (
    <img
      src={icon.src}
      alt={icon.label}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      style={baseStyle}
    />
  );
}

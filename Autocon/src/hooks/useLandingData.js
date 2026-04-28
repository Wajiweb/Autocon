/**
 * useLandingData.js
 * Fetches landing page content (stats, features, testimonials) from the backend.
 * - Shows loading states per resource
 * - Falls back to hardcoded defaults if the API is unavailable
 * - Module-level cache prevents re-fetching on remount
 */
import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config';

// ── Fallback Data ──────────────────────────────────────────────────────────
const DEFAULT_STATS = {
  contractsDeployed: '10,000+',
  chainsSupported:   '5',
  activeUsers:       '2,500+',
  uptime:            '99.9%',
};

const DEFAULT_FEATURES = [
  {
    id:          'no-code',
    icon:        'Wand2',
    title:       'No-Code Deploy',
    description: 'Generate production-ready smart contracts in minutes — zero Solidity experience required.',
  },
  {
    id:          'ai-audit',
    icon:        'ShieldCheck',
    title:       'AI Security Audit',
    description: 'Every contract is automatically audited by our Gemini-powered AI before deployment.',
  },
  {
    id:          'multi-chain',
    icon:        'Globe',
    title:       'Multi-Chain Support',
    description: 'Deploy on Sepolia, Polygon Amoy, and BNB testnet from a single unified interface.',
  },
  {
    id:          'templates',
    icon:        'LayoutTemplate',
    title:       'Template Library',
    description: 'Start from battle-tested contract templates for tokens, NFTs, and auctions.',
  },
];

const DEFAULT_TESTIMONIALS = [
  { id: 1, name: 'Alex R.',     role: 'Founder',           company: 'NFT Studio',       rating: 5, review: 'AutoCon cut our deployment time from days to minutes. Absolutely incredible.' },
  { id: 2, name: 'Priya M.',    role: 'DeFi Developer',    company: 'ChainWorks',        rating: 5, review: 'The AI audit caught a reentrancy bug I missed. This tool is a lifesaver.' },
  { id: 3, name: 'Jordan K.',   role: 'Blockchain Lead',   company: 'TokenForge',        rating: 5, review: 'Multi-chain support out of the box. No config, just works.' },
  { id: 4, name: 'Sarah L.',    role: 'Product Manager',   company: 'Web3 Ventures',     rating: 5, review: 'Non-technical founders can now deploy contracts without a developer.' },
  { id: 5, name: 'Marcus T.',   role: 'Smart Contract Dev', company: 'DeFi Labs',        rating: 5, review: 'Template library saved us weeks of boilerplate. Highly recommend.' },
  { id: 6, name: 'Emily C.',    role: 'CTO',               company: 'NFT Marketplace',   rating: 5, review: 'The dashboard mockup UI is slick and the deployment flow is seamless.' },
  { id: 7, name: 'David W.',    role: 'Solidity Dev',      company: 'Auditcraft',        rating: 5, review: 'I use AutoCon to prototype new contracts before building them manually.' },
  { id: 8, name: 'Nina P.',     role: 'Community Manager', company: 'DAO Hub',           rating: 5, review: 'Our DAO deployed its governance token in under 10 minutes. Mind-blowing.' },
];

// ── Module-level cache ─────────────────────────────────────────────────────
let _cache = null;

export function useLandingData() {
  const [data, setData]       = useState(_cache);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError]     = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (_cache) return; // already cached

    async function fetchAll() {
      try {
        const [statsRes, featuresRes, testimonialsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/landing/stats`).then(r => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/api/landing/features`).then(r => r.ok ? r.json() : Promise.reject()),
          fetch(`${API_BASE}/api/landing/testimonials`).then(r => r.ok ? r.json() : Promise.reject()),
        ]);

        const result = {
          stats:        statsRes.status        === 'fulfilled' ? statsRes.value        : DEFAULT_STATS,
          features:     featuresRes.status     === 'fulfilled' ? featuresRes.value     : DEFAULT_FEATURES,
          testimonials: testimonialsRes.status === 'fulfilled' ? testimonialsRes.value : DEFAULT_TESTIMONIALS,
        };

        _cache = result;
        if (mounted.current) setData(result);
      } catch (err) {
        if (mounted.current) {
          setError(err);
          // Graceful degradation — use defaults
          const fallback = { stats: DEFAULT_STATS, features: DEFAULT_FEATURES, testimonials: DEFAULT_TESTIMONIALS };
          _cache = fallback;
          setData(fallback);
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    }

    fetchAll();
    return () => { mounted.current = false; };
  }, []);

  return {
    stats:        data?.stats        ?? DEFAULT_STATS,
    features:     data?.features     ?? DEFAULT_FEATURES,
    testimonials: data?.testimonials ?? DEFAULT_TESTIMONIALS,
    loading,
    error,
  };
}

/**
 * useLandingQuery.js
 * React Query wrappers for landing page data endpoints.
 * - Automatic caching, deduplication, and retry
 * - Falls back to defaults if API unavailable (initialData)
 * - Replaces the manual useLandingData hook for components that need granular loading states
 */
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../config';

// ── Fetch helpers ─────────────────────────────────────────────────────────
const fetchJSON = async (endpoint) => {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`${res.status} ${endpoint}`);
  return res.json();
};

// ── Default / fallback data ───────────────────────────────────────────────
export const DEFAULT_STATS = {
  contractsDeployed: '10,000+',
  chainsSupported:   '5',
  activeUsers:       '2,500+',
  uptime:            '99.9%',
};

export const DEFAULT_FEATURES = [
  { id: 'no-code',   icon: 'Wand2',         title: 'No-Code Deploy',      description: 'Generate production-ready smart contracts in minutes — zero Solidity experience required.'         },
  { id: 'ai-audit',  icon: 'ShieldCheck',   title: 'AI Security Audit',   description: 'Every contract is automatically audited by our Gemini-powered AI before deployment.'             },
  { id: 'multi-chain',icon: 'Globe',        title: 'Multi-Chain Support', description: 'Deploy on Sepolia, Polygon Amoy, and BNB testnet from a single unified interface.'              },
  { id: 'templates', icon: 'LayoutTemplate',title: 'Template Library',    description: 'Start from battle-tested contract templates for tokens, NFTs, and auctions.'                     },
];

export const DEFAULT_TESTIMONIALS = [
  { id: 1, name: 'Alex R.',   role: 'Founder',           company: 'NFT Studio',     rating: 5, review: 'AutoCon cut our deployment time from days to minutes. Absolutely incredible.' },
  { id: 2, name: 'Priya M.',  role: 'DeFi Developer',    company: 'ChainWorks',      rating: 5, review: 'The AI audit caught a reentrancy bug I missed. This tool is a lifesaver.' },
  { id: 3, name: 'Jordan K.', role: 'Blockchain Lead',   company: 'TokenForge',      rating: 5, review: 'Multi-chain support out of the box. No config, just works.' },
  { id: 4, name: 'Sarah L.',  role: 'Product Manager',   company: 'Web3 Ventures',   rating: 5, review: 'Non-technical founders can now deploy contracts without a developer.' },
  { id: 5, name: 'Marcus T.', role: 'Smart Contract Dev',company: 'DeFi Labs',       rating: 5, review: 'Template library saved us weeks of boilerplate. Highly recommend.' },
  { id: 6, name: 'Emily C.',  role: 'CTO',               company: 'NFT Marketplace', rating: 5, review: 'Slick dashboard UI and a seamless deployment flow.' },
  { id: 7, name: 'David W.',  role: 'Solidity Dev',      company: 'Auditcraft',      rating: 5, review: 'I prototype new contracts in AutoCon before building manually.' },
  { id: 8, name: 'Nina P.',   role: 'Community Manager', company: 'DAO Hub',         rating: 5, review: 'Our DAO deployed its governance token in under 10 minutes.' },
];

// ── Typed query hooks ─────────────────────────────────────────────────────

/** Platform statistics */
export const useStats = () =>
  useQuery({
    queryKey:    ['landing', 'stats'],
    queryFn:     () => fetchJSON('/api/landing/stats'),
    initialData: DEFAULT_STATS,
  });

/** Feature cards */
export const useFeatures = () =>
  useQuery({
    queryKey:    ['landing', 'features'],
    queryFn:     () => fetchJSON('/api/landing/features'),
    initialData: DEFAULT_FEATURES,
  });

/** Testimonial cards */
export const useTestimonials = () =>
  useQuery({
    queryKey:    ['landing', 'testimonials'],
    queryFn:     () => fetchJSON('/api/landing/testimonials'),
    initialData: DEFAULT_TESTIMONIALS,
  });

/**
 * Convenience hook — fetches all landing data in parallel.
 * Uses initialData so page never shows empty state.
 */
export const useLandingQuery = () => {
  const stats        = useStats();
  const features     = useFeatures();
  const testimonials = useTestimonials();

  return {
    stats:        stats.data        ?? DEFAULT_STATS,
    features:     features.data     ?? DEFAULT_FEATURES,
    testimonials: testimonials.data ?? DEFAULT_TESTIMONIALS,
    isLoading:    stats.isLoading || features.isLoading || testimonials.isLoading,
    isError:      stats.isError  || features.isError  || testimonials.isError,
  };
};

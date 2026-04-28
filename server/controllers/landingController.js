/**
 * landingController.js
 * Business logic for landing page data endpoints.
 * Decoupled from routing — injectable and testable.
 *
 * Future: replace hardcoded JSON with DB queries (e.g. CMS, MongoDB).
 */

const STATS = {
    contractsDeployed: '10,000+',
    chainsSupported:   '5',
    activeUsers:       '2,500+',
    uptime:            '99.9%',
};

const FEATURES = [
    { id: 'no-code',    icon: 'Wand2',         title: 'No-Code Deploy',      description: 'Generate production-ready smart contracts in minutes — zero Solidity experience required.'         },
    { id: 'ai-audit',   icon: 'ShieldCheck',   title: 'AI Security Audit',   description: 'Every contract is automatically audited by our Gemini-powered AI before deployment.'             },
    { id: 'multi-chain',icon: 'Globe',         title: 'Multi-Chain Support', description: 'Deploy on Sepolia, Polygon Amoy, and BNB testnet from a single unified interface.'              },
    { id: 'templates',  icon: 'LayoutTemplate',title: 'Template Library',    description: 'Start from battle-tested contract templates for tokens, NFTs, and auctions.'                     },
];

const TESTIMONIALS = [
    { id: 1, name: 'Alex R.',   role: 'Founder',           company: 'NFT Studio',     rating: 5, review: 'AutoCon cut our deployment time from days to minutes. Absolutely incredible product.' },
    { id: 2, name: 'Priya M.',  role: 'DeFi Developer',    company: 'ChainWorks',      rating: 5, review: 'The AI audit caught a reentrancy bug I missed entirely. This tool is a lifesaver.'   },
    { id: 3, name: 'Jordan K.', role: 'Blockchain Lead',   company: 'TokenForge',      rating: 5, review: 'Multi-chain support out of the box. No config, just works. Saved us weeks of setup.' },
    { id: 4, name: 'Sarah L.',  role: 'Product Manager',   company: 'Web3 Ventures',   rating: 5, review: 'Non-technical founders can now deploy contracts without hiring a Solidity developer.' },
    { id: 5, name: 'Marcus T.', role: 'Smart Contract Dev',company: 'DeFi Labs',       rating: 5, review: 'Template library saved us weeks of boilerplate. Clean, well-audited code every time.' },
    { id: 6, name: 'Emily C.',  role: 'CTO',               company: 'NFT Marketplace', rating: 5, review: 'The dashboard UI is slick and the deployment flow is seamless. Love the audit reports.'},
    { id: 7, name: 'David W.',  role: 'Solidity Dev',      company: 'Auditcraft',      rating: 5, review: 'I use AutoCon to prototype new contracts before building them manually. Huge time saver.'},
    { id: 8, name: 'Nina P.',   role: 'Community Manager', company: 'DAO Hub',         rating: 5, review: 'Our DAO deployed its governance token in under 10 minutes. Absolutely mind-blowing.'  },
];

/**
 * GET /api/landing/stats
 */
exports.getStats = (_req, res) => {
    res.json(STATS);
};

/**
 * GET /api/landing/features
 */
exports.getFeatures = (_req, res) => {
    res.json(FEATURES);
};

/**
 * GET /api/landing/testimonials
 */
exports.getTestimonials = (_req, res) => {
    res.json(TESTIMONIALS);
};

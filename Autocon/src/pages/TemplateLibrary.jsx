import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, Input, Modal } from '../components/ui';
import { Globe, Coins, Ticket, Palette, Heart, Hammer, Zap, Lightbulb, ArrowRight } from 'lucide-react';
import '../components/dashboard/styles/dashboard.css';

/* ═══════════════════════════════════════════════════════════
   TEMPLATE REGISTRY
   Each template pre-fills a specific generator with beginner-
   friendly defaults and navigates to the correct generator page
   with state so the hook can initialise the form.
   ═══════════════════════════════════════════════════════════ */
const TEMPLATES = [
  /* ── Tier 1: ERC-20 ────────────────────────────────────── */
  {
    id: 'community-token',
    name: 'Community Token',
    icon: <Globe size={24} />,
    category: 'ERC-20',
    complexity: 'Beginner',
    gasEstimate: '~0.003 ETH',
    color: '#ff6b00', // unified orange
    accent: 'rgba(255,107,0,0.10)',
    border: 'rgba(255,107,0,0.22)',
    route: '/create?type=ERC20',
    description: 'Launch a community governance or rewards token for your DAO, Discord server, or online community.',
    features: ['1,000,000 Initial Supply', 'Owner Minting', 'Burn Support', 'Fully ERC-20 Compliant'],
    beginner_note: 'Perfect for beginners — everything is pre-filled. Just connect your wallet and deploy.',
    defaults: {
      name: 'Community Token',
      symbol: 'CMT',
      supply: '1000000',
    },
  },
  {
    id: 'erc20-token',
    name: 'ERC-20 Token',
    icon: <Coins size={24} />,
    category: 'ERC-20',
    complexity: 'Beginner',
    gasEstimate: '~0.003 ETH',
    color: '#34d399', // emerald green
    accent: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.20)',
    route: '/create?type=ERC20',
    description: 'Create a custom cryptocurrency token with minting, burning, and ownership controls.',
    features: ['Custom Name & Symbol', 'Initial Supply', 'Owner Minting', 'ERC20Burnable', 'Ownable'],
    beginner_note: 'Standard token template. Customise the name, symbol, and supply before deploying.',
    defaults: {
      name: '',
      symbol: '',
      supply: '1000000',
    },
  },

  /* ── Tier 2: ERC-721 ────────────────────────────────────── */
  {
    id: 'event-ticket-nft',
    name: 'Event Ticket NFT',
    icon: <Ticket size={24} />,
    category: 'ERC-721',
    complexity: 'Beginner',
    gasEstimate: '~0.005 ETH',
    color: '#8b5cf6', // purple
    accent: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.22)',
    route: '/create?type=ERC721',
    description: 'Issue tamper-proof event tickets as NFTs. Each ticket is a unique, transferable on-chain asset.',
    features: ['500 Max Supply', '0.01 ETH Mint Price', 'URI Storage', 'Burn Support', 'Owner Withdraw'],
    beginner_note: 'Pre-set for 500 event tickets at 0.01 ETH each. Change the name and deploy.',
    defaults: {
      name: 'Event Ticket',
      symbol: 'TCKT',
      maxSupply: '500',
      mintPrice: '0.01',
      baseURI: '',
    },
  },
  {
    id: 'nft-collection',
    name: 'NFT Collection',
    icon: <Palette size={24} />,
    category: 'ERC-721',
    complexity: 'Intermediate',
    gasEstimate: '~0.005 ETH',
    color: '#ec4899', // pink
    accent: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.20)',
    route: '/create?type=ERC721',
    description: 'Launch a full NFT collection with individual token metadata, mint pricing, and max supply caps.',
    features: ['Custom Max Supply', 'Mint Pricing', 'URI Storage', 'Burn Support', 'Withdraw Funds'],
    beginner_note: 'Configure your collection size and mint price before deploying.',
    defaults: {
      name: '',
      symbol: '',
      maxSupply: '10000',
      mintPrice: '0',
      baseURI: '',
    },
  },

  /* ── Tier 3: Auction ────────────────────────────────────── */
  {
    id: 'charity-auction',
    name: 'Charity Auction',
    icon: <Heart size={24} />,
    category: 'Auction',
    complexity: 'Beginner',
    gasEstimate: '~0.004 ETH',
    color: '#fb923c', // soft orange
    accent: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.22)',
    route: '/create?type=Auction',
    description: 'Run a transparent, on-chain charity auction where 100% of proceeds go directly to the beneficiary wallet.',
    features: ['24h Duration', '0.001 ETH Min Bid', 'Auto-Refund Losers', 'Extend Time', 'Direct Payout'],
    beginner_note: 'Pre-configured for a 24-hour charity auction. Change the item name and deploy.',
    defaults: {
      name: 'CharityAuction',
      itemName: 'Charity Item',
      itemDescription: 'All proceeds go to the beneficiary wallet.',
      duration: '86400',
      minimumBid: '0.001',
    },
  },
  {
    id: 'english-auction',
    name: 'English Auction',
    icon: <Hammer size={24} />,
    category: 'Auction',
    complexity: 'Advanced',
    gasEstimate: '~0.004 ETH',
    color: '#fbbf24', // yellow amber
    accent: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.22)',
    route: '/create?type=Auction',
    description: 'Deploy a decentralized English Auction with timed bidding, auto-refunds, and minimum bids.',
    features: ['Timed Bidding', 'Min Bid Enforced', 'Auto-Refund', 'Time Extension', 'Beneficiary Payout'],
    beginner_note: 'Fully customisable auction. Set your item, duration, and minimum bid.',
    defaults: {
      name: '',
      itemName: '',
      itemDescription: '',
      duration: '3600',
      minimumBid: '0.01',
    },
  },
];

const CATEGORY_FILTERS = ['All', 'ERC-20', 'ERC-721', 'Auction'];

const COMPLEXITY_COLOR = {
  Beginner:     { color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)' },
  Intermediate: { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)' },
  Advanced:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)' },
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [modalTemplate, setModalTemplate] = useState(null);
  const [params, setParams] = useState({});

  const filtered = filter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === filter);

  const openModal = (t) => {
    setParams({ ...t.defaults });
    setModalTemplate(t);
  };

  const closeModal = () => setModalTemplate(null);

  const handleLaunch = () => {
    // Pass pre-filled params to the generator via router state
    navigate(modalTemplate.route, { state: { prefill: params } });
    closeModal();
  };

  const handleParamChange = (e) => {
    setParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fields = modalTemplate 
    ? Object.entries(modalTemplate.defaults).map(([key, defaultVal]) => ({
        key,
        label: key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, s => s.toUpperCase()),
        type: ['supply', 'maxSupply', 'duration'].includes(key) ? 'number' : 'text',
        step: ['mintPrice', 'minimumBid'].includes(key) ? '0.001' : undefined,
        placeholder: String(defaultVal) || `Enter ${key}`,
      }))
    : [];

  return (
    <GlassCard className="pg-wrap" delay={0.1} padding="lg" hoverable={false} style={{ background: 'var(--surface-1)' }}>

      {/* Header */}
      <div className="pg-head db-enter db-enter-1">
        <div className="pg-title">Template <em>Library</em></div>
        <div className="pg-sub">Choose a template, customise your parameters, and deploy in minutes — no Solidity required.</div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }} className="db-enter db-enter-2">
        {CATEGORY_FILTERS.map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className="pg-btn"
            aria-pressed={filter === f}
            style={{
              background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
              color: filter === f ? 'var(--surface)' : 'var(--on-surface-variant)',
              border: filter === f ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
              boxShadow: filter === f ? '0 8px 24px rgba(249, 107, 0, 0.25)' : 'none',
              fontWeight: 700, 
              fontSize: 13,
              borderRadius: 10,
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {f}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--on-surface-muted)', fontWeight: 600 }}>
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Template Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {filtered.map((t, i) => {
          const cx = COMPLEXITY_COLOR[t.complexity];
          return (
            <GlassCard 
              key={t.id}
              className={`db-enter db-enter-${(i % 4) + 2} flex flex-col justify-between`}
              hoverable={true}
              padding="md"
              accent="none"
              style={{
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderTop: `2px solid ${t.color}`,
              }}
              onClick={() => openModal(t)}
            >
              {/* Card Ambient Glow Layer */}
              <div 
                className="absolute top-0 right-0 w-[180px] h-[100px] rounded-full blur-[50px] pointer-events-none" 
                style={{ background: `radial-gradient(circle, ${t.color}15 0%, transparent 85%)` }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 2 }}>
                {/* Icon + Title Row */}
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: t.accent, border: `1px solid ${t.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t.color
                  }}>{t.icon}</div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'var(--db-font)', margin: '0 0 6px' }}>
                      {t.name}
                    </h2>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="pg-badge" style={{ background: t.accent, color: t.color, border: `1px solid ${t.border}` }}>
                        {t.category}
                      </span>
                      <span className="pg-badge" style={{ background: cx.bg, color: cx.color, border: `1px solid ${cx.border}` }}>
                        {t.complexity}
                      </span>
                      <span style={{ fontFamily: 'var(--db-mono)', fontSize: 11, color: 'var(--on-surface-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={11} style={{ color: '#fbbf24' }} /> {t.gasEstimate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, margin: 0 }}>
                  {t.description}
                </p>

                {/* Beginner note */}
                <div style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: t.accent, border: `1px solid ${t.border}`,
                  fontSize: 12, color: t.color, fontWeight: 600,
                  lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8
                }}>
                  <Lightbulb size={15} style={{ flexShrink: 0, marginTop: 1.5 }} /> 
                  <span>{t.beginner_note}</span>
                </div>

                {/* Feature tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {t.features.map(f => (
                    <span 
                      key={f} 
                      className="pg-badge"
                      style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--on-surface-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Launch CTA */}
              <div style={{ marginTop: 20, position: 'relative', zIndex: 2 }}>
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={(e) => { e.stopPropagation(); openModal(t); }}
                  style={{ width: '100%', backgroundColor: t.color, color: 'var(--surface)', fontWeight: 700, boxShadow: `0 4px 18px ${t.accent}` }}
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                >
                  Use Template
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Footer note */}
      <GlassCard 
        className="db-enter db-enter-6 text-center border border-white/5 bg-black/20" 
        style={{ marginTop: 24 }}
        hoverable={false}
        padding="md"
      >
        <p style={{ fontSize: 13, color: 'var(--on-surface-muted)', margin: 0 }}>
          All templates leverage standard <strong style={{ color: '#fff' }}>OpenZeppelin</strong> audited components 
          and deploy to your selected sandbox testnet.
        </p>
      </GlassCard>

      {/* Reusable Customize Modal */}
      <AnimatePresence>
        {modalTemplate && (
          <Modal 
            isOpen={!!modalTemplate} 
            onClose={closeModal} 
            title={`Customise Template — ${modalTemplate.name}`}
            size="md"
          >
            {/* Modal Header Intro */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: modalTemplate.accent, border: `1px solid ${modalTemplate.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: modalTemplate.color
              }}>{modalTemplate.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', tracking: '0.08em', color: modalTemplate.color }}>
                  {modalTemplate.category} · {modalTemplate.complexity}
                </div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 2 }}>
                  {modalTemplate.beginner_note}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

            {/* Fields list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {fields.map(f => (
                <Input
                  key={f.key}
                  label={f.label}
                  name={f.key}
                  type={f.type}
                  step={f.step}
                  value={params[f.key] ?? ''}
                  onChange={handleParamChange}
                  placeholder={f.placeholder}
                  className="w-full"
                />
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <Button 
                variant="ghost" 
                size="md" 
                onClick={closeModal} 
                style={{ flex: 1, border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleLaunch}
                style={{ 
                  flex: 2, 
                  backgroundColor: modalTemplate.color, 
                  color: 'var(--surface)', 
                  boxShadow: `0 8px 24px ${modalTemplate.accent}`,
                  fontWeight: 700
                }}
                icon={<ArrowRight size={14} />}
                iconPosition="right"
              >
                Launch Wizard
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

    </GlassCard>
  );
}

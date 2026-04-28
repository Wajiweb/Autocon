import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    icon: '🌐',
    category: 'ERC-20',
    complexity: 'Beginner',
    gasEstimate: '~0.003 ETH',
    color: 'var(--primary)',
    accent: 'rgba(93,169,233,0.10)',
    border: 'rgba(93,169,233,0.22)',
    route: '/tokens',
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
    icon: '🪙',
    category: 'ERC-20',
    complexity: 'Beginner',
    gasEstimate: '~0.003 ETH',
    color: '#4ade80',
    accent: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.20)',
    route: '/tokens',
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
    icon: '🎟️',
    category: 'ERC-721',
    complexity: 'Beginner',
    gasEstimate: '~0.005 ETH',
    color: '#a78bfa',
    accent: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.22)',
    route: '/nfts',
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
    icon: '🎨',
    category: 'ERC-721',
    complexity: 'Intermediate',
    gasEstimate: '~0.005 ETH',
    color: '#e879f9',
    accent: 'rgba(232,121,249,0.08)',
    border: 'rgba(232,121,249,0.20)',
    route: '/nfts',
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
    icon: '❤️',
    category: 'Auction',
    complexity: 'Beginner',
    gasEstimate: '~0.004 ETH',
    color: '#fb923c',
    accent: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.22)',
    route: '/auctions',
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
    icon: '🔨',
    category: 'Auction',
    complexity: 'Advanced',
    gasEstimate: '~0.004 ETH',
    color: '#f59e0b',
    accent: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.22)',
    route: '/auctions',
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
  Beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.20)' },
  Intermediate: { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.20)' },
  Advanced:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' },
};

/* ═══════════════════════════════════════════════════════════
   CUSTOMISE MODAL — shown before navigating to the generator
═══════════════════════════════════════════════════════════ */
function CustomiseModal({ template, onClose, onLaunch }) {
  const [params, setParams] = useState({ ...template.defaults });

  const handleChange = (e) => {
    setParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fields = Object.entries(template.defaults).map(([key, defaultVal]) => ({
    key,
    label: key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase()),
    type: ['supply', 'maxSupply', 'duration'].includes(key) ? 'number' : 'text',
    step: ['mintPrice', 'minimumBid'].includes(key) ? '0.001' : undefined,
    placeholder: String(defaultVal) || `Enter ${key}`,
  }));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)',
        border: `1px solid ${template.border}`,
        borderTop: `3px solid ${template.color}`,
        borderRadius: '20px',
        padding: '32px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: template.accent, border: `1px solid ${template.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
          }}>{template.icon}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--on-surface)', fontFamily: 'var(--db-font)' }}>
              Customise — {template.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {template.beginner_note}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--outline)', margin: '20px 0' }} />

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label className="pg-label">{f.label}</label>
              <input
                name={f.key}
                type={f.type}
                step={f.step}
                className="pg-input"
                value={params[f.key] ?? ''}
                onChange={handleChange}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="pg-btn" onClick={onClose}
            style={{ flex: 1, background: 'var(--surface-high)', color: 'var(--on-surface-variant)' }}>
            Cancel
          </button>
          <button className="pg-btn pg-btn-primary" onClick={() => onLaunch(params)}
            style={{ flex: 2, background: template.color, color: 'var(--surface)', boxShadow: `0 4px 20px ${template.accent}` }}>
            Launch Generator →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [modalTemplate, setModalTemplate] = useState(null);

  const filtered = filter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === filter);

  const openModal = (t) => setModalTemplate(t);
  const closeModal = () => setModalTemplate(null);

  const handleLaunch = (params) => {
    // Pass pre-filled params to the generator via router state
    navigate(modalTemplate.route, { state: { prefill: params } });
  };

  return (
    <div className="pg-wrap">

      {/* Header */}
      <div className="pg-head db-enter db-enter-1">
        <div className="pg-title">Template <em>Library</em></div>
        <div className="pg-sub">Choose a template, customise your parameters, and deploy in minutes — no Solidity required.</div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }} className="db-enter db-enter-2">
        {CATEGORY_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="pg-btn"
            style={{
              background: filter === f ? 'var(--primary)' : 'var(--surface-high)',
              color: filter === f ? 'var(--surface)' : 'var(--on-surface-variant)',
              border: filter === f ? 'none' : '1px solid var(--outline)',
              boxShadow: filter === f ? '0 4px 16px rgba(93,169,233,.25)' : 'none',
              fontWeight: 700, fontSize: 13,
            }}>
            {f}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--on-surface-variant)', alignSelf: 'center' }}>
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Template Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {filtered.map((t, i) => {
          const cx = COMPLEXITY_COLOR[t.complexity];
          return (
            <div key={t.id}
              className={`pg-card db-enter db-enter-${(i % 4) + 2}`}
              style={{
                cursor: 'pointer',
                borderTop: `2px solid ${t.color}`,
                padding: '22px 24px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
              onClick={() => openModal(t)}
            >
              {/* Icon + Title Row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                    background: t.accent, border: `1px solid ${t.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>{t.icon}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--on-surface)', fontFamily: 'var(--db-font)', marginBottom: 6 }}>
                      {t.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="pg-badge" style={{ background: t.accent, color: t.color, border: `1px solid ${t.border}` }}>
                        {t.category}
                      </span>
                      <span className="pg-badge" style={{ background: cx.bg, color: cx.color, border: `1px solid ${cx.border}` }}>
                        {t.complexity}
                      </span>
                      <span style={{ fontFamily: 'var(--db-mono)', fontSize: 11, color: 'var(--on-surface-variant)' }}>
                        ⛽ {t.gasEstimate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 14 }}>
                {t.description}
              </p>

              {/* Beginner note */}
              <div style={{
                padding: '9px 12px', borderRadius: 10,
                background: t.accent, border: `1px solid ${t.border}`,
                fontSize: 12, color: t.color, fontWeight: 600, marginBottom: 14,
                lineHeight: 1.5,
              }}>
                💡 {t.beginner_note}
              </div>

              {/* Feature tags */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                {t.features.map(f => (
                  <span key={f} className="pg-badge"
                    style={{ background: 'var(--surface-highest)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline)' }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={(e) => { e.stopPropagation(); openModal(t); }}
                className="pg-btn"
                style={{
                  width: '100%', justifyContent: 'center',
                  background: t.color, color: 'var(--surface)',
                  fontWeight: 700, boxShadow: `0 4px 16px ${t.accent}`,
                }}>
                Use Template →
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="pg-card db-enter db-enter-6" style={{ textAlign: 'center', marginTop: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
          All templates use <span style={{ color: 'var(--on-surface)', fontWeight: 700 }}>OpenZeppelin</span> audited contracts
          and deploy to your selected testnet.
        </p>
      </div>

      {/* Customise Modal */}
      {modalTemplate && (
        <CustomiseModal
          template={modalTemplate}
          onClose={closeModal}
          onLaunch={handleLaunch}
        />
      )}
    </div>
  );
}

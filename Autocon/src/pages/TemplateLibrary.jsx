import { useNavigate } from 'react-router-dom';
import '../components/dashboard/styles/dashboard.css';

const TEMPLATES = [
  {
    id: 'token',
    name: 'ERC-20 Token',
    icon: '🪙',
    color: 'var(--db-acc)',
    accent: 'rgba(34,197,94,.14)',
    border: 'rgba(34,197,94,.25)',
    description: 'Create a custom cryptocurrency token with minting, burning, and ownership controls.',
    features: ['Custom Name & Symbol', 'Initial Supply', 'Owner Minting', 'ERC20Burnable', 'Ownable'],
    standard: 'ERC-20',
    complexity: 'Beginner',
    gasEstimate: '~0.003 ETH',
    route: '/tokens',
  },
  {
    id: 'nft',
    name: 'NFT Collection',
    icon: '🎨',
    color: '#a78bfa',
    accent: 'rgba(167,139,250,.12)',
    border: 'rgba(167,139,250,.25)',
    description: 'Launch an NFT collection with individual token metadata, mint pricing, and max supply caps.',
    features: ['Max Supply Cap', 'Mint Pricing', 'URI Storage', 'Burn Support', 'Withdraw Funds'],
    standard: 'ERC-721',
    complexity: 'Intermediate',
    gasEstimate: '~0.005 ETH',
    route: '/nfts',
  },
  {
    id: 'auction',
    name: 'English Auction',
    icon: '🔨',
    color: 'var(--db-amber)',
    accent: 'rgba(245,158,11,.12)',
    border: 'rgba(245,158,11,.25)',
    description: 'Deploy a decentralized English Auction with timed bidding, auto-refunds, and minimum bids.',
    features: ['Timed Bidding', 'Min Bid Enforced', 'Auto-Refund', 'Time Extension', 'Beneficiary Payout'],
    standard: 'Custom',
    complexity: 'Advanced',
    gasEstimate: '~0.004 ETH',
    route: '/auctions',
  },
];

const COMPLEXITY_COLOR = {
  Beginner:     'var(--db-acc)',
  Intermediate: '#a78bfa',
  Advanced:     'var(--db-amber)',
};

export default function TemplateLibrary() {
  const navigate = useNavigate();

  return (
    <div className="pg-wrap">

      {/* Header */}
      <div className="pg-head db-enter db-enter-1">
        <div className="pg-title">Template <em>Library</em></div>
        <div className="pg-sub">Choose a smart contract template and deploy in minutes — no Solidity required.</div>
      </div>

      {/* Template Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {TEMPLATES.map((t, i) => (
          <div key={t.id}
            className={`pg-card db-enter db-enter-${i + 2}`}
            style={{ cursor: 'pointer', borderTop: `2px solid ${t.color}`, padding: '24px 26px' }}
            onClick={() => navigate(t.route)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              {/* Left: icon + title + tags */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                  background: t.accent, border: `.5px solid ${t.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--db-t1)',
                    fontFamily: 'var(--db-font)', marginBottom: 6 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="pg-badge" style={{ background: t.accent, color: t.color,
                      border: `.5px solid ${t.border}` }}>{t.standard}</span>
                    <span className="pg-badge" style={{ background: 'var(--db-s2)', color: 'var(--db-t3)',
                      border: '.5px solid var(--db-br)' }}>{t.complexity}</span>
                    <span style={{ fontFamily: 'var(--db-mono)', fontSize: 11, color: 'var(--db-t3)' }}>
                      ⛽ {t.gasEstimate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={(e) => { e.stopPropagation(); navigate(t.route); }}
                className="pg-btn"
                style={{ background: t.accent, color: t.color, border: `.5px solid ${t.border}`,
                  whiteSpace: 'nowrap', fontWeight: 600 }}>
                Launch →
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--db-t2)', lineHeight: 1.6,
              margin: '14px 0 12px', paddingLeft: 66 }}>
              {t.description}
            </p>

            {/* Feature tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 66 }}>
              {t.features.map(f => (
                <span key={f} className="pg-badge" style={{ background: t.accent, color: t.color, border: `.5px solid ${t.border}` }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="pg-card db-enter db-enter-5" style={{ textAlign: 'center', marginTop: 8 }}>
        <p style={{ fontSize: 13, color: 'var(--db-t3)' }}>
          All templates use <span style={{ color: 'var(--db-t1)', fontWeight: 600 }}>OpenZeppelin</span> audited contracts
          and deploy to the <span style={{ color: 'var(--db-acc)', fontWeight: 600 }}>Sepolia Testnet</span>.
        </p>
      </div>
    </div>
  );
}

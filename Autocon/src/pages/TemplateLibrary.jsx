import { Toaster } from 'react-hot-toast';

export default function TemplateLibrary({ setActiveTab }) {
    const templates = [
        {
            id: 'token',
            name: 'ERC-20 Token',
            icon: '🪙',
            gradient: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            color: '#06b6d4',
            borderColor: 'rgba(6,182,212,0.2)',
            bgColor: 'rgba(6,182,212,0.06)',
            description: 'Create a custom cryptocurrency token with minting, burning, and ownership controls.',
            features: ['Custom Name & Symbol', 'Initial Supply', 'Owner Minting', 'ERC20Burnable', 'Ownable'],
            standard: 'ERC-20',
            complexity: 'Beginner',
            gasEstimate: '~0.003 ETH',
        },
        {
            id: 'nft',
            name: 'NFT Collection',
            icon: '🎨',
            gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: '#a78bfa',
            borderColor: 'rgba(139,92,246,0.2)',
            bgColor: 'rgba(139,92,246,0.06)',
            description: 'Launch an NFT collection with individual token metadata, mint pricing, and max supply caps.',
            features: ['Max Supply Cap', 'Mint Pricing', 'URI Storage', 'Burn Support', 'Withdraw Funds'],
            standard: 'ERC-721',
            complexity: 'Intermediate',
            gasEstimate: '~0.005 ETH',
        },
        {
            id: 'auction',
            name: 'English Auction',
            icon: '🔨',
            gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: '#f59e0b',
            borderColor: 'rgba(245,158,11,0.2)',
            bgColor: 'rgba(245,158,11,0.06)',
            description: 'Deploy a decentralized English Auction with timed bidding, auto-refunds, and minimum bids.',
            features: ['Timed Bidding', 'Min Bid Enforced', 'Auto-Refund', 'Time Extension', 'Beneficiary Payout'],
            standard: 'Custom',
            complexity: 'Advanced',
            gasEstimate: '~0.004 ETH',
        },
    ];

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '36px' }}>
                <h1 style={{
                    fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                    color: 'var(--on-surface)', marginBottom: '8px'
                }}>
                    Template <span className="gradient-text">Library</span>
                </h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                    Choose a smart contract template and deploy in minutes — no Solidity required.
                </p>
            </div>

            {/* Template Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {templates.map((t, i) => (
                    <div key={t.id}
                        className={`card glass-strong animate-fade-in-up delay-${(i + 1) * 100}`}
                        style={{
                            padding: '0',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderTop: `2px solid ${t.color}`,
                            boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 20px ${t.color}15`
                        }}
                        onClick={() => setActiveTab(t.id)}
                    >
                        <div style={{ display: 'flex', alignItems: 'stretch' }}>
                            {/* Left Color Indicator removed in favor of top border */}

                            {/* Content */}
                            <div style={{ flex: 1, padding: '28px 32px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '52px', height: '52px',
                                            background: t.gradient,
                                            borderRadius: '16px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '26px',
                                            boxShadow: `0 4px 20px ${t.color}30`
                                        }}>{t.icon}</div>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '2px' }}>
                                                {t.name}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '50px',
                                                    fontSize: '0.6rem', fontWeight: 700,
                                                    background: t.bgColor, color: t.color,
                                                    border: `1px solid ${t.borderColor}`
                                                }}>{t.standard}</span>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '50px',
                                                    fontSize: '0.6rem', fontWeight: 700,
                                                    background: 'var(--surface-highest)', color: 'var(--outline)',
                                                    border: '1px solid var(--outline-variant)'
                                                }}>{t.complexity}</span>
                                                <span style={{
                                                    fontSize: '0.7rem', color: 'var(--outline)'
                                                }}>⛽ {t.gasEstimate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Launch Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveTab(t.id); }}
                                        style={{
                                            padding: '10px 24px', borderRadius: '12px', border: 'none',
                                            background: t.gradient, color: 'white',
                                            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                            fontFamily: 'Inter, sans-serif',
                                            boxShadow: `0 4px 20px ${t.color}25`,
                                            transition: 'all 0.2s ease',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Launch →
                                    </button>
                                </div>

                                <p style={{
                                    fontSize: '0.88rem', color: 'var(--on-surface-variant)',
                                    lineHeight: 1.6, marginBottom: '16px'
                                }}>{t.description}</p>

                                {/* Feature Tags */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {t.features.map(f => (
                                        <span key={f} style={{
                                            padding: '4px 10px', borderRadius: '50px',
                                            fontSize: '0.65rem', fontWeight: 600,
                                            background: t.bgColor,
                                            color: t.color,
                                            border: `1px solid ${t.borderColor}`
                                        }}>{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom CTA */}
            <div className="card animate-fade-in-up delay-400" style={{
                padding: '24px', marginTop: '24px', textAlign: 'center'
            }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>
                    All templates use <strong style={{ color: 'var(--on-surface)' }}>OpenZeppelin</strong> audited contracts
                    and deploy to the <strong style={{ color: 'var(--on-surface)' }}>Sepolia Testnet</strong>.
                </p>
            </div>
        </div>
    );
}

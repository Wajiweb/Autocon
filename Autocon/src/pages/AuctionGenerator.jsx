import { useAuction } from '../hooks/useAuction';
import { Toaster } from 'react-hot-toast';
import CodeExportTools from '../components/CodeExportTools';

export default function AuctionGenerator() {
    const {
        formData, setFormData, generatedCode,
        connectWallet, generateAuction, deployAuction,
        estimateGas, gasEstimate, isEstimating, isDeploying
    } = useAuction();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Convert raw seconds to a human-readable label
    const durationLabel = (secs) => {
        const s = parseInt(secs) || 0;
        if (s < 60) return `${s} seconds`;
        if (s < 3600) return `${Math.round(s / 60)} minutes`;
        if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
        return `${(s / 86400).toFixed(1)} days`;
    };

    const durationPresets = [
        { label: '1 hour', value: '3600' },
        { label: '6 hours', value: '21600' },
        { label: '24 hours', value: '86400' },
        { label: '3 days', value: '259200' },
        { label: '7 days', value: '604800' },
    ];

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', boxShadow: '0 4px 20px rgba(245,158,11,0.3)'
                    }}>🔨</div>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                        color: 'var(--text-primary)'
                    }}>
                        Auction <span style={{
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Generator</span>
                    </h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Create and deploy decentralized English Auctions — no Solidity required.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {['Timed Bidding', 'Auto-Refund', 'Min Bid Enforced', 'Extend Time', 'Withdraw Funds'].map(f => (
                        <span key={f} style={{
                            padding: '5px 12px', borderRadius: '50px',
                            fontSize: '0.68rem', fontWeight: 700,
                            background: 'rgba(245,158,11,0.08)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245,158,11,0.15)'
                        }}>{f}</span>
                    ))}
                </div>
            </div>

            {/* Form */}
            <div className="card glass animate-fade-in-up delay-100" style={{ padding: '36px' }}>
                <form onSubmit={generateAuction}>
                    {/* Auction Name */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--text-secondary)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Auction Contract Name</label>
                        <input name="name" placeholder="e.g. MyAuction" className="input" onChange={handleChange} required />
                    </div>

                    {/* Item Name + Description */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                                color: 'var(--text-secondary)', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '10px'
                            }}>Item Name</label>
                            <input name="itemName" placeholder="e.g. Rare Digital Art #001" className="input" onChange={handleChange} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                                color: 'var(--text-secondary)', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '10px'
                            }}>Item Description</label>
                            <input name="itemDescription" placeholder="A brief description of the item..." className="input" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Duration Presets + Custom */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--text-secondary)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            Auction Duration
                            <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                ({durationLabel(formData.duration)})
                            </span>
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {durationPresets.map(p => (
                                <button key={p.value} type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, duration: p.value }))}
                                    style={{
                                        padding: '8px 16px', borderRadius: '10px',
                                        border: formData.duration === p.value
                                            ? '2px solid #f59e0b'
                                            : '1px solid var(--border-color)',
                                        background: formData.duration === p.value
                                            ? 'rgba(245,158,11,0.1)'
                                            : 'var(--bg-input)',
                                        color: formData.duration === p.value ? '#f59e0b' : 'var(--text-secondary)',
                                        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        transition: 'all 0.2s ease'
                                    }}
                                >{p.label}</button>
                            ))}
                        </div>
                        <input
                            name="duration" type="number" placeholder="Custom seconds"
                            className="input" onChange={handleChange} value={formData.duration}
                            style={{ fontSize: '0.85rem' }}
                        />
                    </div>

                    {/* Minimum Bid */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--text-secondary)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Minimum Bid (ETH)</label>
                        <input
                            name="minimumBid" type="number" step="0.001"
                            placeholder="0.01" className="input"
                            onChange={handleChange} value={formData.minimumBid}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            The smallest bid that will be accepted by the contract.
                        </p>
                    </div>

                    {/* Owner Address */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--text-secondary)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Owner / Beneficiary</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input name="ownerAddress" value={formData.ownerAddress} className="input"
                                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} readOnly
                                placeholder="Connect your wallet →" />
                            <button type="button" onClick={connectWallet} style={{
                                padding: '14px 24px', borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(135deg, #f6851b, #e2761b)',
                                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                boxShadow: '0 4px 20px rgba(246,133,27,0.3)'
                            }}>🦊 Connect</button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{
                        width: '100%', padding: '16px',
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)'
                    }}>
                        🔨 Generate Auction Contract
                    </button>
                </form>
            </div>

            {/* Gas Estimation */}
            {generatedCode && (
                <div className="card animate-fade-in-up" style={{ padding: '28px', marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: gasEstimate ? '20px' : 0 }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>⛽ Gas Estimation</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimate deployment cost before spending ETH</p>
                        </div>
                        <button onClick={estimateGas} disabled={isEstimating} className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isEstimating ? (
                                <><svg style={{ animation: 'spin-slow 1s linear infinite', width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>Estimating...</>
                            ) : 'Estimate Gas'}
                        </button>
                    </div>
                    {gasEstimate && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Gas Units', val: parseInt(gasEstimate.gasUnits).toLocaleString(), color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
                                { label: 'Gas Price', val: `${gasEstimate.gasPriceGwei} Gwei`, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
                                { label: 'Est. Cost', val: `${gasEstimate.estimatedCostETH} ETH`, color: 'var(--success)', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                            ].map(g => (
                                <div key={g.label} style={{ padding: '16px', borderRadius: '14px', background: g.bg, border: `1px solid ${g.border}` }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>{g.label}</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: g.color }}>{g.val}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Deploy Button */}
            {generatedCode && (
                <div className="animate-fade-in-up" style={{ marginTop: '20px' }}>
                    <button onClick={deployAuction} disabled={!generatedCode || isDeploying}
                        className="btn-primary"
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.05rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            background: isDeploying ? 'var(--bg-input)' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            color: isDeploying ? 'var(--text-muted)' : 'white',
                            cursor: isDeploying ? 'not-allowed' : 'pointer'
                        }}>
                        {isDeploying ? (
                            <><svg style={{ animation: 'spin-slow 1s linear infinite', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>DEPLOYING AUCTION...</>
                        ) : '🚀 Deploy Auction to Sepolia'}
                    </button>
                </div>
            )}

            {/* Generated Code */}
            {generatedCode && (
                <div className="animate-fade-in-up" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>📄 Generated Auction Contract</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CodeExportTools code={generatedCode} contractName={formData.name || 'Auction'} />
                            <span style={{
                                padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
                                background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)'
                            }}>Compiled ✓</span>
                        </div>
                    </div>
                    <div className="code-block">
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}><code>{generatedCode}</code></pre>
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="card animate-fade-in-up delay-200" style={{ padding: '24px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
                    📘 How English Auctions Work
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {[
                        { icon: '⏳', title: 'Timed Bidding', desc: 'Auction runs for a set duration, highest bid wins' },
                        { icon: '💰', title: 'Minimum Bid', desc: 'Enforces a floor price — no lowball bids accepted' },
                        { icon: '🔄', title: 'Auto-Refund', desc: 'Previous bidders can withdraw outbid funds safely' },
                        { icon: '🏆', title: 'Winner Takes All', desc: 'Highest bid sent to beneficiary when auction ends' },
                        { icon: '⏰', title: 'Time Extension', desc: 'Owner can extend the auction if needed' },
                        { icon: '📊', title: 'Live Info', desc: 'Get auction status, bids, and time left on-chain' },
                    ].map(item => (
                        <div key={item.title} style={{
                            padding: '14px', borderRadius: '12px',
                            background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                            display: 'flex', gap: '10px', alignItems: 'flex-start'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                            <div>
                                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{item.title}</p>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

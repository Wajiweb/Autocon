import { useAuction } from '../hooks/useAuction';
import { useNetwork } from '../context/NetworkContext';

import ExportCenter from '../components/dashboard/ExportCenter';
import DeveloperToggle from '../components/dashboard/DeveloperToggle';
import CodeViewer from '../components/dashboard/CodeViewer';
import SecurityScanner from '../components/dashboard/SecurityScanner';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import DeploymentStatusBar from '../components/deploy/DeploymentStatusBar';
import DeploymentTimeline from '../components/deploy/DeploymentTimeline';
import { useState } from 'react';
import { useAISuggestion } from '../hooks/useAISuggestion';
import AIChatPanel from '../components/dashboard/AIChatPanel';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';

export default function AuctionGenerator() {
    const {
        formData, setFormData, generatedCode, contractData,
        connectWallet, generateAuction, deployAuction,
        estimateGas, gasEstimate, isEstimating,
        showSuccessModal, setShowSuccessModal,
        deploymentReceipt, providerInstance
    } = useAuction();
    const isDeploying = useTransactionStore(selectIsDeploying);
    const deployStep = useTransactionStore(s => s.step);
    const errorStep = useTransactionStore(s => s.errorStep);
    const errorMessage = useTransactionStore(s => s.errorMessage);
    const deployedAddress = useTransactionStore(s => s.contractAddress);
    const { network } = useNetwork();
    const { isSuggesting, generateSuggestions } = useAISuggestion();
    const [auditStatus, setAuditStatus] = useState({ canDeploy: false, isAuditing: false });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [aiIntent, setAiIntent] = useState('');

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
        <div className="container" style={{ paddingTop: '12px' }}>


            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '44px', height: '44px',
                            background: 'var(--primary-gradient)',
                            borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '22px', boxShadow: 'var(--shadow-ambient)'
                        }}>🔨</div>
                        <h1 style={{
                            fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                            color: 'var(--on-surface)'
                        }}>
                            Auction <span className="gradient-text">Generator</span>
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            placeholder="Describe your auction..." 
                            value={aiIntent} 
                            onChange={(e) => setAiIntent(e.target.value)}
                            className="pg-input" 
                            style={{ width: '200px', fontSize: '13px', padding: '8px 12px' }}
                            onKeyDown={(e) => { if(e.key === 'Enter') generateSuggestions('Auction', setFormData, aiIntent) }}
                        />
                        <button 
                            onClick={() => generateSuggestions('Auction', setFormData, aiIntent)}
                            disabled={isSuggesting}
                            className="pg-btn" 
                            style={{ background: 'var(--db-s2)', border: '1px solid var(--db-br)', color: 'var(--db-acc)', fontSize: 13, padding: '8px 16px', borderRadius: '50px', cursor: isSuggesting ? 'wait' : 'pointer' }}
                        >
                            {isSuggesting ? '⏳...' : '✨ Auto-Fill'}
                        </button>
                        <button 
                            onClick={() => setIsChatOpen(true)}
                            className="pg-btn" 
                            style={{ background: 'var(--db-acc)', border: 'none', color: '#000', fontSize: 13, padding: '8px 16px', borderRadius: '50px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            💬 AI Chat
                        </button>
                    </div>
                </div>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                    Create and deploy decentralized English Auctions — no Solidity required.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {['Timed Bidding', 'Auto-Refund', 'Min Bid Enforced', 'Extend Time', 'Withdraw Funds'].map(f => (
                        <span key={f} style={{
                            padding: '5px 12px', borderRadius: '50px',
                            fontSize: '0.68rem', fontWeight: 700,
                            background: 'var(--accent-glow)',
                            color: 'var(--primary)',
                            border: '1px solid var(--border-color)'
                        }}>{f}</span>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Form */}
                <div className="card glass animate-fade-in-up delay-100" style={{ padding: '36px' }}>
                    <form onSubmit={generateAuction}>
                    {/* Auction Name */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Auction Contract Name</label>
                        <input name="name" placeholder="e.g. MyAuction" className="input" onChange={handleChange} required />
                    </div>

                    {/* Item Name + Description */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                                color: 'var(--outline)', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '10px'
                            }}>Item Name</label>
                            <input name="itemName" value={formData?.itemName || ''} placeholder="e.g. Rare Digital Art #001" className="input" onChange={handleChange} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                                color: 'var(--outline)', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '10px'
                            }}>Item Description</label>
                            <input name="itemDescription" value={formData?.itemDescription || ''} placeholder="A brief description of the item..." className="input" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Duration Presets + Custom */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            Auction Duration
                            <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--outline)', marginLeft: '6px' }}>
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
                                            : '1px solid var(--outline-variant)',
                                        background: formData.duration === p.value
                                            ? 'rgba(245,158,11,0.1)'
                                            : 'var(--surface-highest)',
                                        color: formData.duration === p.value ? '#f59e0b' : 'var(--outline)',
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
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Minimum Bid (ETH)</label>
                        <input
                            name="minimumBid" type="number" step="0.001"
                            placeholder="0.01" className="input"
                            onChange={handleChange} value={formData.minimumBid}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--outline)', marginTop: '6px' }}>
                            The smallest bid that will be accepted by the contract.
                        </p>
                        {Number(formData?.duration) > 2592000 && (
                            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px' }}>⚠️ A duration over 30 days may reduce bidder urgency.</div>
                        )}
                    </div>

                    {/* Owner Address */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Owner / Beneficiary</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input name="ownerAddress" value={formData.ownerAddress} className="input"
                                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} readOnly
                                placeholder="Connect your wallet →" />
                            <button type="button" onClick={connectWallet} style={{
                                padding: '14px 24px', borderRadius: '14px', border: 'none',
                                background: 'var(--primary-gradient)',
                                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                boxShadow: 'var(--shadow-primary)'
                            }}>🦊 Connect</button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{
                        width: '100%', padding: '16px',
                        background: 'var(--primary-gradient)'
                    }}>
                        🔨 Generate Auction Contract
                    </button>
                </form>
            </div>

            {/* Right Column: Info, Gas, Deploy, Code */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Info Card - Always visible */}
                <div className="card animate-fade-in-up delay-200" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '14px' }}>
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
                                background: 'var(--surface-highest)', border: '1px solid var(--outline-variant)',
                                display: 'flex', gap: '10px', alignItems: 'flex-start'
                            }}>
                                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                                <div>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '2px' }}>{item.title}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--outline)', lineHeight: 1.4 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gas Estimation */}
                {generatedCode && (
                    <div className="card animate-fade-in-up" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: gasEstimate ? '20px' : 0 }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '4px' }}>⛽ Gas Estimation</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>Estimate deployment cost before spending ETH</p>
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
                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '6px' }}>{g.label}</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: g.color }}>{g.val}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Security Scanner */}
            {generatedCode && (
                <div className="animate-fade-in-up" style={{ marginBottom: '16px' }}>
                    <SecurityScanner 
                        contractCode={generatedCode} 
                        onAuditResult={(status) => setAuditStatus(status)} 
                    />
                </div>
            )}

            {/* Deploy Button */}
            {generatedCode && (
                <div className="animate-fade-in-up">
                    <div style={{ marginBottom: 16 }}><DeploymentStatusBar /></div>
                    {isDeploying && deployStep >= 0 ? (
                        <div className="card glass" style={{ padding: '28px', marginBottom: '16px' }}>
                            <DeploymentTimeline currentStep={deployStep} errorStep={errorStep} errorMessage={errorMessage} />
                        </div>
                    ) : (
                        <button onClick={deployAuction} disabled={!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing}
                            className="btn-primary"
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.05rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                background: (isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? 'var(--surface-highest)' : 'var(--primary-gradient)',
                                color: (isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? 'var(--outline)' : 'white',
                                cursor: (isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? 'not-allowed' : 'pointer'
                            }}>
                            {auditStatus.isAuditing ? '⏳ Auditing Contract...' : `🚀 Deploy Auction to ${network.name}`}
                        </button>
                    )}
                </div>
            )}

            {/* Generated Code */}
            {generatedCode && (
                <div className="animate-fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>📄 Generated Auction Contract</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DeveloperToggle />
                            <ExportCenter contractName={formData.name || 'Auction'} abi={contractData?.abi} />
                            <span style={{
                                padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
                                background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)'
                            }}>Compiled ✓</span>
                        </div>
                    </div>
                    <div className="code-block" style={{ padding: 0 }}>
                        <CodeViewer />
                    </div>
                </div>
            )}

            </div>
          </div>
        
        {/* Deploy Success Modal */}
        <DeploySuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            address={deployedAddress || ''}
            network={network.name}
            contractType="Auction"
            explorerUrl={network.explorer || 'https://sepolia.etherscan.io'}
            abi={contractData?.abi}
            contractName={formData.name || 'Auction'}
            receipt={deploymentReceipt}
            provider={providerInstance}
        />
        
        <AIChatPanel 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            contractCode={generatedCode} 
        />
        </div>
    );
}

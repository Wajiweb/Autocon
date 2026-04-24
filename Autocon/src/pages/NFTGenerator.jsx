import { useState } from 'react';
import { useNFT } from '../hooks/useNFT';
import toast from 'react-hot-toast';
import { useNetwork } from '../context/NetworkContext';
import { API_BASE } from '../config';
import ExportCenter from '../components/dashboard/ExportCenter';
import CodeViewer from '../components/dashboard/CodeViewer';
import SecurityScanner from '../components/dashboard/SecurityScanner';
import DeploymentTimeline from '../components/deploy/DeploymentTimeline';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import DeploymentStatusBar from '../components/deploy/DeploymentStatusBar';
import { useAISuggestion } from '../hooks/useAISuggestion';
import AIChatPanel from '../components/dashboard/AIChatPanel';
import DeveloperToggle from '../components/dashboard/DeveloperToggle';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';

export default function NFTGenerator() {
    const {
        formData, setFormData, generatedCode,
        connectWallet, generateNFT, deployNFT,
        estimateGas, gasEstimate, isEstimating,
        showSuccessModal, setShowSuccessModal,
        contractData, deploymentReceipt, providerInstance
    } = useNFT();
    const isDeploying = useTransactionStore(selectIsDeploying);
    const deployStep = useTransactionStore(s => s.step);
    const errorStep = useTransactionStore(s => s.errorStep);
    const errorMessage = useTransactionStore(s => s.errorMessage);
    const deployedAddress = useTransactionStore(s => s.contractAddress);
    const { network } = useNetwork();
    const { isSuggesting, generateSuggestions } = useAISuggestion();
    const [auditStatus, setAuditStatus] = useState({ canDeploy: false, isAuditing: false });
    const [metadataState, setMetadataState] = useState({
        status: 'idle', // idle, uploading, generating, ready, updating, error
        fileCID: '',
        imageUrl: '',
        name: '',
        description: '',
        error: ''
    });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [aiIntent, setAiIntent] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMetadataState(prev => ({ ...prev, status: 'uploading', error: '' }));
        const uploadToast = toast.loading('Uploading image to IPFS...');

        try {
            const formDataObj = new FormData();
            formDataObj.append('file', file);

            const token = localStorage.getItem('autocon_token');
            const res = await fetch(`${API_BASE}/api/ipfs/upload-file`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataObj
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.error);

            toast.loading('Auto-generating metadata...', { id: uploadToast });
            setMetadataState(prev => ({ ...prev, status: 'generating', fileCID: data.fileCID, imageUrl: data.fileUrl }));

            const defaultName = formData.name || 'AutoCon NFT';
            const defaultDesc = `NFT Collection for ${defaultName}`;

            const metaRes = await fetch(`${API_BASE}/api/ipfs/upload-metadata`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    metadata: {
                        name: defaultName,
                        description: defaultDesc,
                        image: data.fileUrl
                    }
                })
            });
            const metaData = await metaRes.json();
            
            if (!metaData.success) throw new Error(metaData.error);

            setMetadataState(prev => ({ 
                ...prev, 
                status: 'ready', 
                name: defaultName,
                description: defaultDesc
            }));
            
            setFormData(prev => ({ ...prev, baseURI: metaData.tokenURI }));
            toast.success('Metadata pinned to IPFS! 📌', { id: uploadToast });

        } catch (err) {
            console.error('Upload error:', err);
            setMetadataState(prev => ({ ...prev, status: 'error', error: err.message || 'Upload failed.' }));
            toast.error(err.message || 'Upload failed.', { id: uploadToast });
        }
    };

    const handleUpdateMetadata = async () => {
        setMetadataState(prev => ({ ...prev, status: 'updating', error: '' }));
        const updateToast = toast.loading('Updating metadata...');
        try {
            const token = localStorage.getItem('autocon_token');
            const metaRes = await fetch(`${API_BASE}/api/ipfs/upload-metadata`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    metadata: {
                        name: metadataState.name,
                        description: metadataState.description,
                        image: metadataState.imageUrl
                    }
                })
            });
            const metaData = await metaRes.json();
            
            if (!metaData.success) throw new Error(metaData.error);

            setMetadataState(prev => ({ ...prev, status: 'ready' }));
            setFormData(prev => ({ ...prev, baseURI: metaData.tokenURI }));
            toast.success('Metadata updated successfully! ✨', { id: updateToast });
        } catch (err) {
            setMetadataState(prev => ({ ...prev, status: 'error', error: err.message || 'Update failed.' }));
            toast.error(err.message || 'Update failed.', { id: updateToast });
        }
    };

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
                        }}>🎨</div>
                        <h1 style={{
                            fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                            color: 'var(--on-surface)'
                        }}>
                            NFT <span className="gradient-text">Generator</span>
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            placeholder="Describe your NFT..." 
                            value={aiIntent} 
                            onChange={(e) => setAiIntent(e.target.value)}
                            className="pg-input" 
                            style={{ width: '200px', fontSize: '13px', padding: '8px 12px' }}
                            onKeyDown={(e) => { if(e.key === 'Enter') generateSuggestions('NFT', setFormData, aiIntent) }}
                        />
                        <button 
                            onClick={() => generateSuggestions('NFT', setFormData, aiIntent)}
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
                    Design and deploy custom ERC-721 NFT collections — no Solidity required.
                </p>

                {/* Feature badges */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {['Max Supply Cap', 'Mint Pricing', 'URI Storage', 'Burn Support', 'IPFS Upload', 'Owner Withdraw'].map(f => (
                        <span key={f} style={{
                            padding: '5px 12px', borderRadius: '50px',
                            fontSize: '0.68rem', fontWeight: 700,
                            background: 'rgba(139,92,246,0.08)',
                            color: '#a78bfa',
                            border: '1px solid rgba(139,92,246,0.15)'
                        }}>{f}</span>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Form */}
                <div className="card glass animate-fade-in-up delay-100" style={{ padding: '36px' }}>
                    <form onSubmit={generateNFT}>
                    {/* Collection Name */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            Collection Name
                        </label>
                        <input
                            name="name"
                            value={formData?.name || ''}
                            placeholder="e.g. AutoCon Genesis"
                            className="input"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Symbol + Max Supply */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                                color: 'var(--outline)', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '10px'
                            }}>Symbol</label>
                            <input
                                name="symbol"
                                value={formData?.symbol || ''}
                                placeholder="e.g. ACG"
                                className="input"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                                color: 'var(--outline)', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '10px'
                            }}>Max Supply</label>
                            <input
                                name="maxSupply"
                                type="number"
                                placeholder="10000"
                                className="input"
                                onChange={handleChange}
                                value={formData?.maxSupply || ''}
                                required
                            />
                            {Number(formData?.maxSupply) > 100000 && (
                                <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px' }}>⚠️ A huge supply may lower rarity and floor price.</div>
                            )}
                        </div>
                    </div>

                    {/* Mint Price */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            Mint Price ({network.currencySymbol || 'ETH'})
                        </label>
                        <input
                            name="mintPrice"
                            type="number"
                            step="0.001"
                            placeholder="0.01"
                            className="input"
                            onChange={handleChange}
                            value={formData?.mintPrice || ''}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--outline)', marginTop: '6px' }}>
                            Set to 0 for free minting. Owner can always mint for free.
                        </p>
                    </div>

                    {/* IPFS Image Upload & Metadata UX */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            NFT Asset & Metadata
                        </label>
                        
                        <div style={{
                            padding: '20px', borderRadius: '14px',
                            border: `2px dashed ${metadataState.status === 'ready' ? 'rgba(16,185,129,0.3)' : 'var(--outline-variant)'}`,
                            background: metadataState.status === 'ready' ? 'rgba(16,185,129,0.03)' : 'var(--surface-highest)',
                            transition: 'all 0.2s ease'
                        }}>
                            {metadataState.status === 'idle' || metadataState.status === 'error' ? (
                                <label style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                                    <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '6px' }}>🖼️</span>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--outline)', fontWeight: 600 }}>Click to upload image</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>JPG, PNG • Max 10MB</p>
                                    {metadataState.error && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '8px' }}>❌ {metadataState.error}</p>}
                                </label>
                            ) : metadataState.status === 'uploading' || metadataState.status === 'generating' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', textAlign: 'center' }}>
                                    <svg style={{ animation: 'spin-slow 1s linear infinite', width: 16, height: 16, color: 'var(--tertiary)' }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>
                                        {metadataState.status === 'uploading' ? 'Uploading Image to IPFS...' : 'Auto-generating Metadata...'}
                                    </span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'var(--surface)', overflow: 'hidden', border: '1px solid var(--outline-variant)', flexShrink: 0 }}>
                                            <img src={`https://gateway.pinata.cloud/ipfs/${metadataState.fileCID}`} alt="NFT Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Metadata Ready</span>
                                                <button type="button" onClick={() => { setMetadataState({ status: 'idle', fileCID: '', imageUrl: '', name: '', description: '', error: '' }); setFormData(prev => ({ ...prev, baseURI: '' })); }} style={{ fontSize: '0.7rem', color: 'var(--outline)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                                            </div>
                                            <input value={metadataState.name} onChange={e => setMetadataState(prev => ({ ...prev, name: e.target.value }))} className="input" style={{ padding: '6px 10px', fontSize: '0.8rem', marginBottom: '6px' }} placeholder="NFT Name" />
                                            <input value={metadataState.description} onChange={e => setMetadataState(prev => ({ ...prev, description: e.target.value }))} className="input" style={{ padding: '6px 10px', fontSize: '0.8rem' }} placeholder="NFT Description" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleUpdateMetadata} disabled={metadataState.status === 'updating'} className="btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        {metadataState.status === 'updating' ? 'Updating...' : '💾 Save Metadata Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Base URI */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            Base URI (Token URI)
                        </label>
                        <input
                            name="baseURI"
                            className="input"
                            value={formData?.baseURI || ''}
                            readOnly
                            style={{ background: 'var(--surface)', color: 'var(--outline)' }}
                            placeholder="Upload an image above to generate token URI"
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--outline)', marginTop: '6px' }}>
                            {metadataState.status === 'ready' ? '✅ Automatically filled from your IPFS metadata.' : '⚠️ Required for deployment. Upload an image above.'}
                        </p>
                    </div>

                    {/* Owner Address */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Owner Address</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                name="ownerAddress"
                                value={formData?.ownerAddress || ''}
                                className="input"
                                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                                readOnly
                                placeholder="Connect your wallet →"
                            />
                            <button
                                type="button"
                                onClick={connectWallet}
                                style={{
                                    padding: '14px 24px', borderRadius: '14px', border: 'none',
                                    background: 'var(--primary-gradient)',
                                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                    boxShadow: 'var(--shadow-primary)'
                                }}
                            >🦊 Connect</button>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button type="submit" className="btn-primary" style={{
                        width: '100%', padding: '16px',
                        background: 'var(--primary-gradient)'
                    }}>
                        🎨 Generate NFT Contract
                    </button>
                </form>
            </div>

            {/* Right Column: Info, Gas, Deploy, Code */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Info Card - Always visible */}
                <div className="card animate-fade-in-up delay-200" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '14px' }}>
                        📘 What Your NFT Contract Includes
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {[
                            { icon: '🖼️', title: 'ERC-721 Standard', desc: 'Full OpenZeppelin NFT implementation' },
                            { icon: '📝', title: 'URI Storage', desc: 'Individual token metadata per NFT' },
                            { icon: '🔥', title: 'Burn Support', desc: 'Token holders can burn their NFTs' },
                            { icon: '💰', title: 'Paid Minting', desc: 'Set a mint price or make it free' },
                            { icon: '📦', title: 'Max Supply', desc: 'Hard cap on total NFTs that can exist' },
                            { icon: '🏦', title: 'Withdraw Funds', desc: 'Owner can withdraw collected mint fees' },
                        ].map(item => (
                            <div key={item.title} style={{
                                padding: '14px', borderRadius: '12px',
                                background: 'var(--surface-highest)',
                                border: '1px solid var(--outline-variant)',
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
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '4px' }}>
                                ⛽ Gas Estimation
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>
                                Estimate NFT deployment cost before spending ETH
                            </p>
                        </div>
                        <button
                            onClick={estimateGas}
                            disabled={isEstimating}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isEstimating ? (
                                <>
                                    <svg style={{ animation: 'spin-slow 1s linear infinite', width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Estimating...
                                </>
                            ) : 'Estimate Gas'}
                        </button>
                    </div>

                    {gasEstimate && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={{
                                padding: '16px', borderRadius: '14px',
                                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)'
                            }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '6px' }}>Gas Units</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--tertiary)' }}>
                                    {parseInt(gasEstimate.gasUnits).toLocaleString()}
                                </p>
                            </div>
                            <div style={{
                                padding: '16px', borderRadius: '14px',
                                background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)'
                            }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '6px' }}>Gas Price</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ec4899' }}>
                                    {gasEstimate.gasPriceGwei} Gwei
                                </p>
                            </div>
                            <div style={{
                                padding: '16px', borderRadius: '14px',
                                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)'
                            }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '6px' }}>Est. Cost</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>
                                    {gasEstimate.estimatedCostETH} ETH
                                </p>
                            </div>
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
                        <button
                            onClick={deployNFT}
                            disabled={!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing}
                            className="btn-primary"
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.05rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                background: (!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing)
                                    ? 'var(--surface-highest)'
                                    : 'var(--primary-gradient)',
                                color: (!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? 'var(--outline)' : 'white',
                                cursor: (!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {auditStatus.isAuditing ? '⏳ Auditing Contract...' : `🚀 Deploy NFT to ${network.name}`}
                        </button>
                    )}
                </div>
            )}

            {/* Generated Code Preview */}
            {generatedCode && (
                <div className="animate-fade-in-up">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                            📄 Generated ERC-721 Contract
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DeveloperToggle />
                            <ExportCenter 
                                contractName={formData.name || 'NFTCollection'} 
                                abi={contractData?.abi} 
                                nftMetadata={{
                                    name: metadataState.name,
                                    description: metadataState.description,
                                    image: metadataState.fileCID ? `ipfs://${metadataState.fileCID}` : ''
                                }}
                            />
                            <span style={{
                                padding: '4px 12px', borderRadius: '50px',
                                fontSize: '0.7rem', fontWeight: 700,
                                background: 'rgba(139,92,246,0.1)',
                                color: '#a78bfa',
                                border: '1px solid rgba(139,92,246,0.2)'
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
            contractType="NFT"
            explorerUrl={network.explorer || 'https://sepolia.etherscan.io'}
            abi={contractData?.abi}
            contractName={formData.name || 'NFT'}
            receipt={deploymentReceipt}
            provider={providerInstance}
            sourceCode={generatedCode}
            compilerVersion={contractData.compilerVersion}
            constructorArgs={contractData.constructorArgs}
        />
        
        <AIChatPanel 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            contractCode={generatedCode} 
        />
        </div>
    );
}

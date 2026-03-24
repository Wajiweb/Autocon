import { useState } from 'react';
import { useNFT } from '../hooks/useNFT';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import CodeExportTools from '../components/CodeExportTools';
import DeploymentTimeline from '../components/deploy/DeploymentTimeline';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';

export default function NFTGenerator() {
    const {
        formData, setFormData, generatedCode,
        connectWallet, generateNFT, deployNFT,
        estimateGas, gasEstimate, isEstimating,
        isDeploying, deployStep,
        deployedAddress, showSuccessModal, setShowSuccessModal
    } = useNFT();
    const { authFetch } = useAuth();
    const { network } = useNetwork();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const uploadToast = toast.loading('Uploading image...');

        try {
            const formDataObj = new FormData();
            formDataObj.append('file', file);

            const token = localStorage.getItem('autocon_token');
            const res = await fetch('http://localhost:5000/api/ipfs/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataObj
            });
            const data = await res.json();

            if (data.success) {
                setUploadedFile(data.file);
                const uri = data.file.ipfsUrl || `http://localhost:5000${data.file.localUrl}`;
                setFormData(prev => ({ ...prev, baseURI: uri }));
                toast.success(data.file.ipfsHash ? 'Pinned to IPFS! 📌' : 'Image uploaded!', { id: uploadToast });
            } else {
                toast.error(data.error || 'Upload failed', { id: uploadToast });
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Upload failed.', { id: uploadToast });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '12px' }}>


            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', boxShadow: 'var(--shadow-ambient)'
                    }}>🎨</div>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                        color: 'var(--on-surface)'
                    }}>
                        NFT <span style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Generator</span>
                    </h1>
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
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '32px', alignItems: 'start'
            }}>
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
                            placeholder="e.g. AutoCon Genesis"
                            className="input"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Symbol + Max Supply */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                                color: 'var(--outline)', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '10px'
                            }}>Symbol</label>
                            <input
                                name="symbol"
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
                        </div>
                    </div>

                    {/* Mint Price */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            Mint Price (ETH)
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

                    {/* IPFS Image Upload */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>
                            Upload NFT Image (Optional)
                        </label>
                        <div style={{
                            padding: '20px', borderRadius: '14px',
                            border: `2px dashed ${uploadedFile ? 'rgba(16,185,129,0.3)' : 'var(--outline-variant)'}`,
                            background: uploadedFile ? 'rgba(16,185,129,0.03)' : 'var(--surface-highest)',
                            textAlign: 'center', cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}>
                            {uploadedFile ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
                                            {uploadedFile.ipfsHash ? `IPFS: ${uploadedFile.ipfsHash.substring(0, 12)}...` : 'Uploaded locally'}
                                        </p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>
                                            {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.mimetype}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => { setUploadedFile(null); setFormData(prev => ({ ...prev, baseURI: '' })); }}
                                        style={{
                                            padding: '4px 12px', borderRadius: '8px',
                                            border: '1px solid var(--outline-variant)',
                                            background: 'transparent', color: 'var(--outline)',
                                            fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                                            fontFamily: 'Inter, sans-serif', marginLeft: 'auto'
                                        }}>Remove</button>
                                </div>
                            ) : (
                                <label style={{ cursor: 'pointer', display: 'block' }}>
                                    <input type="file" accept="image/*" onChange={handleFileUpload}
                                        style={{ display: 'none' }} disabled={isUploading} />
                                    {isUploading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                            <svg style={{ animation: 'spin-slow 1s linear infinite', width: 16, height: 16, color: 'var(--tertiary)' }} viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '6px' }}>📁</span>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--outline)', fontWeight: 600 }}>
                                                Click to upload image
                                            </p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>
                                                JPG, PNG, GIF, WebP • Max 10MB
                                            </p>
                                        </>
                                    )}
                                </label>
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
                            Base URI (Metadata)
                        </label>
                        <input
                            name="baseURI"
                            placeholder="ipfs://Qm... or https://..."
                            className="input"
                            onChange={handleChange}
                            value={formData?.baseURI || ''}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--outline)', marginTop: '6px' }}>
                            {uploadedFile ? '✅ Auto-filled from upload. Edit manually if needed.' : 'IPFS or HTTP URL for your NFT metadata JSON.'}
                        </p>
                    </div>

                    {/* Owner Address */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--outline)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Owner Address</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
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
                                    background: 'linear-gradient(135deg, #f6851b, #e2761b)',
                                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 20px rgba(246,133,27,0.3)'
                                }}
                            >🦊 Connect</button>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button type="submit" className="btn-primary" style={{
                        width: '100%', padding: '16px',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
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

            {/* Deploy Button */}
            {generatedCode && (
                <div className="animate-fade-in-up">
                    {isDeploying && deployStep >= 0 ? (
                        <div className="card glass" style={{ padding: '28px', marginBottom: '16px' }}>
                            <DeploymentTimeline currentStep={deployStep} />
                        </div>
                    ) : (
                        <button
                            onClick={deployNFT}
                            disabled={!generatedCode || isDeploying}
                            className="btn-primary"
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.05rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                background: (!generatedCode || isDeploying)
                                    ? 'var(--surface-highest)'
                                    : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                color: (!generatedCode || isDeploying) ? 'var(--outline)' : 'white',
                                cursor: (!generatedCode || isDeploying) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            🚀 Deploy NFT to {network.name}
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
                            <CodeExportTools code={generatedCode} contractName={formData.name || 'NFTCollection'} />
                            <span style={{
                                padding: '4px 12px', borderRadius: '50px',
                                fontSize: '0.7rem', fontWeight: 700,
                                background: 'rgba(139,92,246,0.1)',
                                color: '#a78bfa',
                                border: '1px solid rgba(139,92,246,0.2)'
                            }}>Compiled ✓</span>
                        </div>
                    </div>
                    <div className="code-block">
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            <code>{generatedCode}</code>
                        </pre>
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
            explorerUrl={network.explorerUrl || 'https://sepolia.etherscan.io'}
        />
        </div>
    );
}

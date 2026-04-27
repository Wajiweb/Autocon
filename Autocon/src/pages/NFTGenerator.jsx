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
import { useContractStore } from '../store/useContractStore';
import IPFSUploader from '../components/ui/IPFSUploader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function NFTGenerator() {
    const {
        formData, setFormData, generatedCode,
        connectWallet, generateNFT, deployNFT,
        estimateGas, gasEstimate, isEstimating,
        showSuccessModal, setShowSuccessModal
    } = useNFT();
    const contractData = useContractStore(s => s.contractData);
    const isDeploying = useTransactionStore(selectIsDeploying);
    const deployStep = useTransactionStore(s => s.step);
    const errorStep = useTransactionStore(s => s.errorStep);
    const errorMessage = useTransactionStore(s => s.errorMessage);
    const deployedAddress = useTransactionStore(s => s.contractAddress);
    const deploymentReceipt = useTransactionStore(s => s.receipt);
    const providerInstance = useTransactionStore(s => s.provider);
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

        // Client-side validation
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (file.size > MAX_FILE_SIZE) {
            setMetadataState(prev => ({ ...prev, status: 'error', error: 'File too large. Maximum 10MB allowed.' }));
            return toast.error('File too large. Maximum 10MB allowed.');
        }
        
        if (!ALLOWED_TYPES.includes(file.type)) {
            setMetadataState(prev => ({ ...prev, status: 'error', error: 'Invalid file type. Only JPG, PNG, GIF, WebP allowed.' }));
            return toast.error('Invalid file type. Only JPG, PNG, GIF, WebP allowed.');
        }

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
        <div className="container pt-3">
            {/* Header */}
            <div className="animate-fade-in-up mb-8">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[var(--primary-gradient)] rounded-xl flex items-center justify-center text-[22px] shadow-[var(--shadow-ambient)]">🎨</div>
                        <h1 className="text-3xl font-black tracking-tight text-[var(--on-surface)]">
                            NFT <span className="text-transparent bg-clip-text bg-[var(--primary-gradient)]">Generator</span>
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Describe your NFT..." 
                            value={aiIntent} 
                            onChange={(e) => setAiIntent(e.target.value)}
                            className="w-[200px] text-[13px] px-3 py-2 bg-white border border-[var(--border-light)] rounded-full text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                            onKeyDown={(e) => { if(e.key === 'Enter') generateSuggestions('NFT', setFormData, aiIntent) }}
                        />
                        <Button 
                            variant="secondary"
                            onClick={() => generateSuggestions('NFT', setFormData, aiIntent)}
                            isLoading={isSuggesting}
                            className="rounded-full !py-2 !px-4"
                        >
                            ✨ Auto-Fill
                        </Button>
                        <Button 
                            variant="ai"
                            onClick={() => setIsChatOpen(true)}
                            className="rounded-full !py-2 !px-4"
                        >
                            💬 AI Chat
                        </Button>
                    </div>
                </div>
                <p className="text-[var(--on-surface-variant)] text-[0.95rem]">
                    Design and deploy custom ERC-721 NFT collections — no Solidity required.
                </p>

                {/* Feature badges */}
                <div className="flex gap-2 mt-3.5 flex-wrap">
                    {['Max Supply Cap', 'Mint Pricing', 'URI Storage', 'Burn Support', 'IPFS Upload', 'Owner Withdraw'].map(f => (
                        <span key={f} className="subtle-label">
                            {f}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left Column: Form */}
                <Card variant="glass" className="animate-fade-in-up delay-100">
                    <form onSubmit={generateNFT}>
                        
                        <Input
                            label="Collection Name"
                            name="name"
                            value={formData?.name || ''}
                            placeholder="e.g. AutoCon Genesis"
                            onChange={handleChange}
                            required
                        />

                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <Input
                                label="Symbol"
                                name="symbol"
                                value={formData?.symbol || ''}
                                placeholder="e.g. ACG"
                                onChange={handleChange}
                                wrapperClassName="flex-1 !mb-0"
                                required
                            />
                            <Input
                                label="Max Supply"
                                name="maxSupply"
                                type="number"
                                placeholder="10000"
                                onChange={handleChange}
                                value={formData?.maxSupply || ''}
                                wrapperClassName="flex-1 !mb-0"
                                helperText={Number(formData?.maxSupply) > 100000 ? '⚠️ A huge supply may lower rarity and floor price.' : ''}
                                required
                            />
                        </div>

                        <Input
                            label={`Mint Price (${network.currencySymbol || 'ETH'})`}
                            name="mintPrice"
                            type="number"
                            step="0.001"
                            placeholder="0.01"
                            onChange={handleChange}
                            value={formData?.mintPrice || ''}
                            helperText="Set to 0 for free minting. Owner can always mint for free."
                        />

                        <IPFSUploader 
                            metadataState={metadataState}
                            handleFileUpload={handleFileUpload}
                            handleUpdateMetadata={handleUpdateMetadata}
                            setMetadataState={setMetadataState}
                            setFormData={setFormData}
                        />

                        <Input
                            label="Base URI (Token URI)"
                            name="baseURI"
                            value={formData?.baseURI || ''}
                            readOnly
                            placeholder="Upload an image above to generate token URI"
                            helperText={metadataState.status === 'ready' ? '✅ Automatically filled from your IPFS metadata.' : '⚠️ Required for deployment. Upload an image above.'}
                            className="bg-[var(--surface)] text-[var(--outline)]"
                        />

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Owner Address</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    name="ownerAddress"
                                    value={formData?.ownerAddress || ''}
                                    className="w-full bg-white text-[var(--text-primary)] border border-[var(--border-light)] rounded-[var(--radius-md)] px-4 py-3 text-sm outline-none font-mono text-[0.85rem] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                                    readOnly
                                    required
                                    placeholder="Connect your wallet →"
                                />
                                <Button
                                    type="button"
                                    onClick={connectWallet}
                                    className="whitespace-nowrap"
                                >
                                    🦊 Connect
                                </Button>
                            </div>
                        </div>

                        <div className="form-actions-sticky">
                            <Button type="submit" size="lg" className="w-full">
                                Generate NFT Contract
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Right Column: Info, Gas, Deploy, Code */}
                <div className="flex flex-col gap-6">
                    
                    {/* Info Card */}
                    <Card className="animate-fade-in-up delay-200">
                        <h3 className="text-[0.9rem] font-extrabold text-[var(--on-surface)] mb-3.5">
                            📘 What Your NFT Contract Includes
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: '🖼️', title: 'ERC-721 Standard', desc: 'Full OpenZeppelin NFT implementation' },
                                { icon: '📝', title: 'URI Storage', desc: 'Individual token metadata per NFT' },
                                { icon: '🔥', title: 'Burn Support', desc: 'Token holders can burn their NFTs' },
                                { icon: '💰', title: 'Paid Minting', desc: 'Set a mint price or make it free' },
                                { icon: '📦', title: 'Max Supply', desc: 'Hard cap on total NFTs that can exist' },
                                { icon: '🏦', title: 'Withdraw Funds', desc: 'Owner can withdraw collected mint fees' },
                            ].map(item => (
                                <div key={item.title} className="p-3.5 rounded-xl bg-[var(--surface-highest)] border border-[var(--outline-variant)] flex gap-2.5 items-start">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="text-[0.82rem] font-bold text-[var(--on-surface)] mb-0.5">{item.title}</p>
                                        <p className="text-[0.72rem] text-[var(--outline)] leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Gas Estimation */}
                    {generatedCode && (
                        <Card className="animate-fade-in-up">
                            <div className={`flex justify-between items-center ${gasEstimate ? 'mb-5' : ''}`}>
                                <div>
                                    <h3 className="text-base font-bold text-[var(--on-surface)] mb-1">
                                        ⛽ Gas Estimation
                                    </h3>
                                    <p className="text-xs text-[var(--outline)]">
                                        Estimate NFT deployment cost before spending ETH
                                    </p>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={estimateGas}
                                    isLoading={isEstimating}
                                >
                                    Estimate Gas
                                </Button>
                            </div>

                            {gasEstimate && (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Gas Units</p>
                                        <p className="text-lg font-extrabold text-[var(--tertiary)]">
                                            {parseInt(gasEstimate.gasUnits).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                                        <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Gas Price</p>
                                        <p className="text-lg font-extrabold text-pink-500">
                                            {gasEstimate.gasPriceGwei} Gwei
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Est. Cost</p>
                                        <p className="text-lg font-extrabold text-[var(--success)]">
                                            {gasEstimate.estimatedCostETH} ETH
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Security Scanner */}
                    {generatedCode && (
                        <div className="animate-fade-in-up">
                            <SecurityScanner 
                                contractCode={generatedCode} 
                                onAuditResult={(status) => setAuditStatus(status)} 
                            />
                        </div>
                    )}

                    {/* Deploy Button */}
                    {generatedCode && (
                        <div className="animate-fade-in-up">
                            <div className="mb-4"><DeploymentStatusBar /></div>
                            {isDeploying && deployStep >= 0 ? (
                                <Card variant="glass" className="mb-4">
                                    <DeploymentTimeline currentStep={deployStep} errorStep={errorStep} errorMessage={errorMessage} />
                                </Card>
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={deployNFT}
                                    disabled={!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing}
                                    className={(!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? '!bg-[var(--surface-highest)] !text-[var(--outline)]' : ''}
                                >
                                    {auditStatus.isAuditing ? '⏳ Auditing Contract...' : `🚀 Deploy NFT to ${network.name}`}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Generated Code Preview */}
                    {generatedCode && (
                        <div className="animate-fade-in-up mt-2">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-[var(--on-surface)]">
                                    📄 Generated ERC-721 Contract
                                </h3>
                                <div className="flex items-center gap-2">
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
                                    <span className="subtle-label">
                                        Compiled ✓
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-[var(--outline-variant)]">
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
                compilerVersion={contractData?.compilerVersion}
                constructorArgs={contractData?.constructorArgs}
            />
            
            <AIChatPanel 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                contractCode={generatedCode} 
            />
        </div>
    );
}

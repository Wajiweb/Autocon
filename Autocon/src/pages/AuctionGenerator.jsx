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
import { useContractStore } from '../store/useContractStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function AuctionGenerator() {
    const {
        formData, setFormData, generatedCode,
        connectWallet, generateAuction, deployAuction,
        estimateGas, gasEstimate, isEstimating,
        showSuccessModal, setShowSuccessModal
    } = useAuction();
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
        <div className="container pt-3">
            {/* Header */}
            <div className="animate-fade-in-up mb-8">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[var(--primary-gradient)] rounded-xl flex items-center justify-center text-[22px] shadow-[var(--shadow-ambient)]">🔨</div>
                        <h1 className="text-3xl font-black tracking-tight text-[var(--on-surface)]">
                            Auction <span className="text-transparent bg-clip-text bg-[var(--primary-gradient)]">Generator</span>
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Describe your auction..." 
                            value={aiIntent} 
                            onChange={(e) => setAiIntent(e.target.value)}
                            className="w-[200px] text-[13px] px-3 py-2 bg-white border border-[var(--border-light)] rounded-full text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                            onKeyDown={(e) => { if(e.key === 'Enter') generateSuggestions('Auction', setFormData, aiIntent) }}
                        />
                        <Button 
                            variant="secondary"
                            onClick={() => generateSuggestions('Auction', setFormData, aiIntent)}
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
                    Create and deploy decentralized English Auctions — no Solidity required.
                </p>

                <div className="flex gap-2 mt-3.5 flex-wrap">
                    {['Timed Bidding', 'Auto-Refund', 'Min Bid Enforced', 'Extend Time', 'Withdraw Funds'].map(f => (
                        <span key={f} className="subtle-label">
                            {f}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className={`grid grid-cols-1 ${generatedCode ? 'lg:grid-cols-2' : ''} gap-8 items-start`}>
                
                {/* Left Column: Form */}
                <Card variant="glass" className="animate-fade-in-up delay-100">
                    <form onSubmit={generateAuction}>
                        
                        <Input
                            label="Auction Contract Name"
                            name="name"
                            placeholder="e.g. MyAuction"
                            onChange={handleChange}
                            value={formData?.name || ''}
                            required
                        />

                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <Input
                                label="Item Name"
                                name="itemName"
                                value={formData?.itemName || ''}
                                placeholder="e.g. Rare Digital Art #001"
                                onChange={handleChange}
                                wrapperClassName="flex-1 !mb-0"
                                required
                            />
                            <Input
                                label="Item Description"
                                name="itemDescription"
                                value={formData?.itemDescription || ''}
                                placeholder="A brief description..."
                                onChange={handleChange}
                                wrapperClassName="flex-1 !mb-0"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-[var(--outline)] uppercase tracking-wider mb-2">
                                Auction Duration
                                <span className="font-normal normal-case text-[var(--outline)] ml-2">
                                    ({durationLabel(formData.duration)})
                                </span>
                            </label>
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {durationPresets.map(p => (
                                    <button 
                                        key={p.value} 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, duration: p.value }))}
                                        className={`px-4 py-2 rounded-xl text-[0.78rem] font-bold transition-all duration-200 border ${
                                            formData.duration === p.value 
                                                ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                                                : 'border-[var(--outline-variant)] bg-[var(--surface-highest)] text-[var(--outline)] hover:border-[var(--outline)] hover:text-[var(--on-surface)]'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <Input
                                name="duration"
                                type="number"
                                placeholder="Custom seconds"
                                onChange={handleChange}
                                value={formData.duration}
                                wrapperClassName="!mb-0"
                            />
                        </div>

                        <Input
                            label="Minimum Bid (ETH)"
                            name="minimumBid"
                            type="number"
                            step="0.001"
                            placeholder="0.01"
                            onChange={handleChange}
                            value={formData.minimumBid}
                            helperText={
                                Number(formData?.duration) > 2592000 
                                    ? '⚠️ A duration over 30 days may reduce bidder urgency.' 
                                    : 'The smallest bid that will be accepted by the contract.'
                            }
                        />

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Owner / Beneficiary</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    name="ownerAddress"
                                    value={formData.ownerAddress}
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
                                Generate Auction Contract
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Right Column: Info, Gas, Deploy, Code */}
                {generatedCode && (
                    <div className="flex flex-col gap-6 animate-fade-in-up delay-200">
                        
                        {/* Info Card */}
                        <Card>
                            <h3 className="text-[0.9rem] font-extrabold text-[var(--on-surface)] mb-3.5">
                                📘 How English Auctions Work
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: '⏳', title: 'Timed Bidding', desc: 'Auction runs for a set duration, highest bid wins' },
                                    { icon: '💰', title: 'Minimum Bid', desc: 'Enforces a floor price — no lowball bids accepted' },
                                    { icon: '🔄', title: 'Auto-Refund', desc: 'Previous bidders can withdraw outbid funds safely' },
                                    { icon: '🏆', title: 'Winner Takes All', desc: 'Highest bid sent to beneficiary when auction ends' },
                                    { icon: '⏰', title: 'Time Extension', desc: 'Owner can extend the auction if needed' },
                                    { icon: '📊', title: 'Live Info', desc: 'Get auction status, bids, and time left on-chain' },
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
                        <Card>
                            <div className={`flex justify-between items-center ${gasEstimate ? 'mb-5' : ''}`}>
                                <div>
                                    <h3 className="text-base font-bold text-[var(--on-surface)] mb-1">⛽ Gas Estimation</h3>
                                    <p className="text-xs text-[var(--outline)]">Estimate deployment cost before spending ETH</p>
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
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Gas Units</p>
                                        <p className="text-lg font-extrabold text-amber-500">
                                            {parseInt(gasEstimate.gasUnits).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Gas Price</p>
                                        <p className="text-lg font-extrabold text-red-500">
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

                        {/* Security Scanner */}
                        <div>
                            <SecurityScanner 
                                contractCode={generatedCode} 
                                onAuditResult={(status) => setAuditStatus(status)} 
                            />
                        </div>

                        {/* Deploy Button */}
                        <div>
                            <div className="mb-4"><DeploymentStatusBar /></div>
                            {isDeploying && deployStep >= 0 ? (
                                <Card variant="glass" className="mb-4">
                                    <DeploymentTimeline currentStep={deployStep} errorStep={errorStep} errorMessage={errorMessage} />
                                </Card>
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={deployAuction}
                                    disabled={!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing}
                                    className={`w-full ${(!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? '!bg-[var(--surface-highest)] !text-[var(--outline)]' : ''}`}
                                >
                                    {auditStatus.isAuditing ? '⏳ Auditing Contract...' : `🚀 Deploy Auction to ${network.name}`}
                                </Button>
                            )}
                        </div>

                        {/* Generated Code */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-[var(--on-surface)]">📄 Generated Auction Contract</h3>
                                <div className="flex items-center gap-2">
                                    <DeveloperToggle />
                                    <ExportCenter contractName={formData.name || 'Auction'} abi={contractData?.abi} />
                                    <span className="subtle-label">Compiled ✓</span>
                                </div>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-[var(--outline-variant)]">
                                <CodeViewer />
                            </div>
                        </div>

                    </div>
                )}
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

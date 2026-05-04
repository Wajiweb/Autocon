import { useState } from 'react';
import { useAuction } from '../hooks/useAuction';
import { useNetwork } from '../context/NetworkContext';
import { useAISuggestion } from '../hooks/useAISuggestion';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';
import { useContractStore } from '../store/useContractStore';

import GeneratorHeader from '../components/generator/GeneratorHeader';
import GasEstimateCard from '../components/generator/GasEstimateCard';
import ContractDeployPanel from '../components/generator/ContractDeployPanel';
import ContractCodePreview from '../components/generator/ContractCodePreview';

import AIChatPanel from '../components/dashboard/AIChatPanel';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SuggestionInput } from '../components/ui/SuggestionInput';
import { Toggle } from '../components/ui/Toggle';

const AUCTION_FEATURES = ['Timed Bidding', 'Auto-Refund', 'Min Bid Enforced', 'Extend Time', 'Withdraw Funds'];

const AUCTION_INFO = [
  { icon: '⏳', title: 'Timed Bidding',    desc: 'Auction runs for a set duration, highest bid wins' },
  { icon: '💰', title: 'Minimum Bid',      desc: 'Enforces a floor price — no lowball bids accepted' },
  { icon: '🔄', title: 'Auto-Refund',      desc: 'Previous bidders can withdraw outbid funds safely' },
  { icon: '🏆', title: 'Winner Takes All', desc: 'Highest bid sent to beneficiary when auction ends' },
  { icon: '⏰', title: 'Time Extension',   desc: 'Owner can extend the auction if needed' },
  { icon: '📊', title: 'Live Info',        desc: 'Get auction status, bids, and time left on-chain' },
];

const DURATION_PRESETS = [
  { label: '1 hour',  value: '3600' },
  { label: '6 hours', value: '21600' },
  { label: '24 hours',value: '86400' },
  { label: '3 days',  value: '259200' },
  { label: '7 days',  value: '604800' },
];

const durationLabel = (secs) => {
  const s = parseInt(secs) || 0;
  if (s < 60)    return `${s} seconds`;
  if (s < 3600)  return `${Math.round(s / 60)} minutes`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
  return `${(s / 86400).toFixed(1)} days`;
};

export default function AuctionGenerator() {
  const {
    formData, setFormData, generatedCode,
    connectWallet, generateAuction, deployAuction,
    estimateGas, gasEstimate, isEstimating,
    showSuccessModal, setShowSuccessModal,
  } = useAuction();

  const contractData      = useContractStore(s => s.contractData);
  const isDeploying       = useTransactionStore(selectIsDeploying);
  const deployStep        = useTransactionStore(s => s.step);
  const errorStep         = useTransactionStore(s => s.errorStep);
  const errorMessage      = useTransactionStore(s => s.errorMessage);
  const deployedAddress   = useTransactionStore(s => s.contractAddress);
  const deploymentReceipt = useTransactionStore(s => s.receipt);
  const providerInstance  = useTransactionStore(s => s.provider);
  const { network }       = useNetwork();
  const { isSuggesting, generateSuggestions, suggestions, reasoning } = useAISuggestion();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiIntent, setAiIntent]     = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="container pt-3">

      {/* ── Header ── */}
      <GeneratorHeader
        icon="🔨"
        title="Auction"
        titleAccent="Generator"
        subtitle="Create and deploy decentralized English Auctions — no Solidity required."
        features={AUCTION_FEATURES}
        aiIntent={aiIntent}
        aiPlaceholder="Describe your auction..."
        onAiIntentChange={setAiIntent}
        onAutoFill={() => generateSuggestions('Auction', setFormData, aiIntent, true)}
        isSuggesting={isSuggesting}
        onChatOpen={() => setIsChatOpen(true)}
        reasoning={reasoning}
      />

      {/* ── Content Grid ── */}
      <div className={`grid grid-cols-1 ${generatedCode ? 'lg:grid-cols-2' : ''} gap-8 items-start`}>

        {/* Left: Form */}
        <Card variant="glass">
          <form onSubmit={generateAuction}>
            <Input
              label="Auction Contract Name"
              name="name"
              placeholder="e.g. MyAuction"
              value={formData?.name || ''}
              onChange={handleChange}
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

            {/* Duration Presets */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[var(--outline)] uppercase tracking-wider mb-2">
                Auction Duration
                <span className="font-normal normal-case text-[var(--outline)] ml-2">
                  ({durationLabel(formData.duration)})
                </span>
              </label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {DURATION_PRESETS.map(p => (
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
              <SuggestionInput
                label="Duration (seconds)"
                name="duration"
                type="number"
                placeholder="Custom seconds"
                value={formData.duration}
                onChange={handleChange}
                wrapperClassName="!mb-0"
                suggestions={suggestions?.duration ? [suggestions.duration.toString()] : []}
              />
            </div>

            <SuggestionInput
              label="Minimum Bid (ETH)"
              name="minimumBid"
              type="number"
              step="0.001"
              placeholder="0.01"
              value={formData.minimumBid}
              onChange={handleChange}
              suggestions={suggestions?.minimumBid ? [suggestions.minimumBid.toString()] : []}
              helperText={
                Number(formData?.duration) > 2592000
                  ? '⚠️ A duration over 30 days may reduce bidder urgency.'
                  : 'The smallest bid that will be accepted by the contract.'
              }
            />

            <SuggestionInput
              label="Reserve Price (ETH)"
              name="reservePrice"
              type="number"
              step="0.001"
              placeholder="Optional minimum sell price"
              value={formData.reservePrice || ''}
              onChange={handleChange}
              suggestions={suggestions?.reservePrice ? [suggestions.reservePrice.toString()] : []}
              helperText="Minimum price to accept (optional)"
            />

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Toggle name="hasExtension" checked={formData?.hasExtension || false} onChange={handleChange} label="Extension"  description="Extend time on bids" />
              <Toggle name="hasAntiSnipe" checked={formData?.hasAntiSnipe  || false} onChange={handleChange} label="Anti-Snipe" description="Prevent last-second bids" />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Owner / Beneficiary</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  className="w-full bg-[color:var(--surface-elevated)] text-[color:var(--text-primary)] border border-[var(--border-light)] rounded-[var(--radius-md)] px-4 py-3 text-sm outline-none font-mono text-[0.85rem] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                  readOnly required
                  placeholder="Connect your wallet →"
                />
                <Button type="button" onClick={connectWallet} className="whitespace-nowrap">🦊 Connect</Button>
              </div>
            </div>

            <div className="form-actions-sticky">
              <Button type="submit" size="lg" className="w-full">Generate Auction Contract</Button>
            </div>
          </form>
        </Card>

        {/* Right: Info, Gas, Deploy, Code */}
        {generatedCode && (
          <div className="flex flex-col gap-6">
            {/* Info tiles */}
            <Card>
              <h3 className="text-[0.9rem] font-extrabold text-[var(--on-surface)] mb-3.5">📘 How English Auctions Work</h3>
              <div className="grid grid-cols-2 gap-3">
                {AUCTION_INFO.map(item => (
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

            {/* ── Gas Estimate ── */}
            <GasEstimateCard
              gasEstimate={gasEstimate}
              onEstimate={estimateGas}
              isEstimating={isEstimating}
              label="Auction Gas Estimation"
            />

            {/* ── Deploy Panel ── */}
            <ContractDeployPanel
              generatedCode={generatedCode}
              isDeploying={isDeploying}
              deployStep={deployStep}
              errorStep={errorStep}
              errorMessage={errorMessage}
              onDeploy={deployAuction}
              deployLabel={`Deploy Auction to ${network.name}`}
              auditType="Auction"
            />

            {/* ── Code Preview ── */}
            <ContractCodePreview
              contractName={formData.name || 'Auction'}
              contractLabel="Generated Auction Contract"
              abi={contractData?.abi}
            />
          </div>
        )}
      </div>

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

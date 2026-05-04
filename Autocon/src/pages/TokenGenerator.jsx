import { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
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

const TOKEN_FEATURES = ['Standard ERC-20', 'Mintable', 'Burnable', 'Pausable'];

const TOKEN_INFO = [
  { icon: '🪙', title: 'ERC-20 Standard', desc: 'Full OpenZeppelin token implementation' },
  { icon: '⚖️', title: 'Decimals',         desc: 'Standard 18 decimal places for divisibility' },
  { icon: '🏦', title: 'Initial Supply',   desc: 'Mints total supply to owner at deployment' },
  { icon: '🔒', title: 'Security',         desc: 'Inherits battle-tested OZ contracts' },
];

export default function TokenGenerator() {
  const {
    formData, setFormData, generatedCode,
    connectWallet, generateContract, deployContract,
    estimatedCost,
    showSuccessModal, setShowSuccessModal, ast,
  } = useWeb3();

  const contractData      = useContractStore(s => s.contractData);
  const isDeploying       = useTransactionStore(selectIsDeploying);
  const deployStep        = useTransactionStore(s => s.step);
  const errorStep         = useTransactionStore(s => s.errorStep);
  const errorMessage      = useTransactionStore(s => s.errorMessage);
  const deployedAddress   = useTransactionStore(s => s.contractAddress);
  const deploymentReceipt = useTransactionStore(s => s.receipt);
  const providerInstance  = useTransactionStore(s => s.provider);
  const { network }       = useNetwork();
  const { isSuggesting, generateSuggestions, reasoning } = useAISuggestion();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiIntent, setAiIntent]     = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="container pt-3">

      {/* ── Header ── */}
      <GeneratorHeader
        icon="🪙"
        title="ERC-20"
        titleAccent="Generator"
        subtitle="Design and deploy custom ERC-20 tokens in minutes — no Solidity required."
        features={TOKEN_FEATURES}
        aiIntent={aiIntent}
        aiPlaceholder="Describe your token idea..."
        onAiIntentChange={setAiIntent}
        onAutoFill={() => generateSuggestions('Token', setFormData, aiIntent)}
        isSuggesting={isSuggesting}
        onChatOpen={() => setIsChatOpen(true)}
        reasoning={reasoning}
      />

      {/* ── Content Grid ── */}
      <div className={`grid grid-cols-1 ${generatedCode ? 'lg:grid-cols-2' : ''} gap-8 items-start`}>

        {/* Form */}
        <Card variant="glass">
          <form onSubmit={generateContract}>
            <Input
              label="Token Name"
              name="name"
              value={formData?.name || ''}
              placeholder="e.g. AutoCon Token"
              onChange={handleChange}
              required
            />
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input
                label="Symbol"
                name="symbol"
                value={formData?.symbol || ''}
                placeholder="e.g. ACT"
                onChange={handleChange}
                wrapperClassName="flex-1 !mb-0"
                required
              />
              <Input
                label="Initial Supply"
                name="supply"
                type="number"
                placeholder="1000000"
                value={formData?.supply || ''}
                onChange={handleChange}
                wrapperClassName="flex-1 !mb-0"
                helperText={Number(formData?.supply) > 1000000000 ? '⚠️ High supply may dilute individual token value.' : ''}
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Owner Address</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  name="ownerAddress"
                  value={formData?.ownerAddress || ''}
                  className="w-full bg-[color:var(--surface-elevated)] text-[color:var(--text-primary)] border border-[var(--border-light)] rounded-[var(--radius-md)] px-4 py-3 text-sm outline-none font-mono text-[0.85rem] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                  readOnly required
                  placeholder="Connect your wallet →"
                />
                <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
                  🦊 Connect
                </Button>
              </div>
            </div>
            <div className="form-actions-sticky">
              <Button type="submit" size="lg" className="w-full">Generate Smart Contract</Button>
            </div>
          </form>
        </Card>

        {/* Right column */}
        {generatedCode && (
          <div className="flex flex-col gap-6">

            {/* Contract info tiles */}
            <Card>
              <h3 className="text-[0.9rem] font-extrabold text-[var(--on-surface)] mb-3.5">📘 What Your Token Contract Includes</h3>
              <div className="grid grid-cols-2 gap-3">
                {TOKEN_INFO.map(item => (
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

            {/* Gas estimate (simple ETH cost for Token — no estimateGas fn) */}
            {estimatedCost && (
              <Card className="flex items-center justify-between p-4 bg-sky-500/10 border-sky-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-[22px]">⛽</span>
                  <div>
                    <div className="text-[0.65rem] font-bold text-[var(--outline)] uppercase tracking-wider mb-0.5">Estimated Network Fee</div>
                    <div className="text-[0.7rem] text-[var(--outline)]">Live {network.name} Gas Price</div>
                  </div>
                </div>
                <div className="font-mono text-lg font-bold text-sky-400">
                  {estimatedCost} {network.currencySymbol || 'ETH'}
                </div>
              </Card>
            )}

            {/* ── Deploy Panel ── */}
            <ContractDeployPanel
              generatedCode={generatedCode}
              isDeploying={isDeploying}
              deployStep={deployStep}
              errorStep={errorStep}
              errorMessage={errorMessage}
              onDeploy={deployContract}
              deployLabel={`Deploy to ${network.name}`}
              auditType="ERC20"
            />

            {/* ── Code Preview ── */}
            <ContractCodePreview
              contractName={formData.name || 'Token'}
              contractLabel="Generated Solidity"
              abi={contractData?.abi}
              ast={ast}
            />
          </div>
        )}
      </div>

      <DeploySuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        address={deployedAddress || ''}
        network={network.name}
        contractType="Token"
        explorerUrl={network.explorer || 'https://sepolia.etherscan.io'}
        abi={contractData?.abi}
        contractName={formData.name || 'Token'}
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

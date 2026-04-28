import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import ExportCenter from '../components/dashboard/ExportCenter';
import CodeViewer from '../components/dashboard/CodeViewer';
import SecurityScanner from '../components/dashboard/SecurityScanner';
import DeploymentTimeline from '../components/deploy/DeploymentTimeline';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import DeploymentStatusBar from '../components/deploy/DeploymentStatusBar';
import { useNetwork } from '../context/NetworkContext';
import { useAISuggestion } from '../hooks/useAISuggestion';
import AIChatPanel from '../components/dashboard/AIChatPanel';
import DeveloperToggle from '../components/dashboard/DeveloperToggle';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';
import { useContractStore } from '../store/useContractStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function TokenGenerator() {
  const navigate = useNavigate();
  const {
    formData, setFormData, generatedCode,
    connectWallet, generateContract, deployContract,
    estimatedCost,
    showSuccessModal, setShowSuccessModal, ast
  } = useWeb3();
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

  return (
    <div className="container pt-3">

      {/* Header */}
      <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[var(--primary-gradient)] rounded-xl flex items-center justify-center text-[22px] shadow-[var(--shadow-ambient)]">🪙</div>
                  <h1 className="text-3xl font-black tracking-tight text-[var(--on-surface)]">
                      ERC-20 <span className="text-transparent bg-clip-text bg-[var(--primary-gradient)]">Generator</span>
                  </h1>
              </div>
              <div className="flex gap-2">
                  <input 
                      type="text" 
                      placeholder="Describe your token idea..." 
                      value={aiIntent} 
                      onChange={(e) => setAiIntent(e.target.value)}
                      className="w-[200px] text-[13px] px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border-light)] rounded-full text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                      onKeyDown={(e) => { if(e.key === 'Enter') generateSuggestions('Token', setFormData, aiIntent) }}
                  />
                  <Button 
                      variant="secondary"
                      onClick={() => generateSuggestions('Token', setFormData, aiIntent)}
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
              Design and deploy custom ERC-20 tokens in minutes — no Solidity required.
          </p>
          <div className="flex gap-2 mt-3.5 flex-wrap">
              {['Standard ERC-20', 'Mintable', 'Burnable', 'Pausable'].map(f => (
                  <span key={f} className="subtle-label">
                      {f}
                  </span>
              ))}
          </div>
      </div>

      {/* Content Grid */}
      <div className={`grid grid-cols-1 ${generatedCode ? 'lg:grid-cols-2' : ''} gap-8 items-start`}>

        {/* Form */}
        <Card variant="glass" className="">
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
                  onChange={handleChange}
                  value={formData?.supply || ''}
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
                            className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-[var(--radius-md)] px-4 py-3 text-sm outline-none font-mono text-[0.85rem] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
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
                Generate Smart Contract
              </Button>
            </div>
          </form>
        </Card>

        {/* Right column: gas + code */}
        {generatedCode && (
          <div className="flex flex-col gap-6">

            {/* Info Card */}
            <Card>
                <h3 className="text-[0.9rem] font-extrabold text-[var(--on-surface)] mb-3.5">
                    📘 What Your Token Contract Includes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: '🪙', title: 'ERC-20 Standard', desc: 'Full OpenZeppelin token implementation' },
                        { icon: '⚖️', title: 'Decimals', desc: 'Standard 18 decimal places for divisibility' },
                        { icon: '🏦', title: 'Initial Supply', desc: 'Mints total supply to owner at deployment' },
                        { icon: '🔒', title: 'Security', desc: 'Inherits battle-tested OZ contracts' },
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

            {/* Gas Estimator */}
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

            {/* Security Scanner */}
            <SecurityScanner 
              contractCode={generatedCode} 
              onAuditResult={(status) => setAuditStatus(status)} 
            />

            {/* Deploy */}
            <div>
              <div className="mb-4"><DeploymentStatusBar /></div>
              {isDeploying && deployStep >= 0 ? (
                <Card variant="glass" className="mb-4">
                  <DeploymentTimeline currentStep={deployStep} errorStep={errorStep} errorMessage={errorMessage} />
                </Card>
              ) : (
                <Button 
                  size="lg"
                  onClick={deployContract} 
                  disabled={!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing}
                  className={`w-full ${(!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing) ? '!bg-[var(--surface-highest)] !text-[var(--outline)]' : ''}`}
                >
                  {auditStatus.isAuditing ? '⏳ Auditing Contract...' : `🚀 Deploy to ${network.name}`}
                </Button>
              )}
            </div>

            {/* Code Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--on-surface)]">
                    📄 Generated Solidity
                  </span>
                  <span className="subtle-label">Compiled</span>
                </div>
                <div className="flex items-center gap-2">
                  <DeveloperToggle />
                  <ExportCenter contractName={formData.name || 'Token'} abi={contractData?.abi} />
                  {ast && (
                    <Button variant="secondary" size="sm" onClick={() => navigate('/ast', { state: { ast } })}>
                      🌳 AST
                    </Button>
                  )}
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-[var(--outline-variant)]">
                <CodeViewer />
              </div>
            </div>
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

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
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';
import { useContractStore } from '../store/useContractStore';
import '../components/dashboard/styles/dashboard.css';

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
    <div className="pg-wrap">

      {/* Header */}
      <div className="pg-head db-enter db-enter-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="pg-title">ERC-20 <em>Token Generator</em></div>
          <div className="pg-sub">Design and deploy custom tokens in minutes — no Solidity required.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Describe your token idea..." 
            value={aiIntent} 
            onChange={(e) => setAiIntent(e.target.value)}
            className="pg-input" 
            style={{ width: '200px', fontSize: '13px', padding: '8px 12px' }}
            onKeyDown={(e) => { if(e.key === 'Enter') generateSuggestions('Token', setFormData, aiIntent) }}
          />
          <button 
            onClick={() => generateSuggestions('Token', setFormData, aiIntent)}
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

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: generatedCode ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>

        {/* Form */}
        <div className="pg-card accent-top db-enter db-enter-2">
          <form onSubmit={generateContract}>

            <div style={{ marginBottom: 18 }}>
              <label className="pg-label">Token Name</label>
              <input name="name" value={formData?.name || ''} placeholder="e.g. AutoCon Token" className="pg-input" onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label className="pg-label">Symbol</label>
                <input name="symbol" value={formData?.symbol || ''} placeholder="e.g. ACT" className="pg-input" onChange={handleChange} required />
              </div>
              <div>
                <label className="pg-label">Initial Supply</label>
                <input name="supply" type="number" placeholder="1000000" className="pg-input"
                  onChange={handleChange} value={formData?.supply || ''} required />
                {Number(formData?.supply) > 1000000000 && (
                   <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px' }}>⚠️ High supply may dilute individual token value.</div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label className="pg-label">Owner Address</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input name="ownerAddress" value={formData?.ownerAddress || ''} className="pg-input"
                  style={{ fontFamily: 'var(--db-mono)', fontSize: 12 }}
                  readOnly placeholder="Connect your wallet →" />
                <button type="button" onClick={connectWallet} className="pg-btn"
                  style={{ background: 'var(--primary)', color: '#fff',
                    whiteSpace: 'nowrap', borderRadius: 'var(--db-r-sm)', boxShadow: '0 4px 16px rgba(93,169,233,.30)' }}>
                  🦊 Connect
                </button>
              </div>
            </div>

            <button type="submit" className="pg-btn pg-btn-primary" style={{ width: '100%', padding: '12px 0' }}>
              ⚡ Generate Smart Contract
            </button>
          </form>
        </div>

        {/* Right column: gas + code */}
        {generatedCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="db-enter db-enter-3">

            {/* Gas Estimator */}
            {estimatedCost && (
              <div className="pg-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>⛽</span>
                  <div>
                    <div className="pg-label" style={{ marginBottom: 2 }}>Estimated Network Fee</div>
                    <div style={{ fontSize: 12, color: 'var(--db-t2)' }}>Live {network.name} Gas Price</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--db-mono)', fontSize: 18, fontWeight: 600, color: 'var(--db-acc)' }}>
                  {estimatedCost} {network.currencySymbol || 'ETH'}
                </div>
              </div>
            )}

            {/* Security Scanner */}
            <SecurityScanner 
              contractCode={generatedCode} 
              onAuditResult={(status) => setAuditStatus(status)} 
            />

            {/* Deploy */}
            <div style={{ marginBottom: 16 }}><DeploymentStatusBar /></div>
            {isDeploying && deployStep >= 0 ? (
              <div className="pg-card">
                <DeploymentTimeline
                  currentStep={deployStep}
                  errorStep={errorStep}
                  errorMessage={errorMessage}
                />
              </div>
            ) : (
              <button type="button" onClick={deployContract} 
                disabled={!generatedCode || isDeploying || !auditStatus.canDeploy || auditStatus.isAuditing}
                className="pg-btn pg-btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: 14 }}>
                {auditStatus.isAuditing ? '⏳ Auditing Contract...' : `🚀 Deploy to ${network.name}`}
              </button>
            )}

            {/* Code Preview */}
            <div className="pg-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--db-t2)', fontFamily: 'var(--db-font)', fontWeight: 600 }}>
                    📄 Generated Solidity
                  </span>
                  <span className="pg-badge green">Compiled ✓</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DeveloperToggle />
                  <ExportCenter contractName={formData.name || 'Token'} abi={contractData?.abi} />
                  {ast && (
                    <button onClick={() => navigate('/ast', { state: { ast } })}
                      className="pg-btn pg-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}>
                      🌳 AST
                    </button>
                  )}
                </div>
              </div>
              <div className="pg-code-block" style={{ padding: 0 }}>
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
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import CodeExportTools from '../components/dashboard/CodeExportTools';
import DeploymentTimeline from '../components/deploy/DeploymentTimeline';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import { useNetwork } from '../context/NetworkContext';
import '../components/dashboard/styles/dashboard.css';

export default function TokenGenerator() {
  const navigate = useNavigate();
  const {
    formData, setFormData, generatedCode,
    connectWallet, generateContract, deployContract,
    estimatedCost,
    isDeploying, deployStep, deployStepError,
    deployedAddress, showSuccessModal, setShowSuccessModal,
    contractData, ast, deploymentReceipt, providerInstance
  } = useWeb3();
  const { network } = useNetwork();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pg-wrap">

      {/* Header */}
      <div className="pg-head db-enter db-enter-1">
        <div className="pg-title">ERC-20 <em>Token Generator</em></div>
        <div className="pg-sub">Design and deploy custom tokens in minutes — no Solidity required.</div>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: generatedCode ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>

        {/* Form */}
        <div className="pg-card accent-top db-enter db-enter-2">
          <form onSubmit={generateContract}>

            <div style={{ marginBottom: 18 }}>
              <label className="pg-label">Token Name</label>
              <input name="name" placeholder="e.g. AutoCon Token" className="pg-input" onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label className="pg-label">Symbol</label>
                <input name="symbol" placeholder="e.g. ACT" className="pg-input" onChange={handleChange} required />
              </div>
              <div>
                <label className="pg-label">Initial Supply</label>
                <input name="supply" type="number" placeholder="1000000" className="pg-input"
                  onChange={handleChange} value={formData?.supply || ''} required />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label className="pg-label">Owner Address</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input name="ownerAddress" value={formData?.ownerAddress || ''} className="pg-input"
                  style={{ fontFamily: 'var(--db-mono)', fontSize: 12 }}
                  readOnly placeholder="Connect your wallet →" />
                <button type="button" onClick={connectWallet} className="pg-btn"
                  style={{ background: 'linear-gradient(135deg,#8FB900,#A5C900)', color: '#0c1a0f',
                    whiteSpace: 'nowrap', borderRadius: 'var(--db-r-sm)', boxShadow: '0 4px 16px rgba(143,185,0,.35)' }}>
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

            {/* Deploy */}
            {isDeploying && deployStep >= 0 ? (
              <div className="pg-card">
                <DeploymentTimeline
                  currentStep={deployStep}
                  errorStep={deployStepError?.step ?? -1}
                  errorMessage={deployStepError?.message ?? ''}
                />
              </div>
            ) : (
              <button type="button" onClick={deployContract} disabled={!generatedCode || isDeploying}
                className="pg-btn pg-btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: 14 }}>
                🚀 Deploy to {network.name}
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
                  <CodeExportTools code={generatedCode} contractName={formData.name || 'Token'} />
                  {ast && (
                    <button onClick={() => navigate('/ast', { state: { ast } })}
                      className="pg-btn pg-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}>
                      🌳 AST
                    </button>
                  )}
                </div>
              </div>
              <div className="pg-code-block">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <code>{generatedCode}</code>
                </pre>
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
    </div>
  );
}
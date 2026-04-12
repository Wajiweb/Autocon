import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import CodeExportTools from '../components/dashboard/CodeExportTools';
import DeploymentTimeline from '../components/deploy/DeploymentTimeline';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import { useNetwork } from '../context/NetworkContext';

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
    <div className="container" style={{ paddingTop: '12px' }}>


      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
          color: 'var(--on-surface)', marginBottom: '8px'
        }}>
          ERC-20 <span className="gradient-text">Generator</span>
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
          Design and deploy custom tokens in minutes — no Solidity required.
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="card glass animate-fade-in-up delay-100" style={{ padding: '36px' }}>
        <form onSubmit={generateContract}>
          {/* Token Name */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 700,
              color: 'var(--outline)', textTransform: 'uppercase',
              letterSpacing: '1px', marginBottom: '10px'
            }}>
              Token Name
            </label>
            <input
              name="name"
              placeholder="e.g. AutoCon Token"
              className="input"
              onChange={handleChange}
              required
            />
          </div>

          {/* Symbol + Supply Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                color: 'var(--outline)', textTransform: 'uppercase',
                letterSpacing: '1px', marginBottom: '10px'
              }}>
                Symbol
              </label>
              <input
                name="symbol"
                placeholder="e.g. ACT"
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
              }}>
                Initial Supply
              </label>
              <input
                name="supply"
                type="number"
                placeholder="1000000"
                className="input"
                onChange={handleChange}
                value={formData?.supply || ''}
                required
              />
            </div>
          </div>

          {/* Owner Address */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 700,
              color: 'var(--outline)', textTransform: 'uppercase',
              letterSpacing: '1px', marginBottom: '10px'
            }}>
              Owner Address
            </label>
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
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f6851b, #e2761b)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(246,133,27,0.3)'
                }}
              >
                🦊 Connect
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}>
            ⚡ Generate Smart Contract
          </button>
        </form>
      </div>

      {/* Right Column: Gas and Code */}
      {generatedCode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
      {/* Deploy Actions & Gas Estimator */}
      <div className="animate-fade-in-up">
          {/* --- NEW: GAS ESTIMATOR UI --- */}
          {generatedCode && estimatedCost && (
            <div className="mt-4 p-4 mb-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛽</span>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Network Fee</p>
                  <p className="text-sm text-slate-700">Live {network.name} Gas Price</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">{estimatedCost} ETH</p>
              </div>
            </div>
          )}

          {isDeploying && deployStep >= 0 ? (
            <div className="card glass" style={{ padding: '28px', marginBottom: '16px' }}>
              <DeploymentTimeline
                currentStep={deployStep}
                errorStep={deployStepError?.step ?? -1}
                errorMessage={deployStepError?.message ?? ''}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={deployContract}
              disabled={!generatedCode || isDeploying}
              className="btn-primary"
              style={{
                width: '100%', padding: '18px',
                fontSize: '1.05rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: (!generatedCode || isDeploying)
                  ? 'var(--bg-input)'
                  : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                color: (!generatedCode || isDeploying) ? 'var(--text-muted)' : 'white',
                cursor: (!generatedCode || isDeploying) ? 'not-allowed' : 'pointer'
              }}
            >
              🚀 Deploy to {network.name}
            </button>
          )}
        </div>

      {/* Generated Code Preview */}
      <div className="animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📄 Generated Solidity Code
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CodeExportTools code={generatedCode} contractName={formData.name || 'Token'} />
              <span className="badge badge-success">Compiled ✓</span>
              {ast && (
                <button
                  onClick={() => navigate('/ast', { state: { ast } })}
                  style={{
                    fontSize: '0.75rem', padding: '4px 10px',
                    borderRadius: '8px', cursor: 'pointer',
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    color: '#a78bfa', fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  🌳 View AST
                </button>
              )}
            </div>
          </div>
          <div className="code-block">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <code>{generatedCode}</code>
            </pre>
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
        contractType="Token"
        explorerUrl={network.explorerUrl || 'https://sepolia.etherscan.io'}
        abi={contractData?.abi}
        contractName={formData.name || 'Token'}
        receipt={deploymentReceipt}
        provider={providerInstance}
      />
    </div>
  );
}
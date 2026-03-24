import { useWeb3 } from '../hooks/useWeb3';
import CodeExportTools from '../components/CodeExportTools';
import DeploymentTimeline from '../components/deploy/DeploymentTimeline';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import { useNetwork } from '../context/NetworkContext';

export default function TokenGenerator() {
  const {
    formData, setFormData, generatedCode,
    connectWallet, generateContract, deployContract,
    estimateGas, gasEstimate, isEstimating,
    isDeploying, deployStep,
    deployedAddress, showSuccessModal, setShowSuccessModal
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
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
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
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
          
          {/* Gas Estimation Panel */}
          <div className="card glass animate-fade-in-up diff-bg" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: gasEstimate ? '20px' : '0' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '4px' }}>
                ⛽ Gas Estimation
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>
                Estimate deployment cost before you spend real ETH
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
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'
            }}>
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: 'var(--accent-glow)',
                border: '1px solid rgba(6,182,212,0.15)'
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '6px' }}>Gas Units</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--tertiary)' }}>
                  {parseInt(gasEstimate.gasUnits).toLocaleString()}
                </p>
              </div>
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.15)'
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '6px' }}>Gas Price</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a78bfa' }}>
                  {gasEstimate.gasPriceGwei} Gwei
                </p>
              </div>
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.15)'
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '6px' }}>Est. Cost</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>
                  {gasEstimate.estimatedCostETH} ETH
                </p>
              </div>
            </div>
          )}
        </div>

      {/* Deploy Button */}
      <div className="animate-fade-in-up">
          {isDeploying && deployStep >= 0 ? (
            <div className="card glass" style={{ padding: '28px', marginBottom: '16px' }}>
              <DeploymentTimeline currentStep={deployStep} />
            </div>
          ) : (
            <button
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
      />
    </div>
  );
}
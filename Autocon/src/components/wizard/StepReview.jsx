import { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../store/useWizardStore';
import { CONTRACT_TYPES } from '../../constants/contract';
import { Zap, CheckCircle, Network } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Editor = lazy(() => import('@monaco-editor/react'));

function SummaryRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="wz-review-item">
      <div className="wz-review-label">{label}</div>
      <div className="wz-review-val">{value}</div>
    </div>
  );
}

export function StepReview({ type, params, code, isGenerating, onGenerate }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { setGeneratedCode, session } = useWizardStore();
  const { contractData } = session;
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const features = Object.entries(params)
    .filter(([k, v]) => typeof v === 'boolean' && v)
    .map(([k]) => k.replace(/^(is|has)/, ''));
  const typeMeta = CONTRACT_TYPES.find(t => t.id === type);

  const handleEditorDidMount = (editor, monaco) => {
    if (!code) return;
    const model = editor.getModel();
    const markers = [];
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
      let match = line.match(/tx\.origin/);
      if (match) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          message: 'Avoid using tx.origin for authorization due to phishing risks. Prefer msg.sender.',
          startLineNumber: i + 1,
          startColumn: match.index + 1,
          endLineNumber: i + 1,
          endColumn: match.index + 1 + match[0].length,
        });
      }
      match = line.match(/selfdestruct/);
      if (match) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: 'selfdestruct is deprecated and considered dangerous.',
          startLineNumber: i + 1,
          startColumn: match.index + 1,
          endLineNumber: i + 1,
          endColumn: match.index + 1 + match[0].length,
        });
      }
      match = line.match(/pragma solidity \^0\.8\.\d+;/);
      if (match) {
         markers.push({
          severity: monaco.MarkerSeverity.Info,
          message: 'Floating pragma detected. It is recommended to lock the compiler version for production deployments.',
          startLineNumber: i + 1,
          startColumn: match.index + 1,
          endLineNumber: i + 1,
          endColumn: match.index + 1 + match[0].length,
        });
      }
    });

    monaco.editor.setModelMarkers(model, "solidity-linter", markers);
  };

  const handleGenerateClick = async () => {
    await onGenerate();
    setActiveTab('code');
  };

  return (
    <div className="wz-card">
      <div className="wz-card-title">Review Your Contract</div>
      <div className="wz-card-sub">Verify all details before generating. Go back to make changes.</div>

      {code && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
          <button 
            onClick={() => setActiveTab('summary')} 
            style={{ background: 'none', border: 'none', color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '8px 12px', transition: 'color 0.2s', borderBottom: activeTab === 'summary' ? '2px solid var(--primary)' : '2px solid transparent' }}
          >
            Configuration Summary
          </button>
          <button 
            onClick={() => setActiveTab('code')} 
            style={{ background: 'none', border: 'none', color: activeTab === 'code' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '8px 12px', transition: 'color 0.2s', borderBottom: activeTab === 'code' ? '2px solid var(--primary)' : '2px solid transparent' }}
          >
            Smart Contract Code
          </button>
        </div>
      )}

      {activeTab === 'summary' && (
        <div style={{ background: 'var(--surface-elevated)', border: '.5px solid var(--border-dark)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Contract Summary</div>
          <div className="wz-review-grid">
            <SummaryRow label="Type"        value={typeMeta?.name} />
            <SummaryRow label="Name"        value={params.name} />
            <SummaryRow label="Symbol"      value={params.symbol} />
            <SummaryRow label="Supply"      value={params.supply && Number(params.supply).toLocaleString()} />
            <SummaryRow label="Max Supply"  value={params.maxSupply && Number(params.maxSupply).toLocaleString()} />
            <SummaryRow label="Mint Price"  value={params.mintPrice && `${params.mintPrice} ETH`} />
            <SummaryRow label="Min Bid"     value={params.minimumBid && `${params.minimumBid} ETH`} />
            <SummaryRow label="Duration"    value={params.duration && `${Math.round(params.duration/3600)}h (${(params.duration/86400).toFixed(1)}d)`} />
            <SummaryRow label="Reserve"     value={params.reservePrice && `${params.reservePrice} ETH`} />
            <SummaryRow label="Item"        value={params.itemName} />
          </div>
          {features.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Enabled Features</div>
              <div className="wz-feature-chips">
                {features.map(f => <span key={f} className="wz-chip">{f}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {!code && activeTab === 'summary' && (
        <button className="btn btn-primary btn-lg magnetic-btn glass-btn" style={{ width: '100%' }} onClick={handleGenerateClick} disabled={isGenerating}>
          {isGenerating ? <><span className="wz-ds-spin" style={{ width: 16, height: 16 }} /> Compiling & Scanning…</> : <><Zap size={18} strokeWidth={2} /> Generate & Audit Contract</>}
        </button>
      )}
      
      {code && activeTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="wz-alert info" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', margin: 0 }}>
            <CheckCircle size={16} strokeWidth={2} /> Contract compiled & validated — ready for deployment. Switch to the <strong>Code</strong> tab to review.
          </div>
          {contractData?.ast && (
            <button 
              className="btn btn-secondary btn-md" 
              onClick={() => navigate('/ast', { state: { ast: contractData.ast } })}
              style={{ width: '100%', gap: 6 }}
            >
              <Network size={14} /> View AST Graph
            </button>
          )}
        </div>
      )}

      {activeTab === 'code' && code && (
        <div className="wz-code-preview" style={{ padding: 0, overflow: 'hidden', height: 400, border: '1px solid var(--outline)', borderRadius: 12, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              style={{ background: isEditing ? 'rgba(245,158,11,0.2)' : 'var(--surface)', border: isEditing ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--surface)', color: isEditing ? '#f59e0b' : 'var(--on-surface)', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--db-font)', fontWeight: 600 }}
            >
              {isEditing ? 'Disable Edit Mode' : 'Developer Edit Mode'}
            </button>
          </div>
          <Suspense fallback={<div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>Loading Editor...</div>}>
            <Editor
              height="400px"
              language="solidity"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(val) => { if(isEditing) setGeneratedCode(val); }}
              onMount={handleEditorDidMount}
              options={{
                readOnly: !isEditing,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'var(--db-mono)',
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 40, bottom: 16 }
              }}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
export default StepReview;

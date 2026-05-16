import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';
import { useWizardStore } from '../store/useWizardStore';
import { NETWORKS as CONTEXT_NETWORKS, useNetwork } from '../context/NetworkContext';
import { 
  Coins, Image as ImageIcon, Gavel, Wallet, ClipboardCheck, 
  Pickaxe, Save, Check, X, Zap, Flag, ExternalLink, 
  PartyPopper, CheckCircle, RotateCcw, Copy 
} from 'lucide-react';
import React, { Suspense, lazy } from 'react';

const Editor = lazy(() => import('@monaco-editor/react'));

const STEPS = ['Select Type', 'Parameters', 'Review', 'Deploy'];

export const CONTRACT_TYPES = [
  { id: 'ERC20',   icon: Coins, name: 'ERC-20 Token',   tag: 'Fungible',    desc: 'Mintable, burnable & pausable fungible tokens with tax and anti-whale support.' },
  { id: 'ERC721',  icon: ImageIcon, name: 'NFT Collection', tag: 'ERC-721',     desc: 'Full NFT collection with reveal mechanics, enumerable supply and IPFS metadata.' },
  { id: 'Auction', icon: Gavel, name: 'Auction',        tag: 'English Bid', desc: 'Trustless on-chain auction with reserve price, anti-snipe and time extension.' },
];

export const NETWORKS = Object.values(CONTEXT_NETWORKS).map(n => ({
  id: n.key,
  name: n.name,
  color: n.color,
  explorer: n.explorer
}));

export const API_ENDPOINT  = { ERC20: '/api/token/generate-token', ERC721: '/api/nft/generate',    Auction: '/api/auction/generate' };
export const SAVE_ENDPOINT = { ERC20: '/api/token/save-token',     ERC721: '/api/nft/save',         Auction: '/api/auction/save' };

/* ── Validate ─────────────────────────────────────────── */
export function validate(type, params) {
  const e = {};
  if (type === 'ERC20') {
    if (!params.name?.trim())   e.name   = 'Required';
    if (!params.symbol?.trim()) e.symbol = 'Required';
    if (!params.supply || Number(params.supply) <= 0) e.supply = 'Must be positive';
    if (params.hasTax && (isNaN(+params.taxRate) || +params.taxRate < 0 || +params.taxRate > 25)) e.taxRate = '0–25%';
  }
  if (type === 'ERC721') {
    if (!params.name?.trim())   e.name   = 'Required';
    if (!params.symbol?.trim()) e.symbol = 'Required';
    if (!params.maxSupply || Number(params.maxSupply) <= 0) e.maxSupply = 'Must be positive';
    if (isNaN(+params.mintPrice)) e.mintPrice = 'Invalid';
  }
  if (type === 'Auction') {
    if (!params.name?.trim())     e.name     = 'Required';
    if (!params.itemName?.trim()) e.itemName = 'Required';
    if (+params.duration < 60)   e.duration = 'Min 60s';
    if (isNaN(+params.minimumBid)) e.minimumBid = 'Invalid';
  }
  return e;
}

/* ── Stepper ──────────────────────────────────────────── */
export function Stepper({ current }) {
  return (
    <div className="wz-stepper">
      {STEPS.map((label, i) => {
        const s = i < current ? 'done' : i === current ? 'active' : '';
        return (
          <div key={label} className="wz-step" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div className="wz-step-inner">
              <div className={`wz-step-circle ${s}`}>{i < current ? <Check size={14} strokeWidth={3} /> : i + 1}</div>
              <div className={`wz-step-label ${s}`}>{label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="wz-connector">
                <div className="wz-connector-fill" style={{ width: i < current ? '100%' : '0%' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Type Select ──────────────────────────────── */
export function StepType({ selected, onSelect }) {
  return (
    <div className="wz-card">
      <div className="wz-card-title">What would you like to create?</div>
      <div className="wz-card-sub">Choose a contract type. Your progress auto-saves so you can return anytime.</div>
      <div className="wz-type-grid">
        {CONTRACT_TYPES.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.id} className={`wz-type-card${selected === t.id ? ' selected' : ''}`} onClick={() => onSelect(t.id)}>
              <span className="wz-type-icon"><Icon size={32} strokeWidth={1.5} /></span>
              <div className="wz-type-name">{t.name}</div>
              <div className="wz-type-desc">{t.desc}</div>
              <span className="wz-type-tag">{t.tag}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Parameters ───────────────────────────────── */
function Field({ label, required, hint, error, children, span2 }) {
  return (
    <div className={`wz-field${span2 ? ' span2' : ''}`}>
      <label className="wz-label">{label}{required && <span>*</span>}</label>
      {children}
      {hint  && <span className="wz-hint">{hint}</span>}
      {error && <span className="wz-error-msg">{error}</span>}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className={`wz-toggle${value ? ' on' : ''}`} onClick={() => onChange(!value)}>
      <div className="wz-toggle-knob" />
      <span className="wz-toggle-name">{label}</span>
    </div>
  );
}

function Inp({ params, k, placeholder, type = 'text', onChange, errors }) {
  return (
    <input
      className={`wz-input${errors[k] ? ' error' : ''}`}
      value={params[k] ?? ''}
      onChange={e => onChange({ ...params, [k]: e.target.value })}
      placeholder={placeholder} type={type}
    />
  );
}

export function StepParams({ type, params, onChange, errors }) {
  const I = (k, ph, t) => <Inp params={params} k={k} placeholder={ph} type={t} onChange={onChange} errors={errors} />;
  const T = (k, l) => <Toggle key={k} label={l} value={!!params[k]} onChange={v => onChange({ ...params, [k]: v })} />;

  return (
    <div className="wz-card">
      <div className="wz-card-title">Configure Parameters</div>
      <div className="wz-card-sub">
        {type === 'ERC20'   && 'Configure your ERC-20 fungible token.'}
        {type === 'ERC721'  && 'Configure your NFT collection.'}
        {type === 'Auction' && 'Configure your auction contract.'}
      </div>

      {type === 'ERC20' && <>
        <div className="wz-field-grid">
          <Field label="Token Name" required error={errors.name}>{I('name','e.g. My Token')}</Field>
          <Field label="Symbol" required error={errors.symbol}>{I('symbol','e.g. MTK')}</Field>
          <Field label="Total Supply" required error={errors.supply}>{I('supply','1000000','number')}</Field>
          <Field label="Decimals" hint="Standard is 18">{I('decimals','18','number')}</Field>
        </div>
        <div className="wz-toggles-title">Optional Features</div>
        <div className="wz-toggle-grid">
          {[['isMintable','Mintable'],['isBurnable','Burnable'],['isPausable','Pausable'],['isCapped','Capped'],['hasAntiWhale','Anti-Whale'],['hasTax','Tax']].map(([k,l]) => T(k,l))}
        </div>
        {params.hasTax && <div className="wz-field-grid"><Field label="Tax Rate (%)" required hint="0–25" error={errors.taxRate}>{I('taxRate','2','number')}</Field></div>}
      </>}

      {type === 'ERC721' && <>
        <div className="wz-field-grid">
          <Field label="Collection Name" required error={errors.name}>{I('name','e.g. Cool Apes')}</Field>
          <Field label="Symbol" required error={errors.symbol}>{I('symbol','e.g. APE')}</Field>
          <Field label="Max Supply" required error={errors.maxSupply}>{I('maxSupply','10000','number')}</Field>
          <Field label="Mint Price (ETH)" required error={errors.mintPrice}>{I('mintPrice','0.05')}</Field>
          <Field label="Base URI" hint="IPFS prefix" span2>{I('baseURI','ipfs://...')}</Field>
        </div>
        <div className="wz-toggles-title">Optional Features</div>
        <div className="wz-toggle-grid">
          {[['isBurnable','Burnable'],['isEnumerable','Enumerable'],['isRevealed','Reveal Mechanic']].map(([k,l]) => T(k,l))}
        </div>
      </>}

      {type === 'Auction' && <>
        <div className="wz-field-grid">
          <Field label="Auction Name" required error={errors.name}>{I('name','e.g. Rare Item Auction')}</Field>
          <Field label="Item Name" required error={errors.itemName}>{I('itemName','e.g. Rare Sword')}</Field>
          <Field label="Duration (seconds)" required hint="86400 = 1 day" error={errors.duration}>{I('duration','86400','number')}</Field>
          <Field label="Minimum Bid (ETH)" required error={errors.minimumBid}>{I('minimumBid','0.01')}</Field>
          <Field label="Reserve Price (ETH)" hint="Optional">{I('reservePrice','0.5')}</Field>
          <Field label="Item Description" hint="Optional">{I('itemDescription','Describe the item...')}</Field>
        </div>
        <div className="wz-toggles-title">Optional Features</div>
        <div className="wz-toggle-grid">
          {[['hasExtension','Time Extension'],['hasAntiSnipe','Anti-Snipe']].map(([k,l]) => T(k,l))}
        </div>
      </>}
    </div>
  );
}

/* ── Step 3: Review ───────────────────────────────────── */
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
  const { setGeneratedCode } = useWizardStore();
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const features = Object.entries(params).filter(([k, v]) => typeof v === 'boolean' && v).map(([k]) => k.replace(/^(is|has)/, ''));
  const typeMeta = CONTRACT_TYPES.find(t => t.id === type);

  // Advanced inline linting for Monaco
  const handleEditorDidMount = (editor, monaco) => {
    if (!code) return;
    const model = editor.getModel();
    
    // Simple regex-based linting for common Solidity anti-patterns
    const markers = [];
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
      // Check for tx.origin
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
      // Check for selfdestruct
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
      // Check for pragma solidity ^0.8.0 (Recommend fixing versions)
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
    // Only switch to code tab if generation actually succeeded, handled manually by user usually, but we can optimistically switch.
    // The parent manages state, so we can just let them click it or auto-switch.
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
            style={{ background: 'none', border: 'none', color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '4px 8px', transition: 'color 0.2s', borderBottom: activeTab === 'summary' ? '2px solid var(--primary)' : '2px solid transparent' }}
          >
            Configuration Summary
          </button>
          <button 
            onClick={() => setActiveTab('code')} 
            style={{ background: 'none', border: 'none', color: activeTab === 'code' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '4px 8px', transition: 'color 0.2s', borderBottom: activeTab === 'code' ? '2px solid var(--primary)' : '2px solid transparent' }}
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
         <div className="wz-alert info" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)' }}>
           <CheckCircle size={16} strokeWidth={2} /> Contract compiled & validated — ready for deployment. Switch to the <strong>Code</strong> tab to review.
         </div>
      )}

      {activeTab === 'code' && code && (
        <div className="wz-code-preview" style={{ padding: 0, overflow: 'hidden', height: 400, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              style={{ background: isEditing ? 'rgba(245,158,11,0.2)' : 'var(--surface)', border: isEditing ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--surface)', color: isEditing ? '#f59e0b' : '#e2e8f0', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--db-font)', fontWeight: 600 }}
            >
              {isEditing ? 'Disable Edit Mode' : 'Developer Edit Mode'}
            </button>
          </div>
          <Suspense fallback={<div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>Loading Editor...</div>}>
            <Editor
              height="400px"
              language="solidity"
              theme="vs-dark"
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

/* ── Step 4: Deploy ───────────────────────────────────── */
const DEPLOY_STEPS_DEF = [
  { id: 'wallet',  icon: Wallet, name: 'Connect Wallet',      sub: 'Authorise MetaMask to sign' },
  { id: 'confirm', icon: ClipboardCheck, name: 'Confirm Transaction', sub: 'Review & approve in MetaMask' },
  { id: 'mine',    icon: Pickaxe, name: 'Mining Block',        sub: 'Waiting for on-chain confirmation' },
  { id: 'save',    icon: Save, name: 'Saving to Registry',  sub: 'Persisting to your account' },
];

export function StepDeploy({ type, params, contractData, code, onSuccess }) {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { walletAddress, connectWallet } = useWallet();
  const { setDeployResult, setDeployError, clearDeployError, addDeployedContract, session } = useWizardStore();
  const { selectedNetwork } = useNetwork();

  const [activeStep, setActiveStep] = useState(null);
  const [doneSteps, setDoneSteps]   = useState([]);
  const [errorStep, setErrorStepLocal] = useState(null);
  const [selNet, setSelNet]         = useState(selectedNetwork || 'sepolia');
  const [minedContract, setMinedContract] = useState(null); // { address, txHash, txData, constructorArgs }

  const deployResult = session.deployResult;
  const deployError  = session.deployError;

  const markDone  = id => setDoneSteps(p => [...p, id]);
  const stepState = id => errorStep === id ? 'error' : doneSteps.includes(id) ? 'done' : activeStep === id ? 'active' : '';

  const netMeta = NETWORKS.find(n => n.id === selNet) || NETWORKS[0];

  const handleDeploy = useCallback(async () => {
    if (!walletAddress) { toast.error('Connect your wallet first'); return; }
    if (!contractData?.abi) { toast.error('Generate the contract first'); return; }
    if (!contractData?.bytecode) { toast.error('Contract bytecode expired after page refresh. Please go back and regenerate.'); return; }

    // If we already mined but save failed, retry only the save step
    if (minedContract && errorStep === 'save') {
      setErrorStepLocal(null);
      clearDeployError();
      setActiveStep('save');
      try {
        const { address, txHash, txData, constructorArgs } = minedContract;
        const base = {
          contractAddress: address,
          ownerAddress: walletAddress,
          network: selNet.toLowerCase(),
          abi: contractData.abi,
          sourceCode: code,
          compilerVersion: 'v0.8.20+commit.a1b79de6',
          constructorArgs
        };
        const payload = type === 'ERC20'
          ? { ...base, name: params.name, symbol: params.symbol }
          : type === 'ERC721'
          ? { ...base, name: params.name, symbol: params.symbol, maxSupply: Number(params.maxSupply), mintPrice: params.mintPrice, baseURI: params.baseURI }
          : { ...base, name: params.name, itemName: params.itemName, itemDescription: params.itemDescription, duration: Number(params.duration), minimumBid: params.minimumBid };

        const saveRes  = await authFetch(SAVE_ENDPOINT[type], { method: 'POST', body: JSON.stringify(payload) });
        const saveData = await saveRes.json();
        if (!saveData.success) throw new Error(saveData.error || 'Save failed');

        const result = { address, txHash, network: selNet, type, name: params.name, savedAt: Date.now() };
        setDeployResult(result);
        addDeployedContract(result);
        setMinedContract(null);
        setActiveStep(null);
        onSuccess(result);
        toast.success('Contract deployed!');
      } catch (err) {
        const msg = err.shortMessage || err.message || 'Save failed';
        setErrorStepLocal('save');
        setActiveStep(null);
        setDeployError(msg);
        toast.error(msg);
      }
      return;
    }

    // Full deploy flow
    setDoneSteps([]); setErrorStepLocal(null); clearDeployError(); setMinedContract(null);

    try {
      setActiveStep('wallet');
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Switch MetaMask to the selected network before deploying
      const targetNetwork = Object.values(CONTEXT_NETWORKS).find(n => n.key === selNet);
      if (targetNetwork) {
        const currentNetwork = await provider.getNetwork();
        const targetChainId = BigInt(targetNetwork.chainIdDecimal);
        if (currentNetwork.chainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetNetwork.chainId }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: targetNetwork.chainId,
                    chainName: targetNetwork.name,
                    rpcUrls: [targetNetwork.rpcUrl],
                    blockExplorerUrls: [targetNetwork.explorer],
                    nativeCurrency: {
                      name: targetNetwork.currency,
                      symbol: targetNetwork.currencySymbol,
                      decimals: 18,
                    },
                  }],
                });
              } catch (addError) {
                throw new Error(`Failed to add ${targetNetwork.name} to MetaMask. Please add it manually.`);
              }
            } else if (switchError.code === 4001) {
              throw new Error(`Network switch rejected. Please switch to ${targetNetwork.name} in MetaMask.`);
            } else {
              throw switchError;
            }
          }
        }
      }

      const signer   = await provider.getSigner();
      markDone('wallet');

      setActiveStep('confirm');
      const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, signer);
      let args = [];
      if (type === 'ERC20')   args = [walletAddress, BigInt(params.supply || 0) * BigInt(10 ** 18)];
      if (type === 'ERC721')  args = [walletAddress, Number(params.maxSupply||10000), params.baseURI||'', ethers.parseEther(params.mintPrice||'0')];
      if (type === 'Auction') args = [walletAddress, Number(params.duration||86400), ethers.parseEther(params.minimumBid||'0.01'), params.itemName||'', params.itemDescription||''];

      const contract = await factory.deploy(...args);
      const txHash   = contract.deploymentTransaction()?.hash || '';
      markDone('confirm');

      setActiveStep('mine');
      await contract.waitForDeployment();
      const addr = await contract.getAddress();
      markDone('mine');

      // Store mined contract info for potential save retry
      const txData = contract.deploymentTransaction()?.data || '';
      let constructorArgs = '';
      const bytecode = contractData.bytecode;
      const strippedTxData = txData.startsWith('0x') ? txData.slice(2) : txData;
      const strippedBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
      if (strippedTxData.startsWith(strippedBytecode)) {
        constructorArgs = strippedTxData.slice(strippedBytecode.length);
      }
      setMinedContract({ address: addr, txHash, txData, constructorArgs });

      setActiveStep('save');
      
      const base = { 
        contractAddress: addr, 
        ownerAddress: walletAddress, 
        network: selNet.toLowerCase(), 
        abi: contractData.abi,
        sourceCode: code,
        compilerVersion: 'v0.8.20+commit.a1b79de6',
        constructorArgs
      };
      const payload = type === 'ERC20'
        ? { ...base, name: params.name, symbol: params.symbol }
        : type === 'ERC721'
        ? { ...base, name: params.name, symbol: params.symbol, maxSupply: Number(params.maxSupply), mintPrice: params.mintPrice, baseURI: params.baseURI }
        : { ...base, name: params.name, itemName: params.itemName, itemDescription: params.itemDescription, duration: Number(params.duration), minimumBid: params.minimumBid };

      const saveRes  = await authFetch(SAVE_ENDPOINT[type], { method: 'POST', body: JSON.stringify(payload) });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.error || 'Save failed');
      markDone('save');

      const result = { address: addr, txHash, network: selNet, type, name: params.name, savedAt: Date.now() };
      setDeployResult(result);
      addDeployedContract(result);
      setMinedContract(null);
      setActiveStep(null);
      onSuccess(result);
      toast.success('Contract deployed!');
    } catch (err) {
      const msg = err.shortMessage || err.message || 'Deployment failed';
      // Preserve completed steps — don't reset wallet/confirm/mine if save fails
      setErrorStepLocal('save');
      setActiveStep(null);
      setDeployError(msg);
      toast.error(msg);
    }
  }, [walletAddress, contractData, params, type, selNet, authFetch, code, minedContract, errorStep]);

  /* ── Success Screen ─────────────────────────────────── */
  if (deployResult) {
    const explorerUrl = `${netMeta.explorer}/address/${deployResult.address}`;
    return (
      <div className="wz-card">
        <div className="wz-success">
          <div className="wz-success-icon"><PartyPopper size={52} strokeWidth={1.5} color="var(--primary)" /></div>
          <div className="wz-success-title">Contract Deployed Successfully!</div>
          <div className="wz-success-sub">Your contract is live on <strong>{deployResult.network}</strong>.</div>
          <div className="wz-success-addr">{deployResult.address}</div>
          {deployResult.txHash && (
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
              Tx: {deployResult.txHash.slice(0,18)}...
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={explorerUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              View on Explorer <ExternalLink size={14} strokeWidth={2} />
            </a>
            <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(deployResult.address); toast.success('Copied'); }}>
              Copy Address <Copy size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Deploy Form ────────────────────────────────────── */
  return (
    <div className="wz-card">
      <div className="wz-card-title">Deploy Contract</div>
      <div className="wz-card-sub">Select a network, connect wallet, and deploy on-chain.</div>

      {/* Error banner with retry */}
      {deployError && (
        <div className="wz-alert error" style={{ marginBottom: 18, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ fontWeight: 700 }}><X size={14} strokeWidth={3} /> Deployment Failed</div>
          <div style={{ fontSize: 11 }}>{deployError}</div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => { setErrorStepLocal(null); clearDeployError(); }}>
            <RotateCcw size={12} strokeWidth={2} /> Retry
          </button>
        </div>
      )}

      {/* Network selector */}
      <div className="wz-review-label" style={{ marginBottom: 10 }}>Network</div>
      <div className="wz-net-strip">
        {NETWORKS.map(n => (
          <div key={n.id} className={`wz-net-opt${selNet === n.id ? ' sel' : ''}`} onClick={() => setSelNet(n.id)}>
            <div className="wz-net-dot" style={{ background: n.color }} />{n.name}
          </div>
        ))}
      </div>

      {/* Wallet */}
      <div className="wz-wallet-banner">
        <div className="wz-wallet-icon"><Wallet size={22} strokeWidth={1.5} color="var(--primary)" /></div>
        <div className="wz-wallet-info">
          <div className="wz-wallet-label">Connected Wallet</div>
          <div className="wz-wallet-addr">{walletAddress ? `${walletAddress.slice(0,8)}...${walletAddress.slice(-6)}` : 'Not connected'}</div>
        </div>
        {!walletAddress && <button className="wz-wallet-connect" onClick={connectWallet}>Connect</button>}
      </div>

      {/* Progress steps */}
      <div className="wz-deploy-steps">
        {DEPLOY_STEPS_DEF.map(s => {
          const Icon = stepState(s.id) === 'done' ? Check : stepState(s.id) === 'error' ? X : s.icon;
          return (
            <div key={s.id} className={`wz-ds ${stepState(s.id)}`}>
              <div className="wz-ds-icon"><Icon size={16} strokeWidth={2} /></div>
              <div className="wz-ds-text">
                <div className="wz-ds-name">{s.name}</div>
                <div className="wz-ds-sub">{s.sub}</div>
              </div>
              {stepState(s.id) === 'active' && <div className="wz-ds-spin" />}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="btn btn-primary btn-lg magnetic-btn glass-btn"
          style={{ width: '100%' }}
          onClick={handleDeploy}
          disabled={!walletAddress || !contractData?.abi || !!activeStep}
        >
          {activeStep
            ? <><span className="wz-ds-spin" style={{ width: 16, height: 16 }} /> Deploying…</>
            : <><Zap size={18} strokeWidth={2} /> Deploy Contract</>}
        </button>
        <button
          className="btn btn-ghost btn-md glass-btn"
          style={{ width: '100%' }}
          onClick={() => navigate('/audit', { state: { code: contractData?.sourceCode || '', type } })}
          disabled={!contractData?.abi || !!activeStep}
        >
          <Flag size={16} strokeWidth={2} /> Optional: Run AI Audit
        </button>
      </div>
    </div>
  );
}

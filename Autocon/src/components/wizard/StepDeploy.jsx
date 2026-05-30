import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../hooks/useWallet';
import { useWizardStore } from '../../store/useWizardStore';
import { NETWORKS as CONTEXT_NETWORKS, useNetwork } from '../../context/NetworkContext';
import { saveContract } from '../../services/contractApi';
import { NETWORKS, DEPLOY_STEPS_DEF } from '../../constants/contract';
import { 
  Wallet, ClipboardCheck, Pickaxe, Save, Check, X, Zap, Flag, 
  ExternalLink, PartyPopper, RotateCcw, Copy, Network 
} from 'lucide-react';

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
        const { address, txHash, constructorArgs } = minedContract;
        const base = {
          contractAddress: address,
          ownerAddress: walletAddress,
          network: selNet.toLowerCase(),
          abi: contractData.abi,
          sourceCode: code,
          contractName: contractData.contractName,
          sourceFile: contractData.sourceFile,
          compilerVersion: contractData.compilerVersion || 'v0.8.35+commit.47b9dedd',
          constructorArgs
        };
        const payload = type === 'ERC20'
          ? { ...base, name: params.name, symbol: params.symbol }
          : type === 'ERC721'
          ? { ...base, name: params.name, symbol: params.symbol, maxSupply: Number(params.maxSupply), mintPrice: params.mintPrice, baseURI: params.baseURI }
          : { ...base, name: params.name, itemName: params.itemName, itemDescription: params.itemDescription, duration: Number(params.duration), minimumBid: params.minimumBid };

        await saveContract(authFetch, type, payload);

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
                      name: targetNetwork.name,
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
      if (type === 'ERC20')   args = [walletAddress, BigInt(params.supply || 0)];
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
        contractName: contractData.contractName,
        sourceFile: contractData.sourceFile,
        compilerVersion: contractData.compilerVersion || 'v0.8.35+commit.47b9dedd',
        constructorArgs
      };
      const payload = type === 'ERC20'
        ? { ...base, name: params.name, symbol: params.symbol }
        : type === 'ERC721'
        ? { ...base, name: params.name, symbol: params.symbol, maxSupply: Number(params.maxSupply), mintPrice: params.mintPrice, baseURI: params.baseURI }
        : { ...base, name: params.name, itemName: params.itemName, itemDescription: params.itemDescription, duration: Number(params.duration), minimumBid: params.minimumBid };

      await saveContract(authFetch, type, payload);
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
      setErrorStepLocal('save');
      setActiveStep(null);
      setDeployError(msg);
      toast.error(msg);
    }
  }, [walletAddress, contractData, params, type, selNet, authFetch, code, minedContract, errorStep, clearDeployError, setDeployResult, addDeployedContract, setDeployError, onSuccess]);

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

  const stepIconMap = {
    wallet: Wallet,
    confirm: ClipboardCheck,
    mine: Pickaxe,
    save: Save
  };

  /* ── Deploy Form ────────────────────────────────────── */
  return (
    <div className="wz-card">
      <div className="wz-card-title">Deploy Contract</div>
      <div className="wz-card-sub">Select a network, connect wallet, and deploy on-chain.</div>

      {deployError && (
        <div className="wz-alert error" style={{ marginBottom: 18, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ fontWeight: 700 }}><X size={14} strokeWidth={3} /> Deployment Failed</div>
          <div style={{ fontSize: 11 }}>{deployError}</div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => { setErrorStepLocal(null); clearDeployError(); }}>
            <RotateCcw size={12} strokeWidth={2} /> Retry
          </button>
        </div>
      )}

      <div className="wz-review-label" style={{ marginBottom: 10 }}>Network</div>
      <div className="wz-net-strip">
        {NETWORKS.map(n => (
          <div key={n.id} className={`wz-net-opt${selNet === n.id ? ' sel' : ''}`} onClick={() => setSelNet(n.id)}>
            <div className="wz-net-dot" style={{ background: n.color }} />{n.name}
          </div>
        ))}
      </div>

      <div className="wz-wallet-banner">
        <div className="wz-wallet-icon"><Wallet size={22} strokeWidth={1.5} color="var(--primary)" /></div>
        <div className="wz-wallet-info">
          <div className="wz-wallet-label">Connected Wallet</div>
          <div className="wz-wallet-addr">{walletAddress ? `${walletAddress.slice(0,8)}...${walletAddress.slice(-6)}` : 'Not connected'}</div>
        </div>
        {!walletAddress && <button className="wz-wallet-connect" onClick={connectWallet}>Connect</button>}
      </div>

      <div className="wz-deploy-steps">
        {DEPLOY_STEPS_DEF.map(s => {
          const IconComponent = stepIconMap[s.id];
          const Icon = stepState(s.id) === 'done' ? Check : stepState(s.id) === 'error' ? X : IconComponent;
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
        {contractData?.ast && (
          <button
            className="btn btn-ghost btn-md glass-btn"
            style={{ width: '100%', gap: 6 }}
            onClick={() => navigate('/ast', { state: { ast: contractData.ast } })}
            disabled={!!activeStep}
          >
            <Network size={16} strokeWidth={2} /> View AST Graph
          </button>
        )}
      </div>
    </div>
  );
}
export default StepDeploy;

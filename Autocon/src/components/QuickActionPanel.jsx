import { useEffect, useState } from 'react';
import { ethers }             from 'ethers';
import { detectQuickActions } from '../utils/abiDetector';
import { useQuickActions }    from '../hooks/useQuickActions';
import ActionCard             from './ActionCard';
import { useWallet }          from '../hooks/useWallet';
import { Zap }                from 'lucide-react';

/**
 * QuickActionPanel — auto-detects and renders high-value write functions from ABI.
 * Performs an owner() check to show ownership warnings on each card.
 */
export default function QuickActionPanel({ contractAddress, abi }) {
  const { walletAddress }    = useWallet();
  const actions              = detectQuickActions(abi);
  const { txResults, execute, estimateGas } = useQuickActions(contractAddress, abi);
  const [isOwner, setIsOwner] = useState(null); // null = indeterminate

  // Check owner() if ABI exposes it
  useEffect(() => {
    if (!contractAddress || !abi || !walletAddress) return;
    const ownerFn = abi.find(fn =>
      fn.type === 'function' && fn.name === 'owner' && fn.inputs?.length === 0
    );
    if (!ownerFn) return; // no owner() — skip

    (async () => {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const owner    = await contract.owner();
        setIsOwner(owner.toLowerCase() === walletAddress.toLowerCase());
      } catch {
        setIsOwner(null); // indeterminate — don't block
      }
    })();
  }, [contractAddress, abi, walletAddress]);

  if (!actions.length) return null;

  return (
    <div className="flex flex-col gap-4 mt-10">
      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--outline-variant)' }}>
        <Zap className="h-4 w-4" style={{ color: '#a78bfa' }} />
        <h2 className="text-base font-bold" style={{ color: 'var(--on-surface)' }}>
          Quick Actions
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
          {actions.length} function{actions.length !== 1 ? 's' : ''} detected
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map(fn => (
          <ActionCard
            key={fn.name}
            fn={fn}
            onExecute={execute}
            onEstimateGas={estimateGas}
            result={txResults[fn.name]}
            walletAddress={walletAddress}
            isOwner={isOwner}
          />
        ))}
      </div>
    </div>
  );
}

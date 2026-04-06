import { useVerification } from '../hooks/useVerification';
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';

const ENABLED = import.meta.env.VITE_ETHERSCAN_ENABLED === 'true';

/**
 * VerifyButton — submits contract source to Etherscan for verification.
 * Only renders when VITE_ETHERSCAN_ENABLED=true.
 */
export default function VerifyButton({
  contractAddress,
  contractName,
  sourceCode,
  compilerVersion,
  abi,
  constructorArgs,
  network = 'sepolia'
}) {
  const { status, reason, verify } = useVerification();

  if (!ENABLED) return null;

  const handleClick = () => {
    if (status === 'submitting' || status === 'pass') return;
    if (!contractAddress || !sourceCode) return;
    verify({ contractAddress, contractName, sourceCode, compilerVersion, abi, constructorArgs, network });
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={status === 'submitting' || status === 'pass'}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
        style={{
          background: 'var(--surface)',
          color: 'var(--on-surface)',
          border: '1px solid var(--outline-variant)',
          cursor: (status === 'submitting' || status === 'pass') ? 'not-allowed' : 'pointer'
        }}
      >
        {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === 'pass'       && <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />}
        {status === 'fail'       && <XCircle className="h-4 w-4" style={{ color: '#ef4444' }} />}
        {status === 'timeout'    && <XCircle className="h-4 w-4" style={{ color: '#f59e0b' }} />}
        {status === 'idle'       && <ShieldCheck className="h-4 w-4" />}

        {status === 'idle'       ? 'Verify on Etherscan'   : null}
        {status === 'submitting' ? 'Submitting…'           : null}
        {status === 'pass'       ? 'Verified ✓'            : null}
        {status === 'fail'       ? 'Verification failed'   : null}
        {status === 'timeout'    ? 'Timed out'             : null}
      </button>

      {reason && (
        <p className="text-xs" style={{ color: 'var(--outline)' }}>{reason}</p>
      )}
    </div>
  );
}

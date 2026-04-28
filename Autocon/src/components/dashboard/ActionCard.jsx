import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';

function buildArgState(inputs) {
  return inputs.reduce((acc, inp) => ({ ...acc, [inp.name || inp.type]: '' }), {});
}

/**
 * ActionCard — renders a single contract write function as an interactive card.
 * Shows live gas estimate, argument inputs, execution state, and results.
 */
export default function ActionCard({ fn, onExecute, onEstimateGas, result, walletAddress, isOwner }) {
  const [argValues, setArgValues] = useState(() => buildArgState(fn.inputs));
  const [gasEst,    setGasEst]    = useState(null);
  const debounceRef               = useRef(null);

  const args = fn.inputs.map(inp => argValues[inp.name || inp.type]);

  const argsKey = JSON.stringify(argValues);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const gas = await onEstimateGas(fn.name, args);
      setGasEst(gas);
    }, 600);
    return () => clearTimeout(debounceRef.current);
  
  }, [argsKey]);

  const canExecute = isOwner !== false && result?.status !== 'pending';

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-4"
      style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>
          {fn.name}()
        </span>
        {gasEst && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--outline)' }}>
            <Zap className="h-3 w-3" />
            ~{Number(gasEst).toLocaleString()} gas
          </span>
        )}
      </div>

      {/* Argument inputs */}
      {fn.inputs.map(inp => (
        <div key={inp.name || inp.type} className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--outline)' }}>
            {inp.name || inp.type}{' '}
            <span className="font-mono opacity-70">({inp.type})</span>
          </label>
          <input
            type="text"
            placeholder={inp.type}
            value={argValues[inp.name || inp.type] ?? ''}
            onChange={e =>
              setArgValues(prev => ({ ...prev, [inp.name || inp.type]: e.target.value }))
            }
            className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
            style={{
              background:   'var(--bg)',
              borderColor:  'var(--outline-variant)',
              color:        'var(--on-surface)'
            }}
          />
        </div>
      ))}

      {/* Wallet context */}
      {walletAddress && (
        <p className="text-xs" style={{ color: 'var(--outline)' }}>
          Executing as: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </p>
      )}

      {isOwner === false && (
        <p className="text-xs" style={{ color: '#f59e0b' }}>
          ⚠ Only the contract owner can call this function.
        </p>
      )}

      {/* Execute button */}
      <button
        onClick={() => canExecute && onExecute(fn.name, args)}
        disabled={!canExecute}
        className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
          color: 'var(--surface)',
          cursor: canExecute ? 'pointer' : 'not-allowed'
        }}
      >
        {result?.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
        {result?.status === 'pending' ? 'Executing…' : `Execute ${fn.name}()`}
      </button>

      {/* Results */}
      {result?.status === 'success' && (
        <div className="flex items-center gap-2 text-xs" style={{ color: '#10b981' }}>
          <CheckCircle className="h-3 w-3" />
          Success — {result.hash?.slice(0, 12)}…
        </div>
      )}

      {result?.status === 'error' && (
        <div className="flex items-start gap-2 text-xs" style={{ color: '#f87171' }}>
          <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{result.error}</span>
        </div>
      )}
    </div>
  );
}

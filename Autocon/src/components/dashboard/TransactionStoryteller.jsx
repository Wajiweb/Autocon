import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { parseReceipt } from '../../hooks/useReceiptParser';

export default function TransactionStoryteller({ receipt, abi, provider }) {
  const [open,  setOpen]  = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (!receipt || !abi || !provider) return;
    parseReceipt(receipt, abi, provider).then(setSteps).catch(console.error);
  }, [receipt, abi, provider]);

  if (!receipt) return null;

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        <span>📖 Transaction Breakdown</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-4 pb-4">
            {steps.length === 0 ? (
              <p className="text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>
                Parsing transaction...
              </p>
            ) : steps.map((step, i) => (
              <div
                key={step.label}
                className="flex flex-col gap-1"
              >
                <span className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)' }}>
                  {step.label}
                </span>
                {step.type === 'hash' ? (
                  <code
                    className="break-all text-xs rounded px-2 py-1"
                    style={{ background: 'var(--surface-elevated)', color: '#666' }}
                  >
                    {step.value}
                  </code>
                ) : (
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {step.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

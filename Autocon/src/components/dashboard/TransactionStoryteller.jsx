import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      style={{ border: '1px solid var(--outline-variant)', background: 'var(--surface)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
        style={{ color: 'var(--on-surface)' }}
      >
        <span>📖 Transaction Breakdown</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              {steps.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: 'var(--outline)' }}>
                  Parsing transaction...
                </p>
              ) : steps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-1"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--outline)' }}>
                    {step.label}
                  </span>
                  {step.type === 'hash' ? (
                    <code
                      className="break-all text-xs rounded px-2 py-1"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#a78bfa' }}
                    >
                      {step.value}
                    </code>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--on-surface)' }}>
                      {step.value}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

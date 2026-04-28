import React, { useEffect, useState } from 'react';
import { Circle, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const STEPS = [
  'Compiling Smart Contract...',
  'Awaiting Wallet Signature...',
  'Broadcasting Transaction...',
  'Waiting for Block Confirmation...',
  'Deployment Successful!'
];

export default function DeploymentTimeline({ currentStep = 0, errorStep = -1, errorMessage = '' }) {
  return (
    <div className="flex flex-col w-full max-w-md mx-auto" style={{ fontFamily: '"Inter", sans-serif' }}>
      {STEPS.map((stepStr, idx) => {
        const isError    = errorStep === idx;
        const isCompleted = !isError && currentStep > idx;
        const isActive   = !isError && currentStep === idx;
        const isPending  = !isError && currentStep < idx;
        const isLast     = idx === STEPS.length - 1;

        const primary = 'var(--primary)';
        const success = '#28a745';
        const mutedLabel = 'var(--text-secondary)';
        const activeLabel = 'var(--text-primary)';

        return (
          <div key={idx} className="relative flex items-stretch">
            {!isLast && (
              <div 
                style={{
                  position: 'absolute',
                  left: '19px',
                  top: '36px',
                  bottom: '-8px',
                  width: '2px',
                  background: isCompleted ? success : '#eee',
                }}
              />
            )}

            <div
              className="relative z-10 flex items-center w-full rounded-xl"
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                background: isActive ? 'var(--surface)' : 'transparent',
                border: isActive ? `1px solid #ddd` : '1px solid transparent',
              }}
            >
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '38px' }}>
                {isCompleted && <CheckCircle2 size={22} color={success} />}
                {isActive && <Loader2 size={22} color={primary} />}
                {isPending && <Circle size={18} color="var(--border-dark)" strokeWidth={2} />}
                {isError && <AlertTriangle size={22} color="#dc3545" />}
              </div>

              <div 
                className="ml-3 font-medium"
                style={{
                  fontSize: isActive ? '0.95rem' : '0.85rem',
                  color: isError ? '#dc3545' : (isActive ? activeLabel : (isCompleted ? '#888' : mutedLabel)),
                }}
              >
                {stepStr}
                {isError && errorMessage && (
                  <div className="mt-1 text-xs font-normal" style={{ color: '#dc3545' }}>
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Mock Integration Wrapper
 * Simulates the 5-step flow taking roughly 15 seconds.
 * Exported separately so it can be dragged onto the Dashboard for immediate testing.
 */
export function MockDeploymentTimeline() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // A realistic blockchain sequence
    const timings = [
      0,      // Start
      2000,   // Wait 2s for "Compiling" to finish
      4000,   // Wait 4s for user to click "Sign" in MetaMask
      8000,   // Wait 8s for tx to broadcast across RPC mempool
      14000,  // Wait 14s for block confirmation
    ];

    const timers = timings.map((delay, idx) => {
      if (idx === 0) return null;
      return setTimeout(() => setStep(idx), delay);
    });

    return () => timers.forEach(t => t && clearTimeout(t));
  }, []);

  return (
    <div className="glass card p-6 mx-auto w-full max-w-md" style={{ background: '#080c14' }}>
      <h3 style={{ 
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '1.2rem',
        fontWeight: 700,
        color: 'var(--surface)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        Deploying Contract...
      </h3>
      <DeploymentTimeline currentStep={step} />
    </div>
  );
}

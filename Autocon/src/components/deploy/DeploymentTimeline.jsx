import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Loader2, CheckCircle2 } from 'lucide-react';

const STEPS = [
  'Compiling Smart Contract...',
  'Awaiting Wallet Signature...',
  'Broadcasting Transaction...',
  'Waiting for Block Confirmation...',
  'Deployment Successful!'
];

/**
 * DeploymentTimeline
 * A vertical stepper tracking blockchain contract deployments.
 * @param {number} currentStep - The active zero-indexed step (0 to 4).
 */
export default function DeploymentTimeline({ currentStep = 0 }) {
  return (
    <div className="flex flex-col w-full max-w-md mx-auto" style={{ fontFamily: '"Inter", sans-serif' }}>
      {STEPS.map((stepStr, idx) => {
        const isCompleted = currentStep > idx;
        const isActive = currentStep === idx;
        const isPending = currentStep < idx;
        const isLast = idx === STEPS.length - 1;

        // Colors per Kinetic Ether palette
        const primary = '#a78bfa'; // var(--primary)
        const success = '#10b981'; // var(--success)
        const mutedLabel = '#9ca3af'; // text-gray-400
        const activeLabel = '#ffffff';

        return (
          <div key={idx} className="relative flex items-stretch">
            {/* The vertical connector line - placed below the icon spanning downwards */}
            {!isLast && (
              <div 
                className="absolute"
                style={{
                  left: '19px', // Center of the 38px bounding box of the icon area
                  top: '36px',
                  bottom: '-8px',
                  width: '2px',
                  background: isCompleted ? success : 'rgba(255, 255, 255, 0.1)',
                  transition: 'background 0.4s ease'
                }}
              />
            )}

            {/* Container for Icon + Text, pulsing if active */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="relative z-10 flex items-center w-full rounded-xl"
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                // glass pane active glow
                background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                // pulse border for active
                border: isActive ? `1px solid rgba(167, 139, 250, 0.3)` : '1px solid transparent',
              }}
            >
              {/* Icon Area */}
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '38px' }}>
                <AnimatePresence mode="popLayout">
                  {isCompleted && (
                    <motion.div
                      key="completed"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 size={22} color={success} />
                    </motion.div>
                  )}
                  {isActive && (
                    <motion.div
                      key="active"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Loader2 
                        size={22} 
                        color={primary} 
                        style={{ animation: 'spin-slow 1.5s linear infinite' }} 
                      />
                    </motion.div>
                  )}
                  {isPending && (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Circle size={18} color="rgba(255,255,255,0.2)" strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text Area */}
              <div 
                className="ml-3 font-medium transition-all duration-300"
                style={{
                  fontSize: isActive ? '0.95rem' : '0.85rem',
                  color: isActive ? activeLabel : (isCompleted ? '#d1d5db' : mutedLabel),
                  textShadow: isActive ? `0 0 12px ${primary}80` : 'none',
                  letterSpacing: '0.01em'
                }}
              >
                {stepStr}
              </div>
            </motion.div>
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
        color: '#fff',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        Deploying Contract...
      </h3>
      <DeploymentTimeline currentStep={step} />
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Copy, ExternalLink, X, SearchCode, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useABIExport } from '../../hooks/useExport';
import TransactionStoryteller from '../TransactionStoryteller';

/**
 * DeploySuccessModal
 * Glassmorphic celebration modal shown after a successful contract deployment.
 *
 * @param {boolean}  isOpen       - Whether the modal is visible
 * @param {function} onClose      - Callback to dismiss
 * @param {string}   address      - Deployed contract address
 * @param {string}   network      - Network name (e.g. "Sepolia")
 * @param {string}   contractType - "Token" | "NFT" | "Auction"
 * @param {string}   explorerUrl  - Block-explorer base URL for the network
 */
export default function DeploySuccessModal({
  isOpen,
  onClose,
  address = '',
  network = 'Sepolia',
  contractType = 'Token',
  explorerUrl = 'https://sepolia.etherscan.io',
  abi = null,
  contractName = '',
  receipt = null,
  provider = null,
}) {
  const [copied, setCopied] = useState(false);
  const { downloadABI } = useABIExport();

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = address
    ? `${address.slice(0, 10)}...${address.slice(-8)}`
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '460px',
              background: 'var(--surface-high)',
              border: '1px solid var(--outline-variant)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.12)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--on-surface-variant)',
                transition: 'all 0.2s',
              }}
            >
              <X size={16} />
            </button>

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.15, damping: 12 }}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
                border: '2px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={36} color="#10b981" />
            </motion.div>

            <h2 style={{
              fontSize: '1.5rem', fontWeight: 800,
              color: 'var(--on-surface)', marginBottom: '6px',
              letterSpacing: '-0.02em'
            }}>
              {contractType} Deployed! 🎉
            </h2>
            <p style={{
              fontSize: '0.85rem', color: 'var(--on-surface-variant)',
              marginBottom: '24px'
            }}>
              Successfully deployed to <strong style={{ color: 'var(--primary)' }}>{network}</strong>
            </p>

            {/* Address Block */}
            <div
              onClick={copyAddress}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '14px 20px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--outline-variant)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '20px',
              }}
            >
              <code style={{
                fontSize: '0.85rem', fontWeight: 600,
                color: 'var(--tertiary)', fontFamily: 'monospace',
                letterSpacing: '0.02em',
              }}>
                {shortAddr}
              </code>
              <Copy size={14} color={copied ? '#10b981' : 'var(--on-surface-variant)'} />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <a
                href={`${explorerUrl}/address/${address}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1, minWidth: '120px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '12px',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  color: '#a78bfa', fontWeight: 600, fontSize: '0.82rem',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
              >
                <ExternalLink size={15} />
                View on Etherscan
              </a>

              {abi && contractName && (
                <button
                  onClick={() => downloadABI(abi, contractName)}
                  style={{
                    flex: '1 1 100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--outline-variant)',
                    color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <Download size={15} />
                  Download ABI
                </button>
              )}
            </div>

            {/* Transaction Storyteller */}
            {receipt && abi && provider && (
              <TransactionStoryteller receipt={receipt} abi={abi} provider={provider} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

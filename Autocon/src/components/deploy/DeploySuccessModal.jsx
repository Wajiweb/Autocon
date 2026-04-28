import { useState, useEffect } from 'react';
import { CheckCircle2, Copy, ExternalLink, X, SearchCode, Download, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useABIExport } from '../../hooks/useExport';
import TransactionStoryteller from '../dashboard/TransactionStoryteller';
import { API_BASE } from '../../config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  sourceCode = null,
  compilerVersion = null,
  constructorArgs = null,
}) {
  const [copied, setCopied] = useState(false);
  const [verifyState, setVerifyState] = useState('idle'); // idle, submitting, polling, verified, error
  const { downloadABI } = useABIExport();

  const pollVerificationStatus = async (net, guid) => {
    const maxAttempts = 20; // 20 * 4s = 80s timeout
    let attempts = 0;
    const token = localStorage.getItem('autocon_token');

    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_BASE}/api/verify/status/${encodeURIComponent(net)}/${guid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.isVerified) {
          clearInterval(poll);
          setVerifyState('verified');
          toast.success('Contract Verified on Explorer! 🛡️');
        } else if (!data.isPending) {
          // If it's not pending and not verified, it failed
          clearInterval(poll);
          setVerifyState('error');
          toast.error(data.status || 'Verification failed on Etherscan.');
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setVerifyState('error');
          toast.error('Verification status check timed out. Please check the explorer manually.');
        }
      } catch (err) {
        // Ignore intermittent network errors during polling
        console.error('Polling error:', err);
      }
    }, 4000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = address
    ? `${address.slice(0, 10)}...${address.slice(-8)}`
    : '';

  const handleVerify = async () => {
    if (!sourceCode || !compilerVersion) {
      toast.error('Missing source code or compiler version for verification.');
      return;
    }

    try {
      setVerifyState('submitting');
      const token = localStorage.getItem('autocon_token');

      const res = await fetch(`${API_BASE}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contractAddress: address,
          sourceCode,
          contractName,
          compilerVersion,
          network,
          constructorArguements: constructorArgs,
        }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Failed to submit verification request.');

      // Switch to polling UI and start interval
      setVerifyState('polling');
      pollVerificationStatus(network, data.guid);

    } catch (err) {
      console.error('[DeploySuccessModal] Verify error:', err);
      toast.error(err.message || 'Verification submission failed');
      setVerifyState('error');
    }
  };

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('AutoCon Deployment Report', 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      doc.autoTable({
        startY: 40,
        head: [['Property', 'Value']],
        body: [
          ['Contract Name', contractName],
          ['Contract Type', contractType],
          ['Network', network],
          ['Contract Address', address],
          ['Transaction Hash', receipt?.hash || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });

      const finalY = doc.lastAutoTable.finalY || 100;

      // Usage Instructions
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text('Usage Instructions', 14, finalY + 15);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const instructions = [
        `1. Add your new contract to Web3 platforms (like Etherscan or Remix).`,
        `2. Use the "Export ABI" feature from the AutoCon Export Center to interact with it using ethers.js or web3.js.`,
        `3. Save this report for future reference, as it contains your unique deployment hash and contract address.`,
        `4. If applicable, you can now build a frontend application and pass your Contract Address and ABI to interact with your contract on the ${network} network.`
      ];

      let currentY = finalY + 25;
      instructions.forEach(instruction => {
          const lines = doc.splitTextToSize(instruction, 180);
          doc.text(lines, 14, currentY);
          currentY += lines.length * 5 + 2;
      });

      doc.save(`${contractName}_Report.pdf`);
      toast.success('PDF Report Downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
          }}
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '460px',
              background: 'var(--surface-elevated)',
              border: '1px solid #ddd',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'var(--surface-elevated)',
                border: '1px solid #ddd',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#666',
                transition: 'all 0.2s',
              }}
            >
              <X size={16} />
            </button>

            {/* Success Icon */}
            <div
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#e8f5e9',
                border: '2px solid #4caf50',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={36} color="#4caf50" />
            </div>

            <h2 style={{
              fontSize: '1.5rem', fontWeight: 800,
              color: 'var(--on-surface)', marginBottom: '6px',
              letterSpacing: '-0.02em'
            }}>
              {contractType} Deployed! 🎉
            </h2>
            <p style={{
              fontSize: '0.85rem', color: '#666',
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
                background: 'var(--surface)',
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
                  background: 'var(--primary-subtle)',
                  border: '1px solid var(--primary-muted)',
                  color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
              >
                <ExternalLink size={15} />
                {explorerUrl.includes('polygon') ? 'View on Polygonscan'
                  : explorerUrl.includes('bscscan') ? 'View on BscScan'
                  : 'View on Etherscan'}
              </a>

              {abi && contractName && (
                <button
                  onClick={() => downloadABI(abi, contractName)}
                  style={{
                    flex: '1 1 100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--outline-variant)',
                    color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <Download size={15} />
                  Download ABI
                </button>
              )}

              <button
                onClick={generatePDFReport}
                className="hover-lift"
                style={{
                  flex: '1 1 100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px', borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#10b981', fontWeight: 600, fontSize: '0.82rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <Download size={15} />
                PDF Report
              </button>
            </div>

            {/* Verification Button */}
            {sourceCode && compilerVersion && (
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={handleVerify}
                  disabled={verifyState !== 'idle' && verifyState !== 'error'}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: verifyState === 'verified' ? 'rgba(16,185,129,0.1)' : 'var(--surface-highest)',
                    border: `1px solid ${verifyState === 'verified' ? 'rgba(16,185,129,0.3)' : 'var(--outline-variant)'}`,
                    color: verifyState === 'verified' ? 'var(--success)' : 'var(--on-surface)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: (verifyState === 'idle' || verifyState === 'error') ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  {verifyState === 'idle' && <><ShieldCheck size={16} /> Verify Source Code</>}
                  {verifyState === 'submitting' && 'Submitting to Etherscan...'}
                  {verifyState === 'polling' && '⏳ Polling Status (Takes ~20s)...'}
                  {verifyState === 'verified' && <><CheckCircle2 size={16} /> Verified Successfully</>}
                  {verifyState === 'error' && '❌ Verification Failed - Retry'}
                </button>
              </div>
            )}

            {/* Transaction Storyteller */}
            {receipt && abi && provider && (
              <TransactionStoryteller receipt={receipt} abi={abi} provider={provider} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

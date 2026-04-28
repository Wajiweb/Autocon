import { ExternalLink, Copy, CheckCircle2, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTransactionStore, selectExplorerUrl, selectContractUrl } from '../../store/useTransactionStore';
import toast from 'react-hot-toast';

/**
 * DeploymentStatusBar
 *
 * A self-contained live status bar that reads directly from useTransactionStore.
 * Drop it anywhere on a generator page — it renders nothing when status is idle.
 *
 * Shows:
 *  - Pending    → spinner + "Waiting for wallet confirmation"
 *  - Submitted  → tx hash + explorer link (copyable)
 *  - Confirmed  → contract address + explorer link + success badge
 *  - Failed     → error message + retry hint
 */
export default function DeploymentStatusBar() {
    const { status, txHash, contractAddress, error } = useTransactionStore();
    const explorerTxUrl      = useTransactionStore(selectExplorerUrl);
    const explorerContractUrl = useTransactionStore(selectContractUrl);
    const [copied, setCopied]  = useState(false);

    // Only render when there's something to show
    if (status === 'idle') return null;

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    const copyHash = (value) => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            borderRadius: '14px',
            border: `1px solid ${cfg.border}`,
            background: cfg.bg,
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'all 0.3s ease',
        }}>
            {/* ── Header Row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <cfg.Icon size={18} color={cfg.color} style={cfg.spin ? { animation: 'spin-slow 1.2s linear infinite' } : {}} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: cfg.color }}>
                    {cfg.label}
                </span>
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: cfg.color,
                    padding: '2px 8px', borderRadius: '50px',
                    background: `${cfg.border}`,
                }}>
                    {status}
                </span>
            </div>

            {/* ── Tx Hash Row ── */}
            {txHash && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--surface)',
                }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', flexShrink: 0 }}>TX</span>
                    <span style={{
                        fontSize: '0.72rem', fontFamily: 'monospace',
                        color: '#94a3b8', flex: 1, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {txHash}
                    </span>
                    <button
                        onClick={() => copyHash(txHash)}
                        title="Copy transaction hash"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copied ? '#34d399' : '#64748b' }}
                    >
                        <Copy size={13} />
                    </button>
                    {explorerTxUrl && (
                        <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer"
                            title="View on block explorer"
                            style={{ color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                            <ExternalLink size={13} />
                        </a>
                    )}
                </div>
            )}

            {/* ── Contract Address Row (on confirmed) ── */}
            {status === 'confirmed' && contractAddress && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.15)',
                }}>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', flexShrink: 0 }}>CONTRACT</span>
                    <span style={{
                        fontSize: '0.72rem', fontFamily: 'monospace',
                        color: '#6ee7b7', flex: 1, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {contractAddress}
                    </span>
                    <button
                        onClick={() => copyHash(contractAddress)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#10b981' }}
                    >
                        <Copy size={13} />
                    </button>
                    {explorerContractUrl && (
                        <a href={explorerContractUrl} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
                            <ExternalLink size={13} />
                        </a>
                    )}
                </div>
            )}

            {/* ── Error Detail ── */}
            {status === 'failed' && error && (
                <div style={{
                    fontSize: '0.75rem', color: '#fca5a5',
                    padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}

// ── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending: {
        label:  'Waiting for wallet confirmation...',
        Icon:   Loader2,
        color:  '#fbbf24',
        bg:     'rgba(251,191,36,0.05)',
        border: 'rgba(251,191,36,0.2)',
        spin:   true,
    },
    submitted: {
        label:  'Transaction submitted — waiting for confirmation',
        Icon:   Clock,
        color:  '#60a5fa',
        bg:     'rgba(96,165,250,0.05)',
        border: 'rgba(96,165,250,0.2)',
        spin:   false,
    },
    confirmed: {
        label:  'Contract deployed successfully!',
        Icon:   CheckCircle2,
        color:  '#34d399',
        bg:     'rgba(52,211,153,0.05)',
        border: 'rgba(52,211,153,0.2)',
        spin:   false,
    },
    failed: {
        label:  'Deployment failed',
        Icon:   AlertTriangle,
        color:  '#f87171',
        bg:     'rgba(248,113,113,0.05)',
        border: 'rgba(248,113,113,0.2)',
        spin:   false,
    },
};

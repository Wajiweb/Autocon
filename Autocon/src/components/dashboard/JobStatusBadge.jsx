import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobPoller } from '../../hooks/useJobPoller';
import toast from 'react-hot-toast';

/**
 * JobStatusBadge
 *
 * A self-contained UI component that:
 *  - Polls a jobId automatically when mounted
 *  - Renders a live progress bar
 *  - Shows status badge (Pending / Processing / Completed / Failed)
 *  - Fires onComplete(result) or onFailed(error) callbacks
 *  - Displays retry attempts when retrying
 *
 * Props:
 *   jobId       string    — The job ID returned by POST /api/jobs/create
 *   type        string    — 'verification' | 'audit' (for label text)
 *   onComplete  function  — Called with result when job is completed
 *   onFailed    function  — Called with error string when job is failed
 *   compact     boolean   — Minimal pill-only view (no progress bar)
 */
export default function JobStatusBadge({ jobId, type = 'job', onComplete, onFailed, compact = false }) {
    const { status, result, error, attempts, progress, isPolling, startPolling } = useJobPoller();

    // Auto-start polling when jobId is provided
    useEffect(() => {
        if (jobId) startPolling(jobId);
    }, [jobId]);

    // Fire callbacks on terminal states
    useEffect(() => {
        if (status === 'completed' && result) {
            toast.success(`${labelFor(type)} completed!`);
            if (onComplete) onComplete(result);
        }
        if (status === 'failed' && error) {
            toast.error(`${labelFor(type)} failed: ${error}`);
            if (onFailed) onFailed(error);
        }
    }, [status]);

    if (!jobId) return null;

    const cfg = statusConfig[status] || statusConfig.pending;

    if (compact) {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                whiteSpace: 'nowrap',
            }}>
                {cfg.icon} {cfg.label}
            </span>
        );
    }

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${cfg.border}`,
            borderRadius: '12px',
            padding: '14px 16px',
        }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                        {labelFor(type)}
                    </span>
                </div>
                <span style={{
                    padding: '3px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 700,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                }}>
                    {cfg.label}
                </span>
            </div>

            {/* Progress bar */}
            <div style={{
                height: '5px', borderRadius: '99px',
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                marginBottom: '8px',
            }}>
                <div style={{
                    height: '100%', borderRadius: '99px',
                    width: `${progress}%`,
                    background: cfg.barColor,
                    transition: 'width 0.5s ease',
                }} />
            </div>

            {/* Details row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--outline)', fontFamily: 'monospace' }}>
                    {jobId.slice(0, 32)}...
                </span>
                {attempts > 0 && status === 'processing' && (
                    <span style={{ fontSize: '0.68rem', color: '#f59e0b' }}>
                        Attempt {attempts}
                    </span>
                )}
                {status === 'failed' && attempts > 1 && (
                    <span style={{ fontSize: '0.68rem', color: '#f87171' }}>
                        Failed after {attempts} attempt{attempts > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Error message */}
            {status === 'failed' && error && (
                <div style={{
                    marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    fontSize: '0.72rem', color: '#fca5a5',
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Success summary */}
            {status === 'completed' && result && (
                <div style={{
                    marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                    fontSize: '0.72rem', color: '#6ee7b7',
                }}>
                    {type === 'audit' && result.overallRisk && (
                        <span>✅ Risk Level: <strong>{result.overallRisk}</strong> · {result.totalFindings ?? 0} findings</span>
                    )}
                    {type === 'verification' && (
                        <span>✅ Contract verified on {result.network}</span>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function labelFor(type) {
    if (type === 'verification') return 'Contract Verification';
    if (type === 'audit')        return 'Security Audit';
    return 'Background Job';
}

const statusConfig = {
    pending: {
        label:    'Queued',
        icon:     '⏳',
        color:    '#94a3b8',
        bg:       'rgba(148,163,184,0.1)',
        border:   'rgba(148,163,184,0.2)',
        barColor: '#475569',
    },
    processing: {
        label:    'Processing',
        icon:     '⚙️',
        color:    '#fbbf24',
        bg:       'rgba(251,191,36,0.1)',
        border:   'rgba(251,191,36,0.25)',
        barColor: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
    },
    completed: {
        label:    'Completed',
        icon:     '✅',
        color:    '#34d399',
        bg:       'rgba(52,211,153,0.1)',
        border:   'rgba(52,211,153,0.25)',
        barColor: '#10b981',
    },
    failed: {
        label:    'Failed',
        icon:     '❌',
        color:    '#f87171',
        bg:       'rgba(248,113,113,0.1)',
        border:   'rgba(248,113,113,0.25)',
        barColor: '#ef4444',
    },
};

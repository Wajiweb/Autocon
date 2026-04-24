import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobPoller } from '../../hooks/useJobPoller';
import { API_BASE } from '../../config';
import toast from 'react-hot-toast';

export default function SecurityScanner({ contractCode, onAuditResult }) {
    const { authFetch } = useAuth();
    const [auditData,    setAuditData]    = useState(null);
    const [isAuditing,   setIsAuditing]   = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);
    const [expandedVuln, setExpandedVuln] = useState(null);
    const [isExplaining, setIsExplaining] = useState(false);

    const { status, result, error, progress, startPolling } = useJobPoller({ pollIntervalMs: 3000 });

    const handleExplainAI = async () => {
        if (!auditData?.vulnerabilities?.length) return;
        setIsExplaining(true);
        const toastId = toast.loading('🧠 AI is analyzing vulnerabilities...');
        try {
            const token = localStorage.getItem('autocon_token');
            const res = await fetch(`${API_BASE}/api/ai/audit-explain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ vulnerabilities: auditData.vulnerabilities, contractCode })
            });
            const data = await res.json();
            if (data.success && data.data) {
                setAuditData(prev => {
                    const newVulns = [...prev.vulnerabilities];
                    // Map simple explanations back to the vulnerabilities
                    if (data.data.risks && data.data.risks.length > 0) {
                        newVulns.forEach((v, i) => {
                            if (data.data.risks[i]) {
                                v.aiDescription = data.data.risks[i];
                            }
                        });
                    }
                    return {
                        ...prev,
                        aiInsights: { summary: data.data.summary },
                        recommendations: data.data.recommendations,
                        vulnerabilities: newVulns
                    };
                });
                toast.success('AI explanation complete!', { id: toastId });
            } else {
                throw new Error(data.error || 'Failed to explain');
            }
        } catch(e) {
            toast.error(e.message || "Failed to fetch AI explanation", { id: toastId });
        } finally {
            setIsExplaining(false);
        }
    };

    // ── Wire poller result into component state ────────────────────────────────
    useEffect(() => {
        if (status === 'completed' && result) {
            setAuditData(result);
            setIsAuditing(false);
            const risk   = result.overallRisk;
            const isSafe = risk === 'LOW' || risk === 'MEDIUM';
            onAuditResult({ canDeploy: isSafe, isAuditing: false });
        }
        if (status === 'failed' && error) {
            setIsAuditing(false);
            toast.error('Security audit failed. You may still deploy.');
            onAuditResult({ canDeploy: true, isAuditing: false }); // fallback
        }
        if (status === 'processing') {
            onAuditResult({ canDeploy: false, isAuditing: true });
        }
    }, [status, result, error]);

    // ── Trigger async audit whenever contractCode changes ─────────────────────
    useEffect(() => {
        if (!contractCode) {
            setAuditData(null);
            onAuditResult({ canDeploy: false, isAuditing: false });
            return;
        }

        const enqueueAudit = async () => {
            setIsAuditing(true);
            setAuditData(null);
            setAcknowledged(false);
            onAuditResult({ canDeploy: false, isAuditing: true });

            try {
                const res = await authFetch('/api/jobs/create', {
                    method: 'POST',
                    body: JSON.stringify({
                        type:    'audit',
                        payload: { contractCode },
                    }),
                });
                const data = await res.json();

                if (data.success && data.jobId) {
                    // Start polling — useJobPoller handles the rest
                    startPolling(data.jobId);
                } else {
                    throw new Error(data.error || 'Failed to queue audit job.');
                }
            } catch (err) {
                console.error('Audit enqueue error:', err);
                toast.error('Failed to start security audit.');
                setIsAuditing(false);
                onAuditResult({ canDeploy: true, isAuditing: false });
            }
        };

        enqueueAudit();
    }, [contractCode]);

    const handleAcknowledge = (e) => {
        const isChecked = e.target.checked;
        setAcknowledged(isChecked);
        onAuditResult({ canDeploy: isChecked, isAuditing: false });
    };

    if (!contractCode) return null;

    // ── Loading state — show progress while polling ───────────────────────────
    if (isAuditing || status === 'processing' || status === 'pending') {
        return (
            <div className="pg-card db-enter" style={{ padding: '24px', border: '1px solid var(--primary)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    <svg style={{ animation: 'spin-slow 1s linear infinite', width: 32, height: 32, color: 'var(--primary)' }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)' }}>Running Hybrid Security Audit</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginTop: '4px' }}>Analyzing AST with Slither and interpreting logic via AI...</p>
                    </div>
                    {/* Live progress bar */}
                    <div style={{ width: '100%', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>{status === 'pending' ? 'Queued...' : 'Processing...'}</p>
                </div>
            </div>
        );
    }

    if (!auditData) return null;

    const { overallRisk, vulnerabilities, aiInsights, recommendations } = auditData;

    const riskColors = {
        'LOW': { bg: 'rgba(16,185,129,0.1)', text: 'var(--success)', border: 'rgba(16,185,129,0.3)' },
        'MEDIUM': { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
        'HIGH': { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
        'CRITICAL': { bg: 'rgba(185,28,28,0.15)', text: '#b91c1c', border: 'rgba(185,28,28,0.5)' }
    };

    const currentStyle = riskColors[overallRisk] || riskColors['LOW'];
    const needsAck = overallRisk === 'HIGH' || overallRisk === 'CRITICAL';

    return (
        <div className="pg-card db-enter" style={{ padding: '24px', border: `1px solid ${currentStyle.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🛡️ Security Audit Report
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--outline)', marginTop: '4px' }}>
                        {aiInsights?.summary || 'Analysis complete.'}
                    </p>
                </div>
                <div style={{
                    padding: '6px 16px', borderRadius: '50px',
                    background: currentStyle.bg, color: currentStyle.text,
                    border: `1px solid ${currentStyle.border}`,
                    fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    Risk: {overallRisk}
                </div>
            </div>

            {vulnerabilities && vulnerabilities.length > 0 && !auditData.recommendations && (
                <button 
                    onClick={handleExplainAI}
                    disabled={isExplaining}
                    style={{
                        width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.15))',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        color: '#c4b5fd', fontWeight: 600, fontSize: '0.85rem', cursor: isExplaining ? 'wait' : 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                    }}
                >
                    {isExplaining ? '⏳ AI is analyzing...' : '✨ Explain Technical Results with AI'}
                </button>
            )}

            {vulnerabilities && vulnerabilities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase' }}>Identified Vulnerabilities</h4>
                    {vulnerabilities.map((v, i) => (
                        <div key={i} style={{
                            background: 'var(--surface-highest)', border: '1px solid var(--outline-variant)',
                            borderRadius: '8px', overflow: 'hidden'
                        }}>
                            <div 
                                onClick={() => setExpandedVuln(expandedVuln === i ? null : i)}
                                style={{
                                    padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    cursor: 'pointer', background: expandedVuln === i ? 'rgba(255,255,255,0.02)' : 'transparent'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: riskColors[v.severity]?.text || 'gray'
                                    }} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>{v.title}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>
                                    {v.source} • {v.location}
                                </span>
                            </div>
                            {expandedVuln === i && (
                                <div style={{ padding: '0 16px 16px 36px', fontSize: '0.85rem', color: 'var(--outline)' }}>
                                    {v.aiDescription && (
                                        <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(124,58,237,0.1)', borderLeft: '3px solid #8b5cf6', color: '#c4b5fd' }}>
                                            <span style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>✨ AI Explanation:</span>
                                            {v.aiDescription}
                                        </div>
                                    )}
                                    <p style={{ marginBottom: '8px', lineHeight: 1.5, opacity: v.aiDescription ? 0.6 : 1 }}>
                                        <strong>Technical Detail:</strong> {v.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '16px', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <span>✅</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>No vulnerabilities detected. The contract looks secure.</p>
                </div>
            )}

            {recommendations && recommendations.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '8px' }}>AI Recommendations</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--on-surface-variant)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </div>
            )}

            {needsAck && (
                <div style={{
                    padding: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px'
                }}>
                    <input 
                        type="checkbox" 
                        id="ack-risk"
                        checked={acknowledged}
                        onChange={handleAcknowledge}
                        style={{ width: 18, height: 18, marginTop: '2px', cursor: 'pointer' }}
                    />
                    <label htmlFor="ack-risk" style={{ cursor: 'pointer' }}>
                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>
                            Acknowledge Deployment Risks
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>
                            This contract contains High or Critical security vulnerabilities. Deploying this code may result in loss of funds or exploits. Check this box to confirm you understand the risks and wish to proceed anyway.
                        </span>
                    </label>
                </div>
            )}
        </div>
    );
}

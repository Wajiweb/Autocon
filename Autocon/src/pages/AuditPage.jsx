import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AuditPage() {
    const { authFetch } = useAuth();
    const [contractCode, setContractCode] = useState('');
    const [auditResult, setAuditResult] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);

    const runAudit = async () => {
        if (!contractCode.trim()) {
            return toast.error('Please paste your Solidity contract code.');
        }

        setIsAuditing(true);
        const loadingToast = toast.loading('Scanning for vulnerabilities...');

        try {
            const res = await authFetch('/api/audit-contract', {
                method: 'POST',
                body: JSON.stringify({ contractCode })
            });
            const data = await res.json();

            if (data.success) {
                setAuditResult(data.audit);
                toast.success('Audit complete!', { id: loadingToast });
            } else {
                toast.error(data.error || 'Audit failed.', { id: loadingToast });
            }
        } catch (err) {
            console.error('Audit Error:', err);
            toast.error('Failed to run audit.', { id: loadingToast });
        } finally {
            setIsAuditing(false);
        }
    };

    const severityColors = {
        CRITICAL: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#ef4444', icon: '🔴' },
        HIGH: { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', text: '#f97316', icon: '🟠' },
        MEDIUM: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa', icon: '🟡' },
        LOW: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', text: '#94a3b8', icon: '🔵' },
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'linear-gradient(135deg, #10b981, #06b6d4)';
        if (score >= 60) return 'linear-gradient(135deg, #f59e0b, #f97316)';
        if (score >= 40) return 'linear-gradient(135deg, #f97316, #ef4444)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    };

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                    color: 'var(--on-surface)', marginBottom: '8px'
                }}>
                    Security <span className="gradient-text">Audit</span>
                </h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                    Scan your smart contracts for common vulnerabilities before deployment.
                </p>
            </div>

            {/* Input Card */}
            <div className="card glass-strong animate-fade-in-up delay-100" style={{
                padding: '28px', marginBottom: '24px',
                borderTop: '2px solid rgba(139,92,246,0.4)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.1)'
            }}>
                <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700,
                    color: 'var(--on-surface)', textTransform: 'uppercase',
                    letterSpacing: '1px', marginBottom: '14px'
                }}>
                    <span style={{ color: '#a78bfa' }}>📝</span> Paste Solidity Code
                </label>
                <textarea
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n...\n\nPaste your full contract source code here`}
                    className="input"
                    style={{
                        minHeight: '220px',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        fontSize: '0.85rem',
                        lineHeight: 1.7,
                        resize: 'vertical',
                        borderRadius: '16px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                    }}
                />

                <button
                    onClick={runAudit}
                    disabled={isAuditing}
                    className="btn-primary"
                    style={{
                        width: '100%', padding: '16px', marginTop: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                >
                    {isAuditing ? (
                        <>
                            <svg style={{ animation: 'spin-slow 1s linear infinite', width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Scanning...
                        </>
                    ) : '🛡️ Run Security Audit'}
                </button>
            </div>

            {/* Audit Results */}
            {auditResult && (
                <div className="animate-fade-in-up">
                    {/* Score + Summary Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '24px' }}>
                        {/* Score Circle */}
                        <div className="card glass-strong" style={{
                            padding: '32px 24px',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            borderTop: '2px solid rgba(6,182,212,0.4)'
                        }}>
                            <div style={{
                                width: '110px', height: '110px',
                                borderRadius: '50%',
                                background: getScoreGradient(auditResult.score),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 0 40px ${getScoreColor(auditResult.score)}30`,
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    width: '90px', height: '90px',
                                    borderRadius: '50%',
                                    background: 'var(--surface)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column'
                                }}>
                                    <span style={{
                                        fontSize: '2rem', fontWeight: 900,
                                        color: getScoreColor(auditResult.score),
                                        lineHeight: 1
                                    }}>
                                        {auditResult.score}
                                    </span>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--outline)', fontWeight: 600 }}>
                                        / 100
                                    </span>
                                </div>
                            </div>
                            <span className={`badge ${auditResult.riskLevel === 'LOW' ? 'badge-success' :
                                    auditResult.riskLevel === 'MEDIUM' ? 'badge-warning' :
                                        'badge-danger'
                                }`}>
                                {auditResult.riskLevel} Risk
                            </span>
                        </div>

                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Critical', count: auditResult.summary.critical, color: severityColors.CRITICAL },
                                { label: 'High', count: auditResult.summary.high, color: severityColors.HIGH },
                                { label: 'Medium', count: auditResult.summary.medium, color: severityColors.MEDIUM },
                                { label: 'Low', count: auditResult.summary.low, color: severityColors.LOW },
                            ].map(item => (
                                <div key={item.label} style={{
                                    padding: '18px',
                                    borderRadius: '16px',
                                    background: item.color.bg,
                                    border: `1px solid ${item.color.border}`,
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>{item.color.icon}</span>
                                    <div>
                                        <p style={{
                                            fontSize: '1.5rem', fontWeight: 900,
                                            color: item.color.text, lineHeight: 1
                                        }}>{item.count}</p>
                                        <p style={{
                                            fontSize: '0.7rem', fontWeight: 600,
                                            color: 'var(--outline)', textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>{item.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Findings */}
                    {auditResult.findings.length > 0 && (
                        <div>
                            <h3 style={{
                                fontSize: '1rem', fontWeight: 800,
                                color: 'var(--on-surface)', marginBottom: '16px'
                            }}>
                                📋 Detailed Findings
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {auditResult.findings.map((finding, idx) => {
                                    const colors = severityColors[finding.severity] || severityColors.LOW;
                                    return (
                                        <div key={idx} className="card" style={{
                                            padding: '24px',
                                            borderLeft: `4px solid ${colors.text}`
                                        }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                marginBottom: '12px'
                                            }}>
                                                <span className={`badge ${finding.severity === 'CRITICAL' ? 'badge-danger' :
                                                        finding.severity === 'HIGH' ? 'badge-warning' :
                                                            finding.severity === 'MEDIUM' ? 'badge-medium' :
                                                                'badge-low'
                                                    }`}>
                                                    {finding.severity}
                                                </span>
                                                <h4 style={{
                                                    fontSize: '0.95rem', fontWeight: 700,
                                                    color: 'var(--on-surface)', margin: 0
                                                }}>
                                                    {finding.title}
                                                </h4>
                                                <span style={{
                                                    marginLeft: 'auto',
                                                    fontSize: '0.7rem',
                                                    color: 'var(--outline)',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    Line {finding.line}
                                                    {finding.additionalLines ? `, ${finding.additionalLines.join(', ')}` : ''}
                                                </span>
                                            </div>

                                            <p style={{
                                                fontSize: '0.85rem', color: 'var(--on-surface-variant)',
                                                lineHeight: 1.7, marginBottom: '12px'
                                            }}>
                                                {finding.description}
                                            </p>

                                            {/* Code snippet */}
                                            <div style={{
                                                background: '#0d1117',
                                                borderRadius: '10px',
                                                padding: '12px 16px',
                                                marginBottom: '12px',
                                                fontFamily: 'monospace',
                                                fontSize: '0.78rem',
                                                color: '#ff7b72',
                                                overflowX: 'auto'
                                            }}>
                                                {finding.code}
                                            </div>

                                            {/* Advice */}
                                            <div style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                background: 'rgba(6,182,212,0.05)',
                                                border: '1px solid rgba(6,182,212,0.1)',
                                                fontSize: '0.82rem',
                                                color: 'var(--tertiary)',
                                                lineHeight: 1.6
                                            }}>
                                                💡 <strong>Recommendation:</strong> {finding.advice}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {auditResult.findings.length === 0 && (
                        <div className="card" style={{
                            padding: '48px', textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)', marginBottom: '8px' }}>
                                No Vulnerabilities Found!
                            </h3>
                            <p style={{ color: 'var(--outline)', fontSize: '0.9rem' }}>
                                Your contract passed all security checks.
                            </p>
                        </div>
                    )}

                    {/* Scanned timestamp */}
                    <div style={{
                        textAlign: 'center', marginTop: '20px',
                        fontSize: '0.7rem', color: 'var(--outline)'
                    }}>
                        Scanned at {new Date(auditResult.scannedAt).toLocaleString()} • {auditResult.totalFindings} findings
                    </div>
                </div>
            )}
        </div>
    );
}

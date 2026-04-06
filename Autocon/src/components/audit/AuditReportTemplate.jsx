import React from 'react';

/**
 * AuditReportTemplate - A solid-background printable component designed for html2canvas.
 * Contains NO backdrop-filter or complex blend-modes to ensure perfect PDF rendering.
 */
export default function AuditReportTemplate({ auditResult, dateStr }) {
    if (!auditResult) return null;

    const severityColors = {
        CRITICAL: { bg: '#450a0a', text: '#ef4444' }, // Solid dark red bg
        HIGH: { bg: '#431407', text: '#f97316' },     // Solid dark orange bg
        MEDIUM: { bg: '#2e1065', text: '#a78bfa' },   // Solid dark purple bg
        LOW: { bg: '#0f172a', text: '#94a3b8' },      // Solid dark slate bg
    };

    return (
        <div 
            id="pdf-audit-report"
            style={{
                position: 'fixed',
                left: '-9999px',
                top: '-9999px',
                width: '800px', // Standard A4-ish width for canvas
                minHeight: '1131px', // A4 proportion
                backgroundColor: '#080c14', // Solid background (deep space variable)
                color: '#ffffff',
                fontFamily: '"Inter", sans-serif',
                padding: '40px',
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #161d2b', paddingBottom: '20px', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '28px', margin: '0 0 8px 0', color: '#a78bfa' }}>
                        AutoCon Security Audit
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Generated: {dateStr}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Smart Contract Scanner</div>
                    <div style={{ fontSize: '12px', color: '#06b6d4' }}>Ethereum Sepolia Network</div>
                </div>
            </div>

            {/* Summary Block */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={{ flex: 1, backgroundColor: '#161d2b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Security Score</div>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif', color: auditResult.score > 70 ? '#10b981' : auditResult.score > 40 ? '#f59e0b' : '#ef4444' }}>
                        {auditResult.score}/100
                    </div>
                </div>
                <div style={{ flex: 2, backgroundColor: '#161d2b', padding: '20px', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Vulnerability Breakdown</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{auditResult.summary.critical}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Critical</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>{auditResult.summary.high}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>High</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a78bfa' }}>{auditResult.summary.medium}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Medium</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#94a3b8' }}>{auditResult.summary.low}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Low</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Findings Table */}
            <h2 style={{ fontSize: '20px', borderBottom: '1px solid #161d2b', paddingBottom: '10px', marginBottom: '20px' }}>Detailed Findings</h2>
            
            {auditResult.findings && auditResult.findings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {auditResult.findings.map((finding, idx) => {
                        const styleDesc = severityColors[finding.severity] || severityColors.LOW;
                        return (
                            <div key={idx} style={{ backgroundColor: '#161d2b', padding: '16px', borderRadius: '8px', borderLeft: `6px solid ${styleDesc.text}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ 
                                            backgroundColor: styleDesc.bg, 
                                            color: styleDesc.text, 
                                            padding: '4px 10px', 
                                            borderRadius: '4px', 
                                            fontSize: '11px', 
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {finding.severity}
                                        </span>
                                        <h4 style={{ margin: 0, fontSize: '16px' }}>{finding.title}</h4>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Line: {finding.line}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.5 }}>
                                    <strong style={{ color: '#ffffff' }}>Description:</strong> {finding.description}
                                </p>
                                <p style={{ fontSize: '13px', color: '#a78bfa', margin: 0 }}>
                                    <strong style={{ color: '#ffffff' }}>Recommendation:</strong> {finding.recommendation}
                                </p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#161d2b', borderRadius: '8px', color: '#10b981' }}>
                     No vulnerabilities found. This code is exceptionally clean.
                </div>
            )}
            
            {/* Footer */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #161d2b', paddingTop: '20px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                Disclaimer: This automated scan uses an AI model and static analysis matching. It is not a substitute for a professional manual audit. AutoCon assumes no liability for deployed code.
            </div>
        </div>
    );
}

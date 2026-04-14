import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Download, FileText } from 'lucide-react';
import { usePDFExport } from '../hooks/useExport';
import AuditReportTemplate from '../components/audit/AuditReportTemplate';
import '../components/dashboard/styles/dashboard.css';

const SEV = {
  CRITICAL: { bg: 'rgba(239,68,68,.10)', border: 'rgba(239,68,68,.25)', text: '#ef4444', badge: 'red' },
  HIGH:     { bg: 'rgba(249,115,22,.10)', border: 'rgba(249,115,22,.25)', text: '#f97316', badge: 'amber' },
  MEDIUM:   { bg: 'rgba(167,139,250,.10)', border: 'rgba(167,139,250,.25)', text: '#a78bfa', badge: 'purple' },
  LOW:      { bg: 'rgba(96,165,250,.10)', border: 'rgba(96,165,250,.25)', text: '#60a5fa', badge: 'blue' },
};

const scoreColor = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : s >= 40 ? '#f97316' : '#ef4444';
const scoreGrad  = (s) => s >= 80
  ? 'linear-gradient(135deg,#22c55e,#16a34a)'
  : s >= 60 ? 'linear-gradient(135deg,#f59e0b,#f97316)'
  : s >= 40 ? 'linear-gradient(135deg,#f97316,#ef4444)'
  : 'linear-gradient(135deg,#ef4444,#dc2626)';

export default function AuditPage() {
  const { authFetch } = useAuth();
  const [contractCode, setContractCode] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const { generatePDF, isGenerating: isExportingPDF } = usePDFExport();

  const runAudit = async () => {
    if (!contractCode.trim()) return toast.error('Please paste your Solidity contract code.');
    setIsAuditing(true);
    const tid = toast.loading('Scanning for vulnerabilities…');
    try {
      const res = await authFetch('/api/audit-contract', { method: 'POST', body: JSON.stringify({ contractCode }) });
      const data = await res.json();
      if (data.success) { setAuditResult(data.audit); toast.success('Audit complete!', { id: tid }); }
      else toast.error(data.error || 'Audit failed.', { id: tid });
    } catch { toast.error('Failed to run audit.', { id: tid }); }
    finally { setIsAuditing(false); }
  };

  return (
    <div className="pg-wrap">

      {/* Header */}
      <div className="pg-head db-enter db-enter-1">
        <div className="pg-title">Security <em>Audit</em></div>
        <div className="pg-sub">Scan your smart contracts for common vulnerabilities before deployment.</div>
      </div>

      {/* Input Card */}
      <div className="pg-card accent-top-red db-enter db-enter-2">
        <label className="pg-label">📝 Paste Solidity Code</label>
        <textarea
          value={contractCode}
          onChange={(e) => setContractCode(e.target.value)}
          placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n// Paste your full contract here`}
          className="pg-textarea"
          style={{ minHeight: 200 }}
        />
        <button onClick={runAudit} disabled={isAuditing}
          className="pg-btn pg-btn-primary" style={{ width: '100%', padding: '12px 0', marginTop: 14, fontSize: 14 }}>
          {isAuditing ? (
            <><div className="pg-spinner" style={{ width: 16, height: 16 }} /> Scanning…</>
          ) : '🛡️ Run Security Audit'}
        </button>
      </div>

      {/* Results */}
      {auditResult && (
        <div className="db-enter db-enter-3">

          {/* Result header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={20} color="var(--db-acc)" />
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)' }}>Audit Analysis</span>
            </div>
            <AuditReportTemplate auditResult={auditResult}
              dateStr={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
            <button onClick={() => generatePDF('AutoCon_Audit_Report.pdf')} disabled={isExportingPDF}
              className="pg-btn pg-btn-outline" style={{ gap: 7 }}>
              {isExportingPDF ? <div className="pg-spinner" style={{ width: 14, height: 14 }} /> : <Download size={14} />}
              {isExportingPDF ? 'Generating…' : 'Export PDF'}
            </button>
          </div>

          {/* Score + Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, marginBottom: 16 }}>

            {/* Score circle */}
            <div className="pg-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 20px' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: scoreGrad(auditResult.score),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 32px ${scoreColor(auditResult.score)}30`, marginBottom: 12 }}>
                <div style={{ width: 82, height: 82, borderRadius: '50%', background: 'var(--db-s1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--db-mono)', fontSize: 28, fontWeight: 700, color: scoreColor(auditResult.score), lineHeight: 1 }}>
                    {auditResult.score}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--db-t3)' }}>/ 100</span>
                </div>
              </div>
              <span className={`pg-badge ${auditResult.riskLevel === 'LOW' ? 'green' : auditResult.riskLevel === 'MEDIUM' ? 'amber' : 'red'}`}>
                {auditResult.riskLevel} Risk
              </span>
            </div>

            {/* Summary grid */}
            <div className="pg-mini-stats cols-2" style={{ alignContent: 'start' }}>
              {[
                { label: 'Critical', count: auditResult.summary.critical, s: SEV.CRITICAL },
                { label: 'High',     count: auditResult.summary.high,     s: SEV.HIGH },
                { label: 'Medium',   count: auditResult.summary.medium,   s: SEV.MEDIUM },
                { label: 'Low',      count: auditResult.summary.low,      s: SEV.LOW },
              ].map(({ label, count, s }) => (
                <div key={label} style={{ padding: '16px', borderRadius: 'var(--db-r)',
                  background: s.bg, border: `.5px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--db-mono)', fontSize: 26, fontWeight: 600, color: s.text }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--db-t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          {auditResult.findings.length > 0 ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 12,
                fontFamily: 'var(--db-font)' }}>📋 Detailed Findings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {auditResult.findings.map((f, idx) => {
                  const c = SEV[f.severity] || SEV.LOW;
                  return (
                    <div key={idx} className="pg-card" style={{ borderLeft: `3px solid ${c.text}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span className={`pg-badge ${c.badge}`}>{f.severity}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)' }}>{f.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>
                          Line {f.line}{f.additionalLines ? `, ${f.additionalLines.join(', ')}` : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--db-t2)', lineHeight: 1.7, marginBottom: 10 }}>{f.description}</p>
                      <div className="pg-code-block" style={{ marginBottom: 10 }}>{f.code}</div>
                      <div style={{ padding: '10px 14px', borderRadius: 'var(--db-r-sm)',
                        background: 'var(--db-acc-dd)', border: '.5px solid var(--db-br)',
                        fontSize: 12, color: 'var(--db-t2)', lineHeight: 1.6 }}>
                        💡 <strong style={{ color: 'var(--db-acc)' }}>Recommendation:</strong> {f.advice}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pg-card" style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--db-acc)', marginBottom: 6, fontFamily: 'var(--db-font)' }}>
                No Vulnerabilities Found!
              </div>
              <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>Your contract passed all security checks.</div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>
            Scanned at {new Date(auditResult.scannedAt).toLocaleString()} · {auditResult.totalFindings} findings
          </div>
        </div>
      )}
    </div>
  );
}

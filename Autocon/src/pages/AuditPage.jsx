import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useJobPoller } from '../hooks/useJobPoller';
import { Download, FileText, ShieldAlert, ShieldCheck, RefreshCw, Clock, Cpu } from 'lucide-react';
import { usePDFExport } from '../hooks/useExport';
import AuditReportTemplate from '../components/audit/AuditReportTemplate';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../components/dashboard/styles/dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const LS_JOB_KEY = 'autocon_audit_jobId';   // localStorage key for session persistence

/* ─── Severity colour map ────────────────────────────────────────────────── */
const SEV = {
  CRITICAL: { bg: 'rgba(239,68,68,.10)',   border: 'rgba(239,68,68,.25)',   text: '#ef4444', badge: 'red'    },
  HIGH:     { bg: 'rgba(249,115,22,.10)',  border: 'rgba(249,115,22,.25)',  text: '#f97316', badge: 'amber'  },
  MEDIUM:   { bg: 'rgba(167,139,250,.10)', border: 'rgba(167,139,250,.25)', text: '#a78bfa', badge: 'purple' },
  LOW:      { bg: 'rgba(96,165,250,.10)',  border: 'rgba(96,165,250,.25)',  text: '#60a5fa', badge: 'blue'   },
};

const scoreColor = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : s >= 40 ? '#f97316' : '#ef4444';
const scoreGrad  = (s) => s >= 80
  ? 'linear-gradient(135deg,#22c55e,#16a34a)'
  : s >= 60 ? 'linear-gradient(135deg,#f59e0b,#f97316)'
  : s >= 40 ? 'linear-gradient(135deg,#f97316,#ef4444)'
  : 'linear-gradient(135deg,#ef4444,#dc2626)';

/* ─── Risk level → score mapping (mirrors audit.worker.js) ──────────────── */
const riskToScore = { LOW: 95, MEDIUM: 70, HIGH: 40, CRITICAL: 10 };

/* ─── Poll status → label ────────────────────────────────────────────────── */
const STATUS_LABEL = {
  pending:    'Queued…',
  processing: 'Running Slither + AI analysis…',
  completed:  'Analysis complete',
  failed:     'Analysis failed',
};

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function AuditPage() {
  const { authFetch }  = useAuth();
  const { generatePDF, isGenerating: isExportingPDF } = usePDFExport();

  const location = useLocation();

  /* Form state */
  const [contractCode, setContractCode] = useState(location.state?.code || '');
  const [contractType, setContractType] = useState(location.state?.type || 'Custom');

  /* Job / result state */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditResult,  setAuditResult]  = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [expandedIdx,  setExpandedIdx]  = useState(null);

  /* Job poller — same hook used by SecurityScanner.jsx */
  const {
    jobId, status, result, error, progress, isPolling, startPolling, stopPolling,
  } = useJobPoller({ pollIntervalMs: 3000, timeoutMs: 300_000 });

  /* ── Restore in-progress job after page refresh ─────────────────────── */
  useEffect(() => {
    const savedJobId = localStorage.getItem(LS_JOB_KEY);
    if (savedJobId && !isPolling && !auditResult) {
      startPolling(savedJobId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Persist jobId whenever it changes ──────────────────────────────── */
  useEffect(() => {
    if (jobId) localStorage.setItem(LS_JOB_KEY, jobId);
  }, [jobId]);

  /* ── Wire poller result into shaped auditResult ─────────────────────── */
  useEffect(() => {
    if (status === 'completed' && result) {
      const overallRisk = result.overallRisk || 'LOW';
      const score       = result.score ?? riskToScore[overallRisk] ?? 50;

      /* Normalise vulnerability list — worker returns `vulnerabilities` array */
      const vulns = Array.isArray(result.vulnerabilities) ? result.vulnerabilities : [];

      const summaryCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      const findings = vulns.map(v => {
        const sev = (v.severity || 'LOW').toUpperCase();
        if (sev === 'CRITICAL') summaryCounts.critical++;
        else if (sev === 'HIGH') summaryCounts.high++;
        else if (sev === 'MEDIUM') summaryCounts.medium++;
        else summaryCounts.low++;

        return {
          ruleId:          v.id || v.ruleId || 'AI_FINDING',
          title:           v.title || 'Unknown Finding',
          severity:        sev,
          description:     v.description || 'No description provided.',
          advice:          v.advice || v.recommendation || 'Review this finding carefully.',
          line:            parseInt(v.line || v.location) || 0,
          code:            v.code || '',
          source:          v.source || 'Analysis',
          additionalLines: v.additionalLines || [],
          aiDescription:   v.aiDescription || null,
        };
      });

      /* ── Safe AI insight normalisation — never crashes UI ──────── */
      const rawInsights = result.aiInsights || {};

      setAuditResult({
        score,
        riskLevel:       overallRisk,
        totalFindings:   findings.length,
        findings,
        summary:         summaryCounts,
        aiInsights:      {
          summary: rawInsights.summary || 'No AI summary available.',
        },
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        reportId:        result.reportId   || null,
        scannedAt:       result.completedAt || new Date().toISOString(),
        engineVersion:   'Slither + Gemini AI',
      });

      /* Clear persisted jobId — audit is done */
      localStorage.removeItem(LS_JOB_KEY);
      toast.success('Audit complete!');
    }

    if (status === 'failed') {
      localStorage.removeItem(LS_JOB_KEY);
      toast.error(error || 'Audit job failed. Please try again.');
    }
  }, [status, result, error]);

  /* ── Submit: enqueue a new audit job ────────────────────────────────── */
  const runAudit = async () => {
    /* FIX #1 — Prevent duplicate jobs while one is active */
    if (isPolling || isSubmitting) return;
    if (!contractCode.trim()) {
      return toast.error('Please paste your Solidity contract code.');
    }

    setIsSubmitting(true);
    setAuditResult(null);
    setExpandedIdx(null);

    const tid = toast.loading('Queueing security audit…');
    try {
      const res  = await authFetch('/api/jobs/create', {
        method: 'POST',
        body:   JSON.stringify({ type: 'audit', payload: { contractCode, contractType } }),
      });
      const data = await res.json();

      if (data.success && data.jobId) {
        toast.success('Audit job queued!', { id: tid });
        startPolling(data.jobId);
      } else {
        throw new Error(data.error || 'Failed to queue audit job.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start audit.', { id: tid });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Retry: clear localStorage + reset then re-run ─────────────────── */
  const handleRetry = useCallback(() => {
    localStorage.removeItem(LS_JOB_KEY);
    stopPolling();
    setAuditResult(null);
    setExpandedIdx(null);
    /* Keep contractCode so user doesn't have to re-paste */
  }, [stopPolling]);

  /* ── Reset / new scan ───────────────────────────────────────────────── */
  const resetScan = () => {
    localStorage.removeItem(LS_JOB_KEY);
    stopPolling();
    setAuditResult(null);
    setContractCode('');
    setExpandedIdx(null);
  };

  /* ── AI Explanation (reusing SecurityScanner.jsx logic) ──────────────
     Calls POST /api/ai/audit-explain with the raw vulnerability list.
     Enriches each finding with an aiDescription from the LLM.          */
  const handleExplainAI = async () => {
    if (!auditResult?.findings?.length) return;
    setIsExplaining(true);
    const tid = toast.loading('🧠 AI is analysing vulnerabilities…');
    try {
      const res  = await authFetch('/api/ai/audit-explain', {
        method: 'POST',
        body:   JSON.stringify({
          vulnerabilities: auditResult.findings,
          contractCode,
        }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        /* FIX #3 — Safe AI response normalisation; never crash on bad shape */
        const aiSummary         = data.data.summary         || 'No summary available.';
        const aiRisks           = Array.isArray(data.data.risks)           ? data.data.risks           : [];
        const aiRecommendations = Array.isArray(data.data.recommendations) ? data.data.recommendations : [];

        setAuditResult(prev => {
          const enriched = [...prev.findings];
          /* risks is string[] — each string maps to the finding at same index */
          aiRisks.forEach((explanation, i) => {
            if (enriched[i]) enriched[i] = { ...enriched[i], aiDescription: String(explanation) };
          });
          return {
            ...prev,
            aiInsights:      { summary: aiSummary },
            recommendations: aiRecommendations.length ? aiRecommendations : prev.recommendations,
            findings:        enriched,
          };
        });
        toast.success('AI explanation ready!', { id: tid });
      } else {
        throw new Error(data.error || 'Failed to get AI explanation.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch AI explanation.', { id: tid });
    } finally {
      setIsExplaining(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────
     Render helpers
  ───────────────────────────────────────────────────────────────────── */

  const isActive = isSubmitting || isPolling;

  const chartData = auditResult ? {
    datasets: [{
      data: [
        auditResult.summary.critical || 0.01,
        auditResult.summary.high || 0.01,
        auditResult.summary.medium || 0.01,
        auditResult.summary.low || 0.01
      ],
      backgroundColor: ['#ef4444', '#f97316', '#a78bfa', '#60a5fa'],
      borderColor: 'transparent',
      borderWidth: 2,
      hoverOffset: 4,
    }],
  } : null;

  const totalFindings = auditResult ? Object.values(auditResult.summary).reduce((a,b) => a+b, 0) : 0;

  return (
    <div className="pg-wrap">

      {/* ── Header ── */}
      <div className="pg-head db-enter db-enter-1">
        <div className="pg-title">Security <em>Audit</em></div>
        <div className="pg-sub">
          Advanced scan powered by Slither static analysis + Gemini AI — the same engine used inside the generators.
        </div>
      </div>

      {/* FIX #4 — Empty state: shown when no audit is running and no result */}
      {!isActive && !auditResult && status !== 'failed' && (
        <div className="pg-card db-enter" style={{
          border: '1px dashed var(--surface)',
          background: 'var(--surface)',
          textAlign: 'center', padding: '28px 20px', marginBottom: 16,
        }}>
          <ShieldCheck size={36} style={{ margin: '0 auto 10px', color: 'var(--db-t3)' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--db-t2)', marginBottom: 6, fontFamily: 'var(--db-font)' }}>
            Ready to Audit
          </div>
          <div style={{ fontSize: 12, color: 'var(--db-t3)', maxWidth: 400, margin: '0 auto' }}>
            Paste your Solidity contract below and run a security audit to analyze potential risks.
            Results include Slither static analysis, AI explanations, and an exportable PDF report.
          </div>
        </div>
      )}

      {/* ── Input Card ── */}
      <div className="pg-card accent-top-red db-enter db-enter-2">
        {/* FIX #5 — Contract type selector for metadata */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
          <label className="pg-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Contract Type</label>
          <select
            value={contractType}
            onChange={e => setContractType(e.target.value)}
            disabled={isActive}
            className="pg-input"
            style={{ maxWidth: 180, padding: '7px 10px', fontSize: 12 }}
          >
            {['Custom','ERC-20 Token','ERC-721 NFT','Auction','DeFi','Governance','Other'].map(t =>
              <option key={t} value={t}>{t}</option>
            )}
          </select>
        </div>
        <label className="pg-label">📝 Paste Solidity Code</label>
        <textarea
          value={contractCode}
          onChange={e => setContractCode(e.target.value)}
          disabled={isActive}
          placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n// Paste your full contract here`}
          className="pg-textarea"
          style={{ minHeight: 200 }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={runAudit}
            disabled={isActive || !contractCode.trim()}
            className="pg-btn pg-btn-primary"
            style={{ flex: 1, padding: '12px 0', fontSize: 14 }}
          >
            {isActive ? (
              <><div className="pg-spinner" style={{ width: 16, height: 16 }} /> Scanning…</>
            ) : '🛡️ Run Security Audit'}
          </button>

          {auditResult && (
            <button
              onClick={resetScan}
              className="pg-btn pg-btn-outline"
              style={{ gap: 6 }}
            >
              <RefreshCw size={14} /> New Scan
            </button>
          )}
        </div>
      </div>

      {/* ── Job Progress Banner (while polling) ── */}
      {isActive && !auditResult && (
        <div className="pg-card db-enter db-enter-3"
          style={{ border: '1px solid rgba(93,169,233,.3)', textAlign: 'center', padding: '32px 24px' }}
        >
          {/* Spinner icon */}
          <svg
            style={{ animation: 'db-spin .9s linear infinite', width: 36, height: 36, color: 'var(--db-acc)', margin: '0 auto 16px' }}
            viewBox="0 0 24 24" fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>

          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 6, fontFamily: 'var(--db-font)' }}>
            Running Hybrid Security Audit
          </div>
          <div style={{ fontSize: 12, color: 'var(--db-t3)', marginBottom: 20 }}>
            {STATUS_LABEL[status] || 'Connecting to audit service…'}
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, borderRadius: 99, background: 'var(--surface)', overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${progress}%`,
              background: 'var(--db-acc)',
              transition: 'width .6s ease',
            }} />
          </div>

          <div style={{ marginTop: 10, fontFamily: 'var(--db-mono)', fontSize: 11, color: 'var(--db-t3)' }}>
            {progress}% complete · Slither + Gemini AI pipeline
          </div>
        </div>
      )}

      {/* FIX #8 — Failed state with dedicated Retry button */}
      {status === 'failed' && !auditResult && (
        <div className="pg-card db-enter db-enter-3"
          style={{ border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.04)', textAlign: 'center', padding: 32 }}
        >
          <ShieldAlert size={32} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>Audit Failed</div>
          <div style={{ fontSize: 13, color: 'var(--db-t3)', marginBottom: 20 }}>
            {error || 'The audit job encountered an error. This may be due to a timeout or a server issue.'}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={handleRetry} className="pg-btn pg-btn-primary" style={{ gap: 6 }}>
              <RefreshCw size={14} /> Retry Audit
            </button>
            <button onClick={resetScan} className="pg-btn pg-btn-outline" style={{ gap: 6 }}>
              New Scan
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {auditResult && (
        <div className="db-enter db-enter-3">

          {/* FIX #5 — Metadata row: engine, contract type, timestamp */}
          <div style={{
            display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
            padding: '10px 14px', borderRadius: 'var(--db-r-sm)', marginBottom: 14,
            background: 'var(--surface)', border: '.5px solid var(--db-br)',
            fontFamily: 'var(--db-mono)', fontSize: 11, color: 'var(--db-t3)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Cpu size={11} /> {auditResult.engineVersion}
            </span>
            <span>·</span>
            <span>Type: <strong style={{ color: 'var(--db-t2)' }}>{contractType}</strong></span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={11} /> {new Date(auditResult.scannedAt).toLocaleString()}
            </span>
            {auditResult.reportId && (
              <><span>·</span><span>ID: {auditResult.reportId.slice(-8)}</span></>
            )}
          </div>

          {/* Result header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={20} color="var(--db-acc)" />
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)' }}>
                Audit Analysis
              </span>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                background: 'rgba(93,169,233,.12)', color: 'var(--db-blue)',
                border: '1px solid rgba(93,169,233,.2)', fontWeight: 700,
              }}>
                Slither + Gemini
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Hidden printable template */}
              <AuditReportTemplate
                auditResult={auditResult}
                dateStr={new Date(auditResult.scannedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              />
              <button
                onClick={() => generatePDF('AutoCon_Audit_Report.pdf')}
                disabled={isExportingPDF}
                className="pg-btn pg-btn-outline"
                style={{ gap: 7 }}
              >
                {isExportingPDF
                  ? <div className="pg-spinner" style={{ width: 14, height: 14 }} />
                  : <Download size={14} />}
                {isExportingPDF ? 'Generating…' : 'Export PDF'}
              </button>
            </div>
          </div>

          {/* ── AI summary banner ── */}
          {auditResult.aiInsights?.summary && (
            <div className="pg-card db-enter db-enter-2" style={{
              background: 'rgba(93,169,233,.06)', border: '1px solid rgba(93,169,233,.2)',
              padding: '14px 18px', marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--db-blue)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                🤖 AI Summary
              </div>
              <div style={{ fontSize: 13, color: 'var(--db-t2)', lineHeight: 1.7 }}>
                {auditResult.aiInsights.summary}
              </div>
            </div>
          )}

          {/* ── Score + summary grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 160px 1fr', gap: 14, marginBottom: 16 }}>

            {/* Score circle */}
            <div className="pg-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 20px' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: scoreGrad(auditResult.score),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 32px ${scoreColor(auditResult.score)}30`, marginBottom: 12,
              }}>
                <div style={{
                  width: 82, height: 82, borderRadius: '50%', background: 'var(--db-s1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--db-mono)', fontSize: 28, fontWeight: 700, color: scoreColor(auditResult.score), lineHeight: 1 }}>
                    {auditResult.score}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--db-t3)' }}>/ 100</span>
                </div>
              </div>
              <span className={`pg-badge ${
                auditResult.riskLevel === 'LOW'      ? 'green' :
                auditResult.riskLevel === 'MEDIUM'   ? 'amber' :
                auditResult.riskLevel === 'CRITICAL' ? 'red'   : 'amber'
              }`}>
                {auditResult.riskLevel} Risk
              </span>
            </div>

            {/* Severity Doughnut Chart */}
            <div className="pg-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 12 }}>
                <Doughnut
                  data={chartData}
                  options={{
                    cutout: '72%', responsive: true, maintainAspectRatio: true,
                    animation: { duration: 800, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontFamily: 'var(--db-mono)', fontSize: 20, fontWeight: 700, color: 'var(--db-t1)', lineHeight: 1 }}>
                    {totalFindings}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--db-t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Vulnerabilities
              </div>
            </div>

            {/* Severity count grid */}
            <div className="pg-mini-stats cols-2" style={{ alignContent: 'start', height: '100%' }}>
              {[
                { label: 'Critical', count: auditResult.summary.critical, s: SEV.CRITICAL },
                { label: 'High',     count: auditResult.summary.high,     s: SEV.HIGH     },
                { label: 'Medium',   count: auditResult.summary.medium,   s: SEV.MEDIUM   },
                { label: 'Low',      count: auditResult.summary.low,      s: SEV.LOW      },
              ].map(({ label, count, s }) => (
                <div key={label} style={{
                  padding: '16px', borderRadius: 'var(--db-r)', height: '100%',
                  background: s.bg, border: `.5px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ fontFamily: 'var(--db-mono)', fontSize: 26, fontWeight: 600, color: s.text }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--db-t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI Explain button ── */}
          {auditResult.findings.length > 0 && !auditResult.findings.some(f => f.aiDescription) && (
            <button
              onClick={handleExplainAI}
              disabled={isExplaining}
              className="pg-btn"
              style={{
                position: 'relative', width: '100%', marginBottom: 16, padding: '12px 0',
                background: 'linear-gradient(135deg, rgba(124,58,237,.2), rgba(6,182,212,.2))',
                border: '1px solid rgba(124,58,237,.4)',
                color: '#ddd6fe', fontWeight: 700, fontSize: 14,
                justifyContent: 'center', gap: 8,
                boxShadow: '0 0 20px rgba(124,58,237,.15), inset 0 0 12px rgba(124,58,237,.1)',
                textShadow: '0 0 8px rgba(196,181,253,.3)',
                overflow: 'hidden', transition: 'all 0.3s ease',
              }}
            >
              {isExplaining
                ? <><div className="pg-spinner" style={{ width: 15, height: 15, borderTopColor: '#c4b5fd' }} /> AI is analysing vulnerabilities…</>
                : '✨ Explain All Findings with AI'}
            </button>
          )}

          {/* ── AI Recommendations ── */}
          {auditResult.recommendations.length > 0 && (
            <div className="pg-card db-enter" style={{ marginBottom: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 10, fontFamily: 'var(--db-font)' }}>
                💡 AI Recommendations
              </div>
              <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--db-t2)', fontSize: 13, lineHeight: 1.7 }}>
                {auditResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>
          )}

          {/* ── Findings list ── */}
          {auditResult.findings.length > 0 ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 12, fontFamily: 'var(--db-font)' }}>
                📋 Detailed Findings
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {auditResult.findings.map((f, idx) => {
                  const c   = SEV[f.severity] || SEV.LOW;
                  const open = expandedIdx === idx;
                  return (
                    <div key={idx} className="pg-card" style={{ borderLeft: `3px solid ${c.text}`, cursor: 'pointer', marginBottom: 0 }}
                      onClick={() => setExpandedIdx(open ? null : idx)}
                    >
                      {/* Finding header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span className={`pg-badge ${c.badge}`}>{f.severity}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)', flex: 1 }}>
                          {f.title}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>
                          {f.source}
                        </span>
                        {f.line > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>
                            Line {f.line}{f.additionalLines?.length ? `, ${f.additionalLines.join(', ')}` : ''}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--db-t3)' }}>{open ? '▲' : '▼'}</span>
                      </div>

                      {/* Expanded detail */}
                      {open && (
                        <div style={{ marginTop: 12 }}>
                          {/* AI explanation callout */}
                          {f.aiDescription && (
                            <div style={{
                              padding: '10px 14px', marginBottom: 10, borderRadius: 8,
                              background: 'rgba(124,58,237,.1)', borderLeft: '3px solid #8b5cf6',
                              color: '#c4b5fd', fontSize: 12, lineHeight: 1.6,
                            }}>
                              <span style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>✨ AI Explanation:</span>
                              {f.aiDescription}
                            </div>
                          )}

                          <p style={{ fontSize: 13, color: 'var(--db-t2)', lineHeight: 1.7, marginBottom: 10 }}>
                            {f.description}
                          </p>

                          {f.code && (
                            <div style={{ marginBottom: 10, borderRadius: 'var(--db-r-sm)', overflow: 'hidden', border: '.5px solid var(--db-br)' }}>
                              <SyntaxHighlighter
                                language="solidity"
                                style={vscDarkPlus}
                                customStyle={{ margin: 0, fontSize: 12, background: '#1e1e1e', padding: '12px' }}
                                wrapLines={true}
                              >
                                {f.code}
                              </SyntaxHighlighter>
                            </div>
                          )}

                          <div style={{
                            padding: '10px 14px', borderRadius: 'var(--db-r-sm)',
                            background: 'var(--db-acc-dd)', border: '.5px solid var(--db-br)',
                            fontSize: 12, color: 'var(--db-t2)', lineHeight: 1.6,
                          }}>
                            💡 <strong style={{ color: 'var(--db-acc)' }}>Recommendation:</strong> {f.advice}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── No vulnerabilities ── */
            <div className="pg-card" style={{ textAlign: 'center', padding: '48px 0' }}>
              <ShieldCheck size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--db-acc)', marginBottom: 6, fontFamily: 'var(--db-font)' }}>
                No Vulnerabilities Found!
              </div>
              <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>
                Your contract passed the Slither + AI security analysis.
              </div>
            </div>
          )}

          {/* Footer — new scan CTA */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={resetScan} className="pg-btn pg-btn-outline" style={{ gap: 7, margin: '0 auto' }}>
              <RefreshCw size={13} /> Run Another Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import JobStatusBadge from '../components/dashboard/JobStatusBadge';
import { usePlatformStore } from '../store/usePlatformStore';
import '../components/dashboard/styles/dashboard.css';

/* ─── localStorage keys ─────────────────────────────────────────────────── */
const LS_TYPE   = 'ac_jobs_typeFilter';
const LS_STATUS = 'ac_jobs_statusFilter';
const MAX_JOBS  = 50;   // Performance guard — only show/track last 50 jobs

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const TYPE_META = {
  audit:        { label: 'Security Audit',         icon: '⚑', color: '#a78bfa' },
  verification: { label: 'Contract Verification',  icon: '✦', color: '#60a5fa' },
};

const STATUS_STYLE = {
  pending:    { color: '#94a3b8', bg: 'rgba(148,163,184,.1)',  border: 'rgba(148,163,184,.2)'  },
  processing: { color: '#fbbf24', bg: 'rgba(251,191,36,.1)',   border: 'rgba(251,191,36,.25)'  },
  completed:  { color: '#34d399', bg: 'rgba(52,211,153,.1)',   border: 'rgba(52,211,153,.25)'  },
  failed:     { color: '#f87171', bg: 'rgba(248,113,113,.1)',  border: 'rgba(248,113,113,.25)' },
};

const ICON = {
  pending:    '⏳',
  processing: '⚙',
  completed:  '✓',
  failed:     '✕',
};

function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 72, borderRadius: 'var(--db-r)',
          background: 'var(--surface)',
          animation: 'db-pulse 1.6s ease infinite',
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="db-stat-card" style={{ borderTop: `2px solid ${accent}` }}>
      <div className="db-sc-top">
        <span className="db-sc-label">{label}</span>
        <div className="db-sc-ico" style={{ background: `${accent}18` }}>{icon}</div>
      </div>
      <div className="db-sc-num" style={{ color: accent, fontSize: 32 }}>{value ?? 0}</div>
    </div>
  );
}

/* ─── Filter Pill ────────────────────────────────────────────────────────── */
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`db-tp${active ? ' on' : ''}`}
    >
      {children}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
const POLL_MS = 15_000;  // Reduced from 10s — badges handle active-job polling
const FILTERS = ['all', 'audit', 'verification'];
const STATUS_FILTERS = ['all', 'pending', 'processing', 'completed', 'failed'];

/* FIX #4 — Normalise status to lowercase everywhere */
const norm = (s) => (s || '').toLowerCase();

export default function JobsPage() {
  const { authFetch } = useAuth();
  const { jobs: rawJobs, stats: storeStats, isInitialLoad, lastSynced } = usePlatformStore();
  const loading = isInitialLoad;
  const error = null;

  const jobs = (rawJobs || [])
    .map(j => ({ ...j, status: norm(j.status) }))
    .sort((a, b) => {
      const aActive = a.status === 'pending' || a.status === 'processing';
      const bActive = b.status === 'pending' || b.status === 'processing';
      if (aActive !== bActive) return aActive ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, MAX_JOBS);
    
  const stats = storeStats || {
    audit: { pending: 0, processing: 0, completed: 0, failed: 0 },
    verification: { pending: 0, processing: 0, completed: 0, failed: 0 }
  };
  const lastFetched = lastSynced ? new Date(lastSynced) : null;

  /* FIX #8 — Restore filters from localStorage */
  const [typeFilter,   setTypeFilter]   = useState(() => localStorage.getItem(LS_TYPE)   || 'all');
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem(LS_STATUS) || 'all');
  /* FIX #9 — Detail panel */
  const [selectedJob,  setSelectedJob]  = useState(null);

  const intervalRef    = useRef(null);
  /* FIX #6 — Track last notified status per jobId to avoid duplicate toasts */
  const notifiedRef    = useRef({});  // { jobId: lastStatus }

  /* FIX #8 — Persist filter changes to localStorage */
  const setType = (v) => { setTypeFilter(v);   localStorage.setItem(LS_TYPE,   v); };
  const setStat = (v) => { setStatusFilter(v); localStorage.setItem(LS_STATUS, v); };



  /* ── Derived stats ────────────────────────────────────────────────────── */
  let totalJobs = 0, activeJobs = 0, completedJobs = 0, failedJobs = 0;
  
  if (storeStats) {
    const v = storeStats.verification || {};
    const a = storeStats.audit || {};
    
    activeJobs = (v.pending || 0) + (v.processing || 0) + (a.pending || 0) + (a.processing || 0);
    completedJobs = (v.completed || 0) + (a.completed || 0);
    failedJobs = (v.failed || 0) + (a.failed || 0);
    totalJobs = activeJobs + completedJobs + failedJobs;
  } else {
    // fallback if stats not loaded
    totalJobs     = jobs.length;
    activeJobs    = jobs.filter(j => j.status === 'pending' || j.status === 'processing').length;
    completedJobs = jobs.filter(j => j.status === 'completed').length;
    failedJobs    = jobs.filter(j => j.status === 'failed').length;
  }

  /* FIX #4 — normalised filter comparison */
  const visible = jobs.filter(j => {
    const matchType   = typeFilter   === 'all' || j.type          === typeFilter;
    const matchStatus = statusFilter === 'all' || norm(j.status)  === statusFilter;
    return matchType && matchStatus;
  });

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="pg-wrap">

      {/* ── Header ── */}
      <div className="pg-head db-enter db-enter-1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="pg-title">Activity <em>Monitor</em></div>
          <div className="pg-sub">
            Real-time view of all background jobs — audits, verifications, and system tasks.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
          {lastFetched && (
            <span style={{ fontFamily: 'var(--db-mono)', fontSize: 10, color: 'var(--db-t3)' }}>
              Updated {relTime(lastFetched.toISOString())}
            </span>
          )}
          <button
            onClick={() => window.location.reload()}
            className="pg-btn pg-btn-outline"
            style={{ padding: '7px 14px', gap: 6, fontSize: 12 }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="db-stat-row db-enter db-enter-2" style={{ marginBottom: 20 }}>
        <StatCard label="Total Jobs"     value={totalJobs}     icon="◈" accent="var(--db-acc)"   />
        <StatCard label="Active"         value={activeJobs}    icon="⚙" accent="var(--db-amber)" />
        <StatCard label="Completed"      value={completedJobs} icon="✓" accent="#34d399"         />
      </div>

      {/* ── Per-type stats from backend ── */}
      {stats && (
        <div className="db-enter db-enter-3" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
        }}>
          {['audit', 'verification'].map(t => {
            const s = stats[t] || {};
            const meta = TYPE_META[t];
            return (
              <div key={t} className="pg-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16, color: meta.color }}>{meta.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)' }}>
                    {meta.label}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {['pending','processing','completed','failed'].map(st => {
                    const ss = STATUS_STYLE[st];
                    return (
                      <div key={st} style={{
                        textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                        background: ss.bg, border: `.5px solid ${ss.border}`,
                      }}>
                        <div style={{ fontFamily: 'var(--db-mono)', fontSize: 18, fontWeight: 600, color: ss.color }}>
                          {s[st] ?? 0}
                        </div>
                        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--db-t3)', marginTop: 2 }}>
                          {st}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Job list card ── */}
      <div className="db-enter db-enter-4">
        <div className="db-table-card">

          {/* Table header with filters */}
          <div className="db-table-head">
            <span className="db-th-title">Job History</span>

            {/* Live indicator when active jobs exist */}
            {activeJobs > 0 && (
              <span className="db-live-badge">
                <span className="db-live-dot" /> {activeJobs} Active
              </span>
            )}

            {/* Type filter — persisted via setType() */}
            <div className="db-tab-pills">
              {FILTERS.map(f => (
                <Pill key={f} active={typeFilter === f} onClick={() => setType(f)}>
                  {f === 'all' ? 'All Types' : TYPE_META[f]?.label}
                </Pill>
              ))}
            </div>

            {/* Status filter — persisted via setStat() */}
            <div className="db-tab-pills">
              {STATUS_FILTERS.map(f => (
                <Pill key={f} active={statusFilter === f} onClick={() => setStat(f)}>
                  {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Pill>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 18px' }}>

            {/* Loading skeleton */}
            {loading && <Skeleton />}

            {/* Error */}
            {!loading && error && (
              <div style={{
                textAlign: 'center', padding: '40px 0',
                color: '#f87171', fontSize: 13, fontFamily: 'var(--db-font)',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && visible.length === 0 && (
              <div style={{ textAlign: 'center', padding: '52px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: .4 }}>◈</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--db-t2)', marginBottom: 6, fontFamily: 'var(--db-font)' }}>
                  {jobs.length === 0 ? 'No background jobs yet' : 'No jobs match this filter'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--db-t3)' }}>
                  {jobs.length === 0
                    ? 'Jobs appear here when you run a Security Audit or verify a contract.'
                    : 'Try changing the type or status filter above.'}
                </div>
              </div>
            )}

            {/* Job rows */}
            {!loading && !error && visible.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visible.map(job => {
                  /* FIX #4 — status already normalised in fetchAll */
                  const status   = job.status;
                  const meta     = TYPE_META[job.type] || TYPE_META.audit;
                  const ss       = STATUS_STYLE[status] || STATUS_STYLE.pending;
                  const isActive = status === 'pending' || status === 'processing';
                  const isSel    = selectedJob?.jobId === job.jobId;

                  return (
                    <div key={job.jobId}>
                      {/* FIX #9 — click row to open detail panel */}
                      <div
                        onClick={() => setSelectedJob(isSel ? null : job)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '36px 1fr auto auto',
                          alignItems: 'center',
                          gap: 14, padding: '14px 16px',
                          borderRadius: isSel ? 'var(--db-r) var(--db-r) 0 0' : 'var(--db-r)',
                          background: isSel ? 'var(--surface)' : 'var(--surface)',
                          border: `.5px solid ${isActive ? ss.border : isSel ? 'var(--db-br2)' : 'var(--db-br)'}`,
                          cursor: 'pointer', transition: 'background .15s, border-color .15s',
                        }}
                      >
                        {/* Type icon */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 9,
                          background: `${meta.color}15`, border: `.5px solid ${meta.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, color: meta.color, flexShrink: 0,
                        }}>
                          {meta.icon}
                        </div>

                        {/* Info */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)' }}>
                              {meta.label}
                            </span>
                            {status === 'completed' && job.resultSummary?.overallRisk && (
                              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, background: 'rgba(167,139,250,.12)', color: '#a78bfa', border: '.5px solid rgba(167,139,250,.25)' }}>
                                Risk: {job.resultSummary.overallRisk}
                              </span>
                            )}
                            {status === 'completed' && job.resultSummary?.isVerified && (
                              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, background: 'rgba(52,211,153,.1)', color: '#34d399', border: '.5px solid rgba(52,211,153,.25)' }}>
                                ✓ Verified
                              </span>
                            )}
                            {/* FIX #5 — always show error pill on failed */}
                            {status === 'failed' && (
                              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, background: 'rgba(248,113,113,.1)', color: '#f87171', border: '.5px solid rgba(248,113,113,.25)' }}>
                                ✕ Failed
                              </span>
                            )}
                          </div>
                          <div style={{ fontFamily: 'var(--db-mono)', fontSize: 10, color: 'var(--db-t3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <span title={job.jobId}>ID: {job.jobId.slice(0, 16)}…</span>
                            <span>Created {relTime(job.createdAt)}</span>
                            {job.completedAt && <span>Finished {relTime(job.completedAt)}</span>}
                            {job.attempts > 1 && <span style={{ color: '#f59e0b' }}>Attempts: {job.attempts}</span>}
                          </div>
                        </div>

                        {/* Progress bar for active jobs */}
                        {isActive && (
                          <div style={{ width: 80, textAlign: 'center' }}>
                            <div style={{ height: 4, borderRadius: 99, background: 'var(--surface)', overflow: 'hidden', marginBottom: 4 }}>
                              <div style={{ height: '100%', borderRadius: 99, width: status === 'processing' ? '55%' : '10%', background: ss.color, transition: 'width .5s ease' }} />
                            </div>
                            <span style={{ fontFamily: 'var(--db-mono)', fontSize: 9, color: 'var(--db-t3)' }}>
                              {status === 'processing' ? '55%' : '10%'}
                            </span>
                          </div>
                        )}

                        {/* FIX #6 — JobStatusBadge has toast dedup via notifiedRef; terminal = plain pill */}
                        <div style={{ flexShrink: 0 }}>
                          {isActive ? (
                            <JobStatusBadge jobId={job.jobId} type={job.type} compact />
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, whiteSpace: 'nowrap' }}>
                              {ICON[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* FIX #9 — Expanded detail panel */}
                      {isSel && (
                        <div style={{
                          padding: '14px 18px',
                          borderRadius: '0 0 var(--db-r) var(--db-r)',
                          background: 'var(--surface)',
                          border: '.5px solid var(--db-br2)', borderTop: 'none',
                          fontFamily: 'var(--db-mono)', fontSize: 11,
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: job.error ? 10 : 0 }}>
                            <div>
                              <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 3 }}>Full Job ID</div>
                              <div style={{ color: 'var(--db-t1)', wordBreak: 'break-all' }}>{job.jobId}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 3 }}>Started</div>
                              <div style={{ color: 'var(--db-t2)' }}>{job.startedAt ? new Date(job.startedAt).toLocaleString() : '—'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 3 }}>Completed</div>
                              <div style={{ color: 'var(--db-t2)' }}>{job.completedAt ? new Date(job.completedAt).toLocaleString() : '—'}</div>
                            </div>
                          </div>
                          {/* FIX #5 — Full error detail in panel */}
                          {job.error && (
                            <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,.08)', border: '.5px solid rgba(239,68,68,.2)', color: '#fca5a5', fontSize: 11, lineHeight: 1.5 }}>
                              ✕ {job.error}
                            </div>
                          )}
                          {status === 'completed' && job.resultSummary?.reportId && (
                            <div style={{ marginTop: 8, color: 'var(--db-acc)', fontSize: 11 }}>
                              Report ID: {job.resultSummary.reportId}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer: count + auto-refresh notice */}
          {!loading && visible.length > 0 && (
            <div style={{
              padding: '10px 18px', borderTop: '.5px solid var(--db-br)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--db-mono)', fontSize: 10, color: 'var(--db-t3)',
            }}>
              <span>
                {visible.length} of {jobs.length} job{jobs.length !== 1 ? 's' : ''} shown
                {jobs.length === MAX_JOBS && ' (capped at 50)'}
              </span>
              <span>
                {activeJobs > 0
                  ? `${activeJobs} active job${activeJobs > 1 ? 's' : ''} — badges polling live`
                  : 'Auto-refreshing every 15s'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

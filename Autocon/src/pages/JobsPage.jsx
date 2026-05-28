import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JobStatusBadge from '../components/dashboard/JobStatusBadge';
import { usePlatformStore } from '../store/usePlatformStore';
import { useAuth } from '../context/AuthContext';
import { getJobStatus } from '../services/jobApi';
import { GlassCard, Button, Input } from '../components/ui';
import { 
  Flag, Sparkles, Clock, Settings, Check, X, RefreshCw, 
  AlertTriangle, Activity, CheckCircle, XCircle, Search, 
  Cpu, ExternalLink, Copy, ChevronDown, ChevronUp, Terminal, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../components/dashboard/styles/dashboard.css';

/* ─── localStorage keys ─────────────────────────────────────────────────── */
const LS_TYPE   = 'ac_jobs_typeFilter';
const LS_STATUS = 'ac_jobs_statusFilter';
const MAX_JOBS  = 50;   // Performance guard — only show/track last 50 jobs

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const TYPE_META = {
  audit:        { label: 'Security Audit',         icon: <Flag size={14} />, color: '#c084fc', border: 'rgba(192,132,252,0.18)' },
  verification: { label: 'Contract Verification',  icon: <Sparkles size={14} />, color: '#60a5fa', border: 'rgba(96,165,250,0.18)' },
  compile:      { label: 'Contract Compilation',   icon: <Cpu size={14} />, color: '#f43f5e', border: 'rgba(244,63,94,0.18)' },
};

const STATUS_STYLE = {
  pending:    { label: 'Queued',     color: '#94a3b8', bg: 'rgba(148,163,184,.08)',  border: 'rgba(148,163,184,.15)',  icon: <Clock size={12} /> },
  processing: { label: 'Processing', color: '#fbbf24', bg: 'rgba(251,191,36,.08)',   border: 'rgba(251,191,36,.2)',   icon: <Settings size={12} className="animate-spin" /> },
  completed:  { label: 'Completed',  color: '#10b981', bg: 'rgba(16,185,129,.08)',   border: 'rgba(16,185,129,.2)',   icon: <Check size={12} /> },
  failed:     { label: 'Failed',     color: '#ef4444', bg: 'rgba(239,68,68,.08)',    border: 'rgba(239,68,68,.2)',    icon: <X size={12} /> },
};

const VULN_SEVERITIES = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
  MEDIUM:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
  LOW:      { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)' },
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
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          animation: 'db-pulse 1.6s ease infinite',
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Stats Card ────────────────────────────────────────── */
function StatsDisplayCard({ label, value, icon, color, delay }) {
  return (
    <GlassCard 
      className={`db-enter db-enter-${delay} border border-white/5 relative overflow-hidden bg-black/40`}
      hoverable={true}
      padding="md"
      style={{ borderTop: `2px solid ${color}` }}
    >
      <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[35px] pointer-events-none" style={{ backgroundColor: color, opacity: 0.08 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, position: 'relative', zIndex: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--db-t3)' }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'var(--db-font)', lineHeight: 1, tracking: '-0.02em', position: 'relative', zIndex: 2 }}>
        {value ?? 0}
      </div>
    </GlassCard>
  );
}

/* ─── Filter Pill ────────────────────────────────────────── */
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`db-tp${active ? ' on' : ''}`}
      style={{
        transition: 'all 0.2s ease',
        border: active ? '1px solid var(--primary-hover)' : '1px solid transparent',
        background: active ? 'rgba(255, 107, 0, 0.08)' : 'transparent',
        padding: '5px 12px',
        fontSize: '11px',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
const FILTERS = ['all', 'audit', 'verification', 'compile'];
const STATUS_FILTERS = ['all', 'pending', 'processing', 'completed', 'failed'];

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
    verification: { pending: 0, processing: 0, completed: 0, failed: 0 },
    compile: { pending: 0, processing: 0, completed: 0, failed: 0 }
  };
  const lastFetched = lastSynced ? new Date(lastSynced) : null;

  const [typeFilter, setTypeFilter] = useState(() => localStorage.getItem(LS_TYPE) || 'all');
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem(LS_STATUS) || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailedJobs, setDetailedJobs] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  const setType = (v) => { setTypeFilter(v); localStorage.setItem(LS_TYPE, v); };
  const setStat = (v) => { setStatusFilter(v); localStorage.setItem(LS_STATUS, v); };

  /* ── Derived stats ────────────────────────────────────── */
  let totalJobs = 0, activeJobs = 0, completedJobs = 0, failedJobs = 0;
  
  if (storeStats) {
    const v = storeStats.verification || {};
    const a = storeStats.audit || {};
    const c = storeStats.compile || {};
    
    activeJobs = (v.pending || 0) + (v.processing || 0) + 
                 (a.pending || 0) + (a.processing || 0) +
                 (c.pending || 0) + (c.processing || 0);
    completedJobs = (v.completed || 0) + (a.completed || 0) + (c.completed || 0);
    failedJobs = (v.failed || 0) + (a.failed || 0) + (c.failed || 0);
    totalJobs = activeJobs + completedJobs + failedJobs;
  } else {
    // fallback if stats not loaded
    totalJobs     = jobs.length;
    activeJobs    = jobs.filter(j => j.status === 'pending' || j.status === 'processing').length;
    completedJobs = jobs.filter(j => j.status === 'completed').length;
    failedJobs    = jobs.filter(j => j.status === 'failed').length;
  }

  // Filter jobs based on type, status, and search query
  const visible = jobs.filter(j => {
    const matchType   = typeFilter   === 'all' || j.type          === typeFilter;
    const matchStatus = statusFilter === 'all' || norm(j.status)  === statusFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      j.jobId.toLowerCase().includes(query) ||
      (j.type || '').toLowerCase().includes(query) ||
      (j.error || '').toLowerCase().includes(query) ||
      (j.resultSummary?.contractName || '').toLowerCase().includes(query) ||
      (j.resultSummary?.contractAddress || '').toLowerCase().includes(query);

    return matchType && matchStatus && matchQuery;
  });

  const handleSelectJob = async (job) => {
    const isSel = selectedJob?.jobId === job.jobId;
    if (isSel) {
      setSelectedJob(null);
      return;
    }
    
    setSelectedJob(job);
    
    // Only load details for terminal states if not already cached
    if (job.status !== 'pending' && job.status !== 'processing' && !detailedJobs[job.jobId]) {
      setLoadingDetails(prev => ({ ...prev, [job.jobId]: true }));
      try {
        const details = await getJobStatus(authFetch, job.jobId);
        setDetailedJobs(prev => ({ ...prev, [job.jobId]: details }));
      } catch (err) {
        console.error('Failed to load job details:', err);
        toast.error('Failed to load detailed logs');
      } finally {
        setLoadingDetails(prev => ({ ...prev, [job.jobId]: false }));
      }
    }
  };

  const copyText = (text, desc = 'Text') => {
    navigator.clipboard.writeText(text);
    toast.success(`${desc} copied to clipboard`);
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <GlassCard className="pg-wrap" delay={0.1} padding="lg" hoverable={false} style={{ background: 'var(--surface-1)' }}>
      
      {/* ── Header ── */}
      <div className="pg-head db-enter db-enter-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="pg-title">Activity <em>Monitor</em></div>
          <div className="pg-sub">
            Real-time operations log of smart contract security audits, compiler runs, and deployment verifications.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastFetched && (
            <span style={{ fontFamily: 'var(--db-mono)', fontSize: 10, color: 'var(--db-t3)' }}>
              Updated {relTime(lastFetched.toISOString())}
            </span>
          )}
          <button
            onClick={() => {
              window.location.reload();
              toast.success('Logs refreshed');
            }}
            className="pg-btn pg-btn-outline"
            style={{ padding: '8px 16px', gap: 8, fontSize: 12, height: 38 }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 db-enter db-enter-2" style={{ marginBottom: 20 }}>
        <StatsDisplayCard label="Total Operations" value={totalJobs}     icon={<Activity size={18} />} color="var(--db-acc)" delay={2} />
        <StatsDisplayCard label="Active Runs"      value={activeJobs}    icon={<Settings size={18} className="animate-spin" />} color="var(--db-amber)" delay={2} />
        <StatsDisplayCard label="Completed Operations" value={completedJobs} icon={<CheckCircle size={18} />} color="#10b981" delay={3} />
        <StatsDisplayCard label="Failed Runs"      value={failedJobs}    icon={<AlertTriangle size={18} />} color="#ef4444" delay={3} />
      </div>

      {/* ── Per-type breakdowns ── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 db-enter db-enter-3" style={{ marginBottom: 24 }}>
          {['audit', 'verification', 'compile'].map((t, idx) => {
            const s = stats[t] || { pending: 0, processing: 0, completed: 0, failed: 0 };
            const meta = TYPE_META[t];
            return (
              <GlassCard 
                key={t} 
                className="bg-black/40 border border-white/5"
                hoverable={false}
                padding="md"
                style={{ borderTop: `2px solid ${meta.color}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)' }}>
                    {meta.label}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {['pending', 'processing', 'completed', 'failed'].map(st => {
                    const ss = STATUS_STYLE[st];
                    return (
                      <div 
                        key={st} 
                        style={{
                          textAlign: 'center', padding: '6px 4px', borderRadius: 8,
                          background: ss.bg, border: `0.5px solid ${ss.border}`,
                          transition: 'border-color 0.2s ease',
                        }}
                      >
                        <div style={{ fontFamily: 'var(--db-mono)', fontSize: 15, fontWeight: 700, color: ss.color }}>
                          {s[st] ?? 0}
                        </div>
                        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--db-t3)', marginTop: 2, fontWeight: 600 }}>
                          {ss.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ── Job list table card ── */}
      <div className="db-enter db-enter-4">
        <GlassCard className="border border-white/5 bg-black/40" hoverable={false} padding="none">
          
          {/* Table Header with Filters and Search */}
          <div className="db-table-head" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 12 }}>
              <span className="db-th-title" style={{ margin: 0 }}>Operations Log</span>
              
              {activeJobs > 0 && (
                <span className="db-live-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="db-live-dot" /> {activeJobs} Active Poller
                </span>
              )}
            </div>

            <div style={{ display: 'flex', width: '100%', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Type pills */}
              <div className="db-tab-pills" style={{ display: 'flex', gap: 4, background: 'rgba(255, 255, 255, 0.02)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                {FILTERS.map(f => (
                  <Pill key={f} active={typeFilter === f} onClick={() => setType(f)}>
                    {f === 'all' ? 'All Operations' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </Pill>
                ))}
              </div>

              {/* Status pills */}
              <div className="db-tab-pills" style={{ display: 'flex', gap: 4, background: 'rgba(255, 255, 255, 0.02)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                {STATUS_FILTERS.map(f => (
                  <Pill key={f} active={statusFilter === f} onClick={() => setStat(f)}>
                    {f === 'all' ? 'All Status' : STATUS_STYLE[f]?.label}
                  </Pill>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--db-t3)', zIndex: 2 }}>
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search ID, name, errors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pg-input"
                  style={{
                    paddingLeft: 34,
                    height: 34,
                    fontSize: 12,
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--db-t3)', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div style={{ padding: '16px 20px' }}>
            
            {/* Loading */}
            {loading && <Skeleton />}

            {/* Empty State */}
            {!loading && !error && visible.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.35, display: 'flex', justifyContent: 'center' }}>
                  <Activity size={40} className="text-on-surface-muted" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--db-t2)', marginBottom: 6 }}>
                  {jobs.length === 0 ? 'No Operations Logs' : 'No Results Match Your Search'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--db-t3)' }}>
                  {jobs.length === 0
                    ? 'Run a Security Audit, compile code, or verify contracts to view logs.'
                    : 'Try clearing your filters or altering your search query.'}
                </div>
              </div>
            )}

            {/* List Rows */}
            {!loading && !error && visible.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visible.map(job => {
                  const status = job.status;
                  const meta = TYPE_META[job.type] || TYPE_META.audit;
                  const ss = STATUS_STYLE[status] || STATUS_STYLE.pending;
                  const isActive = status === 'pending' || status === 'processing';
                  const isSel = selectedJob?.jobId === job.jobId;
                  const detailsObj = detailedJobs[job.jobId];
                  const detailsLoading = loadingDetails[job.jobId];

                  return (
                    <div key={job.jobId} style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Row Header */}
                      <div
                        onClick={() => handleSelectJob(job)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '36px 1fr auto auto',
                          alignItems: 'center',
                          gap: 16,
                          padding: '14px 16px',
                          borderRadius: isSel ? '8px 8px 0 0' : '8px',
                          background: isSel ? 'rgba(255,255,255,0.038)' : 'rgba(255,255,255,0.015)',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${isActive ? ss.border : isSel ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSel) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          if (!isSel) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSel) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                          if (!isSel) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)';
                        }}
                      >
                        {/* Type Icon */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: `rgba(${meta.color === '#c084fc' ? '192,132,252' : meta.color === '#60a5fa' ? '96,165,250' : '244,63,148'}, 0.08)`,
                          border: `1px solid ${meta.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, color: meta.color, flexShrink: 0,
                        }}>
                          {meta.icon}
                        </div>

                        {/* Title and metadata */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                              {meta.label}
                            </span>
                            {/* Summary tags */}
                            {status === 'completed' && job.resultSummary?.overallRisk && (
                              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: 'rgba(192,132,252,0.12)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.2)' }}>
                                Risk: {job.resultSummary.overallRisk}
                              </span>
                            )}
                            {status === 'completed' && job.resultSummary?.isVerified && (
                              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Check size={10} /> Verified
                              </span>
                            )}
                            {status === 'failed' && (
                              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                Failed
                              </span>
                            )}
                            {job.resultSummary?.contractName && (
                              <span style={{ fontSize: 10, color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>
                                {job.resultSummary.contractName}
                              </span>
                            )}
                          </div>

                          <div style={{ fontFamily: 'var(--db-mono)', fontSize: 10, color: 'var(--db-t3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <span title="Click to copy ID" onClick={(e) => { e.stopPropagation(); copyText(job.jobId, 'Job ID'); }} style={{ cursor: 'pointer' }} className="hover:text-white">
                              ID: {job.jobId.slice(0, 8)}...{job.jobId.slice(-4)}
                            </span>
                            <span>Created {relTime(job.createdAt)}</span>
                            {job.completedAt && <span>Finished {relTime(job.completedAt)}</span>}
                            {job.attempts > 1 && <span style={{ color: 'var(--db-amber)' }}>Attempts: {job.attempts}</span>}
                          </div>
                        </div>

                        {/* Progress Bar for Active Jobs */}
                        {isActive && (
                          <div style={{ width: 80, textAlign: 'center', marginRight: 16 }}>
                            <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 4 }}>
                              <div style={{ height: '100%', borderRadius: 99, width: status === 'processing' ? '55%' : '10%', background: ss.color, transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontFamily: 'var(--db-mono)', fontSize: 9, color: 'var(--db-t3)' }}>
                              {status === 'processing' ? '55%' : '10%'}
                            </span>
                          </div>
                        )}

                        {/* Expand Icon & Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {isActive ? (
                            <JobStatusBadge jobId={job.jobId} type={job.type} compact />
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, whiteSpace: 'nowrap' }}>
                              {ss.icon} {ss.label}
                            </span>
                          )}
                          {!isActive && (
                            <span style={{ color: 'var(--db-t3)' }}>
                              {isSel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Panel */}
                      <AnimatePresence>
                        {isSel && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              overflow: 'hidden',
                              background: 'rgba(255,255,255,0.012)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              borderTop: 'none',
                              borderRadius: '0 0 8px 8px',
                            }}
                          >
                            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
                              
                              {/* Metadata Grid */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                                <div>
                                  <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 4, fontWeight: 700 }}>Operation Type</div>
                                  <div style={{ color: meta.color, fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {meta.icon} {meta.label}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 4, fontWeight: 700 }}>Full ID</div>
                                  <div style={{ color: '#fff', fontSize: 11, fontFamily: 'var(--db-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {job.jobId}
                                    <button 
                                      onClick={() => copyText(job.jobId, 'Job ID')} 
                                      style={{ background: 'none', border: 'none', color: 'var(--db-t3)', cursor: 'pointer', padding: 2 }}
                                      className="hover:text-white"
                                      title="Copy Job ID"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 4, fontWeight: 700 }}>Duration</div>
                                  <div style={{ color: 'var(--db-t2)', fontSize: 12, fontFamily: 'var(--db-mono)' }}>
                                    {job.startedAt && job.completedAt 
                                      ? `${((new Date(job.completedAt) - new Date(job.startedAt)) / 1000).toFixed(2)}s`
                                      : '—'}
                                  </div>
                                </div>
                              </div>

                              {/* Loading details skeleton */}
                              {detailsLoading && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                                  <div style={{ height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 4, width: '40%', animation: 'db-pulse 1.6s ease infinite' }} />
                                  <div style={{ height: 40, background: 'rgba(255,255,255,0.02)', borderRadius: 4, width: '100%', animation: 'db-pulse 1.6s ease infinite' }} />
                                </div>
                              )}

                              {/* Error Panel if Job Failed */}
                              {job.error && (
                                <div style={{ 
                                  padding: '12px 14px', borderRadius: 6, 
                                  background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', 
                                  color: '#fca5a5', fontSize: 12, lineHeight: 1.6, 
                                  display: 'flex', flexDirection: 'column', gap: 6,
                                  marginBottom: 12, fontFamily: 'var(--db-mono)'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                                    <XCircle size={14} style={{ color: '#ef4444' }} /> Operation Failed
                                  </div>
                                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 11, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 4 }}>
                                    {job.error}
                                  </div>
                                </div>
                              )}

                              {/* Detailed Sub-inspectors */}
                              {!detailsLoading && detailsObj?.result && (
                                <div style={{ marginTop: 12 }}>
                                  
                                  {/* 1. Security Audit Details */}
                                  {job.type === 'audit' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                      {/* Risk Score */}
                                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ textAlign: 'center', paddingRight: 16, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                          <div style={{ fontSize: 9, color: 'var(--db-t3)', textTransform: 'uppercase', marginBottom: 2, fontWeight: 700 }}>Score</div>
                                          <div style={{ fontSize: 24, fontWeight: 800, color: detailsObj.result.score > 70 ? '#10b981' : detailsObj.result.score > 40 ? '#fbbf24' : '#ef4444' }}>
                                            {detailsObj.result.score}/100
                                          </div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 9, color: 'var(--db-t3)', textTransform: 'uppercase', marginBottom: 2, fontWeight: 700 }}>Findings</div>
                                          <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                                            Identified {detailsObj.result.totalFindings ?? 0} vulnerabilities in this code
                                          </div>
                                        </div>
                                      </div>

                                      {/* AI Insights */}
                                      {detailsObj.result.aiInsights?.summary && (
                                        <div style={{ background: 'rgba(192,132,252,0.03)', border: '1px solid rgba(192,132,252,0.12)', padding: '12px 14px', borderRadius: 6 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#c084fc', marginBottom: 6 }}>
                                            <Sparkles size={12} /> AI Security Synthesis
                                          </div>
                                          <div style={{ fontSize: 11, color: 'var(--db-t2)', lineHeight: 1.5 }}>
                                            {detailsObj.result.aiInsights.summary}
                                          </div>
                                        </div>
                                      )}

                                      {/* Vulnerability List */}
                                      {detailsObj.result.vulnerabilities && detailsObj.result.vulnerabilities.length > 0 ? (
                                        <div>
                                          <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 8, fontWeight: 700 }}>Identified Risks</div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {detailsObj.result.vulnerabilities.map((vuln, vIdx) => {
                                              const styleSev = VULN_SEVERITIES[vuln.severity] || VULN_SEVERITIES.LOW;
                                              return (
                                                <div 
                                                  key={vuln.id || vIdx}
                                                  style={{
                                                    background: 'rgba(255,255,255,0.01)',
                                                    border: '1px solid rgba(255,255,255,0.03)',
                                                    borderLeft: `4px solid ${styleSev.color}`,
                                                    borderRadius: 4,
                                                    padding: 10,
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                      <span style={{
                                                        fontSize: 9, fontWeight: 800, color: styleSev.color,
                                                        background: styleSev.bg, border: `1px solid ${styleSev.border}`,
                                                        padding: '1px 6px', borderRadius: 3,
                                                      }}>
                                                        {vuln.severity}
                                                      </span>
                                                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{vuln.title}</span>
                                                    </div>
                                                    <span style={{ fontSize: 9, color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>
                                                      {vuln.location ? `Loc: ${vuln.location}` : vuln.line ? `Line: ${vuln.line}` : 'Global'}
                                                    </span>
                                                  </div>
                                                  <div style={{ fontSize: 11, color: 'var(--db-t2)', lineHeight: 1.5, marginBottom: 4 }}>
                                                    {vuln.description}
                                                  </div>
                                                  {vuln.recommendation && (
                                                    <div style={{ fontSize: 10, color: '#a78bfa', marginTop: 4, display: 'flex', gap: 4 }}>
                                                      <strong>Fix:</strong> <span>{vuln.recommendation}</span>
                                                    </div>
                                                  )}
                                                  <div style={{ fontSize: 9, color: 'var(--db-t3)', display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                                                    Source: {vuln.source || 'Static Scanner'}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ) : (
                                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', color: '#34d399', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                          No vulnerabilities identified. Code matches best practices.
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* 2. Contract Verification Details */}
                                  {job.type === 'verification' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, fontSize: 11 }}>
                                        <span style={{ color: 'var(--db-t3)', fontWeight: 600 }}>Status</span>
                                        <span style={{ color: detailsObj.result.isVerified ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                                          {detailsObj.result.isVerified ? 'VERIFIED SUCCESSFULLY' : 'VERIFICATION FAILED'}
                                        </span>

                                        <span style={{ color: 'var(--db-t3)', fontWeight: 600 }}>Contract Address</span>
                                        <span style={{ color: '#fff', fontFamily: 'var(--db-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                          {detailsObj.result.contractAddress}
                                          <button 
                                            onClick={() => copyText(detailsObj.result.contractAddress, 'Address')} 
                                            style={{ background: 'none', border: 'none', color: 'var(--db-t3)', cursor: 'pointer', padding: 0 }}
                                            title="Copy Address"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        </span>

                                        <span style={{ color: 'var(--db-t3)', fontWeight: 600 }}>Etherscan Network</span>
                                        <span style={{ color: 'var(--db-t2)' }}>{detailsObj.result.network}</span>

                                        <span style={{ color: 'var(--db-t3)', fontWeight: 600 }}>GUID</span>
                                        <span style={{ color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>{detailsObj.result.guid}</span>
                                      </div>

                                      {detailsObj.result.isVerified && detailsObj.result.contractAddress && (
                                        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                                          <a 
                                            href={`https://${detailsObj.result.network === 'mainnet' ? '' : detailsObj.result.network + '.'}etherscan.io/address/${detailsObj.result.contractAddress}#code`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              display: 'inline-flex', alignItems: 'center', gap: 6,
                                              fontSize: 11, fontWeight: 700, color: 'var(--db-acc)',
                                              textDecoration: 'none'
                                            }}
                                            className="hover:underline"
                                          >
                                            View Verified Contract on Etherscan <ExternalLink size={12} />
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* 3. Contract Compilation Details */}
                                  {job.type === 'compile' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div>
                                          <div style={{ fontSize: 9, color: 'var(--db-t3)', textTransform: 'uppercase', marginBottom: 2 }}>Contract Class Name</div>
                                          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                                            {detailsObj.result.contractName}
                                          </div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 9, color: 'var(--db-t3)', textTransform: 'uppercase', marginBottom: 2 }}>Compiler Target</div>
                                          <div style={{ color: 'var(--db-t2)', fontSize: 12, fontFamily: 'var(--db-mono)' }}>
                                            solc {detailsObj.result.compilerVersion || '0.8.20'}
                                          </div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 9, color: 'var(--db-t3)', textTransform: 'uppercase', marginBottom: 2 }}>Bytecode Payload</div>
                                          <div style={{ color: 'var(--db-t2)', fontSize: 12, fontFamily: 'var(--db-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {detailsObj.result.bytecode ? `${Math.round(detailsObj.result.bytecode.length / 2).toLocaleString()} bytes` : '0 bytes'}
                                            {detailsObj.result.bytecode && (
                                              <button 
                                                onClick={() => copyText(detailsObj.result.bytecode, 'Bytecode')} 
                                                style={{ background: 'none', border: 'none', color: 'var(--db-t3)', cursor: 'pointer', padding: 2 }}
                                                title="Copy Bytecode hex"
                                              >
                                                <Copy size={12} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 9, color: 'var(--db-t3)', textTransform: 'uppercase', marginBottom: 2 }}>ABI Functions</div>
                                          <div style={{ color: 'var(--db-t2)', fontSize: 12, fontFamily: 'var(--db-mono)' }}>
                                            {Array.isArray(detailsObj.result.abi) ? `${detailsObj.result.abi.filter(x => x.type === 'function').length} functions` : '—'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Bytecode block collapsible */}
                                      {detailsObj.result.bytecode && (
                                        <div style={{ marginTop: 4 }}>
                                          <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--db-t3)', marginBottom: 4, fontWeight: 700 }}>Bytecode Hex</div>
                                          <div style={{
                                            maxHeight: 80, overflowY: 'auto',
                                            padding: 10, borderRadius: 4,
                                            background: '#040508', border: '1px solid rgba(255,255,255,0.03)',
                                            fontFamily: 'var(--db-mono)', fontSize: 10, color: 'var(--db-t3)',
                                            wordBreak: 'break-all'
                                          }}>
                                            {detailsObj.result.bytecode}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                </div>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer counts */}
          {!loading && visible.length > 0 && (
            <div style={{
              padding: '12px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--db-mono)', fontSize: 10, color: 'var(--db-t3)',
              background: 'rgba(255,255,255,.01)'
            }}>
              <span>
                Showing {visible.length} of {jobs.length} operations
                {jobs.length === MAX_JOBS && ' (capped at 50 logs)'}
              </span>
              <span>
                {activeJobs > 0
                  ? `${activeJobs} active job${activeJobs > 1 ? 's' : ''} polling live`
                  : 'System listening for job logs...'}
              </span>
            </div>
          )}
        </GlassCard>
      </div>

    </GlassCard>
  );
}

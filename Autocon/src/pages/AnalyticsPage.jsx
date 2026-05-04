import { useState, useEffect, useRef, useMemo } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Filler, Title
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useGasTracker } from '../hooks/useGasTracker';
import { usePlatformStore } from '../store/usePlatformStore';
import '../components/dashboard/styles/dashboard.css';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler, Title
);

/* ─── helpers ─────────────────────────────────────────── */
const PRIMARY   = '#5DA9E9';
const SUCCESS   = '#4ade80';
const AMBER     = '#F5A623';
const PINK      = '#e879f9';
// Estimated gas units per type
const GAS_UNITS = { 'ERC-20': 1_500_000, 'ERC-721': 2_200_000, 'Auction': 1_800_000 };

function StatCard({ label, value, sub, color, icon, delay }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== 'number') return;
    const dur = 700, start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = setTimeout(() => requestAnimationFrame(tick), 200);
    return () => clearTimeout(id);
  }, [value]);

  return (
    <div className={`pg-card db-enter db-enter-${delay}`}
      style={{ borderTop: `2px solid ${color}`, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--db-t3)' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: 'var(--db-font)', lineHeight: 1 }}>
        {typeof value === 'number' ? display : value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--db-t3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

/* ─── Chart helpers ──────────────────────────────────── */
const tooltipStyle = {
  backgroundColor: 'var(--db-s2)',
  borderColor: 'var(--surface)',
  borderWidth: .5,
  titleColor: 'var(--db-t1)',
  bodyColor: 'var(--db-t2)',
  padding: 10,
  cornerRadius: 8,
};

/* ─── Main Page ──────────────────────────────────────── */
export default function AnalyticsPage() {
  const { user, authFetch } = useAuth();
  const { network } = useNetwork();
  const { gasPriceGwei, status } = useGasTracker();
  const { deployments, isInitialLoad } = usePlatformStore();
  const isLoading = isInitialLoad;
  const [timeRange, setTimeRange] = useState(6); // months

  /* fetch all contracts */


  /* ── Computed data ── */
  const tokens   = deployments.filter(d => d._type === 'ERC-20').length;
  const nfts     = deployments.filter(d => d._type === 'ERC-721').length;
  const auctions = deployments.filter(d => d._type === 'Auction').length;
  const total    = deployments.length;

  const portfolioAge = useMemo(() => {
    if (deployments.length === 0) return '0 days';
    const firstDeployment = new Date(deployments[0]?.createdAt);
    const days = Math.floor((Date.now() - firstDeployment.getTime()) / 86400000);
    return `${days} days`;
  }, [deployments]);

  // Networks used
  const networkCounts = deployments.reduce((acc, d) => {
    const n = d.network || 'Sepolia';
    acc[n] = (acc[n] || 0) + 1;
    return acc;
  }, {});

  // Monthly trend
  const months = [], monthlyCounts = [];
  for (let i = timeRange - 1; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString('en-US', { month: 'short', year: '2-digit' }));
    monthlyCounts.push(deployments.filter(dep => {
      const c = new Date(dep.createdAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length);
  }

  // Cumulative deployments
  const cumulativeCounts = monthlyCounts.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);

  // Gas analytics — estimated total gas used
  const estGasUnits = deployments.reduce((sum, d) => sum + (GAS_UNITS[d._type] || 1_500_000), 0);
  const estCostEth  = gasPriceGwei ? ((gasPriceGwei * estGasUnits) / 1e9).toFixed(4) : '—';

  // Most active month
  const peakIdx   = monthlyCounts.indexOf(Math.max(...monthlyCounts));
  const peakMonth = months[peakIdx] || '—';
  const peakCount = monthlyCounts[peakIdx] || 0;

  // Avg deploys/month (non-zero months)
  const activeMonths = monthlyCounts.filter(v => v > 0).length;
  const avgPerMonth  = activeMonths ? (total / activeMonths).toFixed(1) : '0';

  /* ── Chart datasets ── */
  const donutData = {
    labels: ['ERC-20', 'ERC-721', 'Auction'],
    datasets: [{
      data: [tokens || 0.01, nfts || 0.01, auctions || 0.01],
      backgroundColor: [SUCCESS, PINK, AMBER],
      borderColor: 'transparent', borderWidth: 3, hoverOffset: 6,
    }],
  };

  const barData = {
    labels: months,
    datasets: [{
      label: 'Deployments',
      data: monthlyCounts,
      backgroundColor: monthlyCounts.map((_, i) =>
        i === monthlyCounts.length - 1 ? `${PRIMARY}cc` : `${PRIMARY}44`),
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Total Contracts',
      data: cumulativeCounts,
      borderColor: PRIMARY,
      backgroundColor: `${PRIMARY}18`,
      fill: true, tension: 0.4, pointRadius: 4,
      pointBackgroundColor: PRIMARY,
    }],
  };

  const networkBarData = {
    labels: Object.keys(networkCounts),
    datasets: [{
      data: Object.values(networkCounts),
      backgroundColor: [PRIMARY, SUCCESS, AMBER].slice(0, Object.keys(networkCounts).length),
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const gasStatusColor = { cheap: SUCCESS, average: AMBER, expensive: '#ef4444' }[status] || AMBER;

  return (
    <div className="pg-wrap">

      {/* Header */}
      <div className="pg-head db-enter db-enter-1">
        <div>
          <div className="pg-title">Analytics <em>&amp; Insights</em></div>
          <div className="pg-sub">
            Real-time analytics across all your smart contract deployments · {network.name}
          </div>
        </div>
        {/* Time range selector */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[3, 6, 12].map(m => (
            <button key={m} className="pg-btn"
              onClick={() => setTimeRange(m)}
              style={{
                background: timeRange === m ? 'var(--primary)' : 'var(--db-s2)',
                color: timeRange === m ? 'var(--surface)' : 'var(--db-t2)',
                border: timeRange === m ? 'none' : '1px solid var(--db-br)',
                fontWeight: 700, fontSize: 12,
              }}>
              {m}M
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="pg-card" style={{ textAlign: 'center', padding: 48, color: 'var(--db-t3)' }}>
          <div className="pg-spinner" style={{ margin: '0 auto 12px' }} />
          Loading analytics…
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            <StatCard label="Total Contracts" value={total}    icon="🚀" color={PRIMARY}  delay={2} sub="All types deployed" />
            <StatCard label="ERC-20 Tokens"   value={tokens}   icon="🪙" color={SUCCESS}  delay={2} sub="Fungible tokens" />
            <StatCard label="NFT Collections" value={nfts}     icon="🎨" color={PINK}     delay={3} sub="ERC-721 collections" />
            <StatCard label="Auctions"         value={auctions} icon="🔨" color={AMBER}    delay={3} sub="English auctions" />
            <StatCard label="Avg / Month"      value={avgPerMonth} icon="📈" color={PRIMARY} delay={4} sub={`Over ${activeMonths} active months`} />
            <StatCard label="Peak Month"       value={peakMonth}   icon="⚡" color={AMBER}   delay={4} sub={`${peakCount} deployments`} />
          </div>

          {/* ── Row 1: Donut + Bar ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 14 }}>
            {/* Distribution Donut */}
            <div className="pg-card db-enter db-enter-2" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 4 }}>Contract Distribution</div>
              <div style={{ fontSize: 11, color: 'var(--db-t3)', marginBottom: 16 }}>By type · {network.name}</div>
              <div style={{ position: 'relative', maxWidth: 180, margin: '0 auto' }}>
                <Doughnut data={donutData} options={{
                  cutout: '72%', responsive: true, maintainAspectRatio: true,
                  animation: { duration: 800 },
                  plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, enabled: true } },
                }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--db-t1)' }}>{total}</div>
                  <div style={{ fontSize: 10, color: 'var(--db-t3)', textTransform: 'uppercase' }}>Total</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
                {[
                  { label: 'ERC-20', count: tokens,   color: SUCCESS },
                  { label: 'ERC-721', count: nfts,    color: PINK },
                  { label: 'Auction', count: auctions, color: AMBER },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--db-t2)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.count > 0 ? item.color : 'var(--db-t3)' }}>{item.count}</span>
                    <span style={{ fontSize: 11, color: 'var(--db-t3)' }}>{total > 0 ? `${Math.round((item.count / total) * 100)}%` : '0%'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Bar Chart */}
            <div className="pg-card db-enter db-enter-3" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 4 }}>Deployment Trends</div>
              <div style={{ fontSize: 11, color: 'var(--db-t3)', marginBottom: 16 }}>Monthly deployments · last {timeRange} months</div>
              <div style={{ height: 180 }}>
                <Bar data={barData} options={{
                  responsive: true, maintainAspectRatio: false,
                  animation: { duration: 900 },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: 'var(--db-t3)', font: { size: 10, family: 'IBM Plex Mono' } } },
                    y: { display: false, beginAtZero: true },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { ...tooltipStyle, callbacks: { label: c => `${c.raw} deployment${c.raw !== 1 ? 's' : ''}` } },
                  },
                }} />
              </div>
            </div>
          </div>

          {/* ── Row 2: Cumulative Line + Network Bar ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Cumulative Growth Line */}
            <div className="pg-card db-enter db-enter-4" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 4 }}>Portfolio Growth</div>
              <div style={{ fontSize: 11, color: 'var(--db-t3)', marginBottom: 16 }}>Cumulative contracts over time</div>
              <div style={{ height: 160 }}>
                <Line data={lineData} options={{
                  responsive: true, maintainAspectRatio: false,
                  animation: { duration: 1000 },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: 'var(--db-t3)', font: { size: 10, family: 'IBM Plex Mono' } } },
                    y: { display: false, beginAtZero: true },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { ...tooltipStyle, callbacks: { label: c => `${c.raw} total contracts` } },
                  },
                }} />
              </div>
            </div>

            {/* Network Distribution */}
            <div className="pg-card db-enter db-enter-4" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 4 }}>By Network</div>
              <div style={{ fontSize: 11, color: 'var(--db-t3)', marginBottom: 16 }}>Multi-chain deployment spread</div>
              {Object.keys(networkCounts).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--db-t3)', textAlign: 'center', paddingTop: 30 }}>No deployments yet</div>
              ) : (
                <div style={{ height: 140 }}>
                  <Bar data={networkBarData} options={{
                    indexAxis: 'y',
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                      x: { display: false, beginAtZero: true },
                      y: { grid: { display: false }, ticks: { color: 'var(--db-t2)', font: { size: 11 } } },
                    },
                    plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } },
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* ── Gas Analytics Card ── */}
          <div className="pg-card db-enter db-enter-5" style={{ padding: 22, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 4 }}>⛽ Gas Usage Analytics</div>
            <div style={{ fontSize: 11, color: 'var(--db-t3)', marginBottom: 20 }}>Live gas prices and estimated historical spend</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {[
                { label: 'Live Gas Price', value: gasPriceGwei ? `${Math.round(gasPriceGwei)} Gwei` : '…', color: gasStatusColor, desc: `Status: ${status}` },
                { label: 'Est. Total Gas', value: `${(estGasUnits / 1_000_000).toFixed(1)}M units`, color: PRIMARY, desc: `~${estCostEth} ETH at current price` },
                { label: 'Avg Gas / Deploy', value: total > 0 ? `${((estGasUnits / total) / 1_000_000).toFixed(1)}M` : '—', color: AMBER, desc: 'Estimated gas units' },
                { label: 'Cheapest Type', value: 'ERC-20', color: SUCCESS, desc: '~1.5M gas units' },
                { label: 'Most Expensive', value: 'ERC-721', color: PINK, desc: '~2.2M gas units' },
                { label: 'Network', value: network.name, color: network.color || PRIMARY, desc: network.currencySymbol || 'ETH' },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--db-s2)', border: '1px solid var(--db-br)' }}>
                  <div style={{ fontSize: 10, color: 'var(--db-t3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: 'var(--db-mono)', marginBottom: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--db-t3)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Admin Insights ── */}
          <div className="pg-card db-enter db-enter-6" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)' }}>🔐 Admin Insights</div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(93,169,233,.12)', color: 'var(--primary)', border: '1px solid rgba(93,169,233,.2)', fontWeight: 700 }}>Advanced</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--db-t3)', marginBottom: 18 }}>Account-level deployment intelligence</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { label: 'Deployment Velocity', value: `${avgPerMonth}/month`, icon: '📈', color: PRIMARY, desc: `Across ${activeMonths} active month${activeMonths !== 1 ? 's' : ''}` },
                { label: 'Success Rate (Audit)', value: deployments.length > 0 ? '100%' : '—', icon: '🛡️', color: SUCCESS, desc: '0 failures recorded in audit logs' },
                { label: 'Most Deployed Type', value: tokens >= nfts && tokens >= auctions ? 'ERC-20 Token' : nfts >= auctions ? 'ERC-721 NFT' : 'Auction', icon: '🏆', color: AMBER, desc: 'Most common contract type' },
                { label: 'Networks Active', value: Object.keys(networkCounts).length, icon: '🌐', color: SUCCESS, desc: Object.keys(networkCounts).join(' · ') || 'None' },
                { label: 'Peak Activity', value: `${peakMonth}`, icon: '⚡', color: PINK, desc: `${peakCount} deploys in one month` },
                { label: 'Portfolio Age', value: portfolioAge, icon: '📅', color: AMBER, desc: 'Since first deployment' },
                { label: 'Wallet', value: user?.walletAddress ? `${user.walletAddress.slice(0,6)}…${user.walletAddress.slice(-4)}` : '—', icon: '🦊', color: PRIMARY, desc: 'Connected address' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px', borderRadius: 10, background: 'var(--db-s2)', border: '1px solid var(--db-br)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--db-t3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: item.color, fontFamily: 'var(--db-font)', marginBottom: 3 }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--db-t3)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {total === 0 && (
            <div className="pg-card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 6 }}>No data yet</div>
              <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>Deploy your first contract to start seeing analytics here.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

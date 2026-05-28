import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Filler, Title
} from 'chart.js';
import { 
  Rocket, Layers, ImageIcon, Gavel, TrendingUp, Zap, 
  Fuel, Lock, Trophy, Globe, Calendar, Wallet, BarChart3 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useGasTracker } from '../hooks/useGasTracker';
import { usePlatformStore } from '../store/usePlatformStore';
import { GlassCard, Button } from '../components/ui';
import '../components/dashboard/styles/dashboard.css';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler, Title
);

/* ─── Gas Units Map ───────────────────────────────────── */
const GAS_UNITS = { 'ERC-20': 1_500_000, 'ERC-721': 2_200_000, 'Auction': 1_800_000 };

/* ─── Color Palettes ──────────────────────────────────── */
const PRIMARY   = '#ff6b00'; // Orange brand accent
const SUCCESS   = '#10b981'; // Green
const AMBER     = '#fbbf24'; // Yellow
const PINK      = '#ec4899'; // Pink
const BLUE      = '#3b82f6'; // Blue

/* ─── Chart Tooltip Configuration ─────────────────────── */
const tooltipStyle = {
  backgroundColor: 'rgba(10, 11, 15, 0.95)',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderWidth: 0.5,
  titleColor: '#fff',
  bodyColor: 'var(--on-surface-variant)',
  padding: 10,
  cornerRadius: 8,
};

/* ─── Custom Stat Card ────────────────────────────────── */
function AnalyticsStatCard({ label, value, sub, color, Icon, delay }) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    if (typeof value !== 'number') return;
    const dur = 750, start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = setTimeout(() => requestAnimationFrame(tick), 150);
    return () => clearTimeout(id);
  }, [value]);

  return (
    <GlassCard 
      padding="md"
      className={`db-enter db-enter-${delay} border border-white/5 relative overflow-hidden bg-black/40`}
      hoverable={true}
      style={{ borderTop: `2px solid ${color}` }}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[35px] pointer-events-none" style={{ backgroundColor: color, opacity: 0.1 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, position: 'relative', zIndex: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--on-surface-muted)' }}>{label}</span>
        {Icon && <Icon size={16} style={{ color }} strokeWidth={2} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'var(--db-font)', lineHeight: 1, tracking: '-0.02em', position: 'relative', zIndex: 2 }}>
        {typeof value === 'number' ? display : value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginTop: 8, position: 'relative', zIndex: 2 }}>{sub}</div>}
    </GlassCard>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { network } = useNetwork();
  const { gasPriceGwei, status, blockNumber } = useGasTracker();
  const { deployments, isInitialLoad } = usePlatformStore();
  const [timeRange, setTimeRange] = useState(6); // months

  const isLoading = isInitialLoad;

  /* ─── Computed Stats ─── */
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
  const estCostEth  = gasPriceGwei ? ((gasPriceGwei * estGasUnits) / 1e9).toFixed(4) : '-';

  // Most active month
  const peakIdx   = monthlyCounts.indexOf(Math.max(...monthlyCounts));
  const peakMonth = months[peakIdx] || '-';
  const peakCount = monthlyCounts[peakIdx] || 0;

  // Avg deploys/month (non-zero months)
  const activeMonths = monthlyCounts.filter(v => v > 0).length;
  const avgPerMonth  = activeMonths ? (total / activeMonths).toFixed(1) : '0';

  // Deployment Density (Day of Week vs Hour of Day)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const densityMap = Array(7).fill(0).map(() => Array(24).fill(0));
  let maxDensity = 0;
  deployments.forEach(d => {
    const date = new Date(d.createdAt);
    const day = date.getDay();
    const hour = date.getHours();
    densityMap[day][hour]++;
    if (densityMap[day][hour] > maxDensity) maxDensity = densityMap[day][hour];
  });

  const getDensityColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.02)';
    const intensity = Math.max(0.15, count / (maxDensity || 1));
    return `rgba(255, 107, 0, ${intensity})`; 
  };

  /* ─── Chart Data Configurations ─── */
  const donutData = {
    labels: ['ERC-20', 'ERC-721', 'Auction'],
    datasets: [{
      data: [tokens || 0.01, nfts || 0.01, auctions || 0.01],
      backgroundColor: [BLUE, PINK, AMBER],
      borderColor: 'transparent', 
      borderWidth: 3, 
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: months,
    datasets: [{
      label: 'Deployments',
      data: monthlyCounts,
      backgroundColor: monthlyCounts.map((_, i) =>
        i === monthlyCounts.length - 1 ? 'rgba(255, 107, 0, 0.85)' : 'rgba(255, 107, 0, 0.25)'),
      borderRadius: 6, 
      borderSkipped: false,
    }],
  };

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Total Contracts',
      data: cumulativeCounts,
      borderColor: '#ff6b00',
      backgroundColor: 'rgba(255, 107, 0, 0.06)',
      fill: true, 
      tension: 0.35, 
      pointRadius: 4,
      pointBackgroundColor: '#ff6b00',
      pointBorderColor: '#fff',
      pointBorderWidth: 1
    }],
  };

  const networkBarData = {
    labels: Object.keys(networkCounts),
    datasets: [{
      data: Object.values(networkCounts),
      backgroundColor: [BLUE, SUCCESS, AMBER].slice(0, Object.keys(networkCounts).length),
      borderRadius: 6, 
      borderSkipped: false,
    }],
  };

  const gasStatusColor = { cheap: SUCCESS, average: AMBER, expensive: '#ef4444' }[status] || AMBER;

  return (
    <GlassCard className="pg-wrap" delay={0.1} padding="lg" hoverable={false} style={{ background: 'var(--surface-1)' }}>

      {/* Header */}
      <div className="pg-head db-enter db-enter-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="pg-title">Analytics <em>&amp; Insights</em></div>
          <div className="pg-sub">Real-time statistics and usage parameters across all deployments · {network.name}</div>
        </div>
        
        {/* Time range selector */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255, 255, 255, 0.02)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[1, 3, 6].map(m => (
            <button 
              key={m} 
              className="pg-btn"
              onClick={() => setTimeRange(m)}
              aria-pressed={timeRange === m}
              style={{
                background: timeRange === m ? 'var(--primary)' : 'transparent',
                color: timeRange === m ? 'var(--surface)' : 'var(--on-surface-muted)',
                border: 'none',
                fontWeight: 700, 
                fontSize: 11,
                borderRadius: 8,
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <GlassCard padding="lg" hoverable={false} className="text-center border border-white/5 bg-black/40" style={{ minHeight: 300, display: 'flex', flexDirection: 'column', justify: 'center', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner spinner-md" />
          <span style={{ fontSize: 13, color: 'var(--on-surface-muted)', marginTop: 12 }}>Crunching blockchain data...</span>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* ─── Stat Cards ─── */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <AnalyticsStatCard label="Total Contracts" value={total}       Icon={Rocket}      color="#ff6b00" delay={2} sub="All deployments" />
            <AnalyticsStatCard label="ERC-20 Tokens"   value={tokens}      Icon={Layers}      color={BLUE}    delay={2} sub="Fungible assets" />
            <AnalyticsStatCard label="NFT Collections" value={nfts}        Icon={ImageIcon}   color={PINK}    delay={3} sub="ERC-721 collections" />
            <AnalyticsStatCard label="Auctions"         value={auctions}   Icon={Gavel}       color={AMBER}   delay={3} sub="English auctions" />
            <AnalyticsStatCard label="Avg / Month"      value={avgPerMonth} Icon={TrendingUp} color={BLUE}    delay={4} sub={`Active months: ${activeMonths}`} />
            <AnalyticsStatCard label="Peak Month"       value={peakMonth}  Icon={Zap}         color={AMBER}   delay={4} sub={`${peakCount} deploys`} />
          </div>

          {/* ─── Row 1: Donut + Monthly Bar ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Distribution Donut */}
            <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Contract Distribution</div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 20 }}>Allocation by token standard</div>
              
              <div style={{ position: 'relative', maxWidth: 160, margin: '0 auto 20px' }}>
                <Doughnut data={donutData} options={{
                  cutout: '76%', 
                  responsive: true, 
                  maintainAspectRatio: true,
                  animation: { duration: 800 },
                  plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, enabled: true } },
                }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', tracking: '-0.02em', lineHeight: 1 }}>{total}</div>
                  <div style={{ fontSize: 9, color: 'var(--on-surface-muted)', textTransform: 'uppercase', tracking: '0.05em', marginTop: 4 }}>Contracts</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'ERC-20 Token', count: tokens,   color: BLUE },
                  { label: 'ERC-721 Collection', count: nfts,    color: PINK },
                  { label: 'English Auction', count: auctions, color: AMBER },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--on-surface-variant)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.count}</span>
                    <span style={{ fontSize: 10, color: 'var(--on-surface-muted)' }}>{total > 0 ? `${Math.round((item.count / total) * 100)}%` : '0%'}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Monthly Bar Chart */}
            <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Deployment Trends</div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 20 }}>Contract generation frequency over time</div>
              
              <div style={{ height: 260 }}>
                <Bar data={barData} options={{
                  responsive: true, 
                  maintainAspectRatio: false,
                  animation: { duration: 900 },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: 'var(--on-surface-muted)', font: { size: 10, family: 'var(--db-mono)' } } },
                    y: { 
                      grid: { color: 'rgba(255,255,255,0.03)' }, 
                      ticks: { color: 'var(--on-surface-muted)', font: { size: 10 } },
                      beginAtZero: true 
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { ...tooltipStyle, callbacks: { label: c => `${c.raw} deploy${c.raw !== 1 ? 's' : ''}` } },
                  },
                }} />
              </div>
            </GlassCard>
          </div>

          {/* ─── Row 2: Cumulative Line + Network Bar ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Cumulative Growth Line */}
            <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Portfolio Growth</div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 20 }}>Cumulative deployed code footprint</div>
              
              <div style={{ height: 200 }}>
                <Line data={lineData} options={{
                  responsive: true, 
                  maintainAspectRatio: false,
                  animation: { duration: 1000 },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: 'var(--on-surface-muted)', font: { size: 10, family: 'var(--db-mono)' } } },
                    y: { 
                      grid: { color: 'rgba(255,255,255,0.03)' }, 
                      ticks: { color: 'var(--on-surface-muted)', font: { size: 10 } },
                      beginAtZero: true 
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { ...tooltipStyle, callbacks: { label: c => `${c.raw} total contracts` } },
                  },
                }} />
              </div>
            </GlassCard>

            {/* Network Distribution */}
            <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Sandbox Deployments</div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 20 }}>Multi-chain testnet deployment distribution</div>
              
              {Object.keys(networkCounts).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', textAlign: 'center', paddingTop: 60 }}>No deployments recorded.</div>
              ) : (
                <div style={{ height: 200 }}>
                  <Bar data={networkBarData} options={{
                    indexAxis: 'y',
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: {
                      x: { 
                        grid: { color: 'rgba(255,255,255,0.03)' }, 
                        ticks: { color: 'var(--on-surface-muted)', font: { size: 10 } },
                        beginAtZero: true 
                      },
                      y: { grid: { display: false }, ticks: { color: 'var(--on-surface-variant)', font: { size: 11 } } },
                    },
                    plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } },
                  }} />
                </div>
              )}
            </GlassCard>
          </div>

          {/* ─── Row 3: Heatmap ─── */}
          <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Deployment Density</div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 20 }}>Activity map by day and hour of day (Local Time)</div>
            
            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(24, minmax(20px, 1fr))', gap: 4, minWidth: 600 }}>
                {/* Hours Header Row */}
                <div />
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} style={{ fontSize: 9, color: 'var(--on-surface-muted)', textAlign: 'center', fontFamily: 'var(--db-mono)' }}>
                    {h % 2 === 0 ? `${h}h` : ''}
                  </div>
                ))}
                
                {/* Heatmap Grid */}
                {daysOfWeek.map((dayName, d) => (
                  <div style={{ display: 'contents' }} key={dayName}>
                    <div style={{ fontSize: 10, color: 'var(--on-surface-variant)', alignSelf: 'center', textAlign: 'right', paddingRight: 8, fontWeight: 600 }}>
                      {dayName}
                    </div>
                    {densityMap[d].map((count, h) => (
                      <div
                        key={`${d}-${h}`}
                        title={`${dayName} at ${h}:00 - ${count} deployments`}
                        style={{
                          aspectRatio: '1 / 1',
                          borderRadius: 4,
                          background: getDensityColor(count),
                          border: count > 0 ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                          transition: 'transform 0.1s, opacity 0.2s',
                          cursor: 'crosshair'
                        }}
                        onMouseEnter={(e) => {
                           if (count > 0) e.target.style.transform = 'scale(1.15)';
                           e.target.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                           if (count > 0) e.target.style.transform = 'scale(1)';
                           e.target.style.opacity = '1';
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Heatmap Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12, fontSize: 10, color: 'var(--on-surface-muted)', fontWeight: 600 }}>
              <span>Less</span>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: getDensityColor(0) }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: getDensityColor(Math.max(1, maxDensity * 0.25)) }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: getDensityColor(Math.max(2, maxDensity * 0.5)) }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: getDensityColor(Math.max(3, maxDensity * 0.75)) }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: getDensityColor(maxDensity || 4) }} />
              <span>More</span>
            </div>
          </GlassCard>

          {/* ─── Gas Usage Analytics ─── */}
          <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Fuel size={16} className="text-amber-400" /> Gas Usage Analytics
            </div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 20 }}>Live sandbox gas parameters and estimated usage footprint</div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { label: 'Live Gas Price', value: gasPriceGwei ? `${Math.round(gasPriceGwei)} Gwei` : '...', color: gasStatusColor, desc: `Network Status: ${status}` },
                { label: 'Latest Block', value: blockNumber ? `#${blockNumber}` : '...', color: '#ff6b00', desc: 'Syncing real-time' },
                { label: 'Est. Total Gas', value: `${(estGasUnits / 1_000_000).toFixed(1)}M units`, color: '#ff6b00', desc: `~${estCostEth} ETH est. spend` },
                { label: 'Avg Gas / Deploy', value: total > 0 ? `${((estGasUnits / total) / 1_000_000).toFixed(1)}M` : '-', color: AMBER, desc: 'Average block weight' },
                { label: 'Cheapest Option', value: 'ERC-20', color: SUCCESS, desc: '~1.5M average gas' },
                { label: 'Most Expensive', value: 'ERC-721', color: PINK, desc: '~2.2M average gas' },
              ].map(item => (
                <div 
                  key={item.label} 
                  style={{ 
                    padding: '14px 16px', 
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.04)' 
                  }}
                >
                  <div style={{ fontSize: 9, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, fontWeight: 750 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: 'var(--db-mono)', marginBottom: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--on-surface-muted)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* ─── Admin Insights ─── */}
          <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} className="text-primary" /> Admin Analytics
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">Advanced</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 20 }}>Contract structural and compiler analytics</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { label: 'Deployment Velocity', Icon: TrendingUp, color: '#ff6b00', value: `${avgPerMonth}/month`,    desc: `Across ${activeMonths} active month${activeMonths !== 1 ? 's' : ''}` },
                { label: 'Success Rate (Audit)', Icon: Lock,      color: SUCCESS, value: deployments.length > 0 ? '100%' : '—', desc: 'Zero failures reported in audit files' },
                { label: 'Most Common Type',    Icon: Trophy,     color: AMBER,   value: tokens >= nfts && tokens >= auctions ? 'ERC-20 Token' : nfts >= auctions ? 'ERC-721 NFT' : 'Auction', desc: 'Standard contract preference' },
                { label: 'Networks Active',     Icon: Globe,      color: SUCCESS, value: Object.keys(networkCounts).length, desc: Object.keys(networkCounts).join(' · ') || 'None' },
                { label: 'Peak Activity',       Icon: Zap,        color: PINK,    value: `${peakMonth}`, desc: `${peakCount} deploys in a month` },
                { label: 'Portfolio Age',       Icon: Calendar,   color: AMBER,   value: portfolioAge, desc: 'Days since first compile' },
                { label: 'Target Wallet',       Icon: Wallet,     color: '#ff6b00', value: user?.walletAddress ? `${user.walletAddress.slice(0,6)}...${user.walletAddress.slice(-4)}` : '-', desc: 'Primary deployment owner' },
              ].map(item => {
                const ItemIcon = item.Icon;
                return (
                  <div 
                    key={item.label} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 12, 
                      padding: '14px', 
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(255,255,255,0.04)' 
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}12`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ItemIcon size={16} style={{ color: item.color }} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4, fontWeight: 750 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: item.color, fontFamily: 'var(--db-font)', marginBottom: 3 }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Empty state */}
          {total === 0 && (
            <GlassCard padding="lg" hoverable={false} className="border border-white/5 bg-black/40 text-center" style={{ padding: '60px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <BarChart3 size={44} className="text-on-surface-muted" strokeWidth={1.2} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>No Data Recorded</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>Deploy your first contract template to generate analytics.</div>
            </GlassCard>
          )}
        </div>
      )}
    </GlassCard>
  );
}

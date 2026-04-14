import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import './styles/dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AnalyticsCharts({ deployments = [] }) {
  if (deployments.length === 0) return null;

  const tokens   = deployments.filter(d => d._type === 'ERC-20').length;
  const nfts     = deployments.filter(d => d._type === 'ERC-721').length;
  const auctions = deployments.filter(d => d._type === 'Auction').length;

  // Monthly counts for last 6 months
  const months = [];
  const monthlyCounts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString('en-US', { month: 'short' }));
    monthlyCounts.push(
      deployments.filter(dep => {
        const c = new Date(dep.createdAt);
        return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
      }).length
    );
  }

  const doughnutData = {
    datasets: [{
      data: [tokens || 0.01, nfts || 0.01, auctions || 0.01],
      backgroundColor: ['#22c55e', '#60a5fa', '#f59e0b'],
      borderColor: 'transparent',
      borderWidth: 3,
      hoverOffset: 5,
    }],
  };

  const barData = {
    labels: months,
    datasets: [{
      data: monthlyCounts,
      backgroundColor: monthlyCounts.map((v, i) =>
        i === monthlyCounts.length - 1 ? 'rgba(34,197,94,.9)' : 'rgba(34,197,94,.35)'
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const tooltipDefaults = {
    backgroundColor: '#111f16',
    borderColor: 'rgba(34,197,94,.2)',
    borderWidth: .5,
    titleColor: '#e2ede6',
    bodyColor: '#7a9e85',
    padding: 10,
    cornerRadius: 7,
  };

  return (
    <div className="db-charts-row db-enter db-enter-5">
      {/* Donut — Asset Distribution */}
      <div className="db-chart-card">
        <div className="db-cc-title">Asset Distribution</div>
        <div className="db-cc-sub">By contract type · Sepolia</div>
        <div className="db-cc-body">
          <div className="db-donut-wrap">
            <div className="db-donut-canvas-wrap">
              <Doughnut
                data={doughnutData}
                options={{
                  cutout: '72%', responsive: true, maintainAspectRatio: true,
                  animation: { duration: 800, easing: 'easeOutQuart' },
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                  },
                }}
              />
              <div className="db-donut-center">
                <div className="db-dc-num">{deployments.length}</div>
                <div className="db-dc-lbl">Total</div>
              </div>
            </div>
            <div className="db-donut-legend">
              {[
                { label: 'Tokens',   count: tokens,   color: '#22c55e' },
                { label: 'NFTs',     count: nfts,     color: '#60a5fa' },
                { label: 'Auctions', count: auctions, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} className="db-dl-item">
                  <div className="db-dl-dot" style={{ background: item.color }} />
                  {item.label}
                  <span className="db-dl-val" style={{ color: item.count > 0 ? item.color : 'var(--db-t3)' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bar — Monthly Activity */}
      <div className="db-chart-card">
        <div className="db-cc-title">Monthly Activity</div>
        <div className="db-cc-sub">Deployments over last 6 months</div>
        <div className="db-cc-body">
          <Bar
            data={barData}
            options={{
              responsive: true, maintainAspectRatio: false,
              animation: { duration: 900, easing: 'easeOutQuart' },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: '#3d5f47', font: { size: 10, family: 'IBM Plex Mono' } },
                },
                y: { display: false, beginAtZero: true },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...tooltipDefaults,
                  callbacks: { label: c => `${c.raw} deployment${c.raw !== 1 ? 's' : ''}` },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

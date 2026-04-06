import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

/**
 * AnalyticsCharts — Visual deployment statistics.
 * Shows a doughnut chart of asset types and a bar chart of monthly deployments.
 */
export default function AnalyticsCharts({ deployments = [] }) {
  if (deployments.length === 0) return null;

  // Count by type
  const tokens = deployments.filter(d => d._type === 'ERC-20').length;
  const nfts = deployments.filter(d => d._type === 'ERC-721').length;
  const auctions = deployments.filter(d => d._type === 'Auction').length;

  // Count by network
  const networkCounts = {};
  deployments.forEach(d => {
    const net = d.network || 'Sepolia';
    networkCounts[net] = (networkCounts[net] || 0) + 1;
  });

  // Monthly deployments (last 6 months)
  const months = [];
  const monthlyCounts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString('en-US', { month: 'short' });
    months.push(label);
    const count = deployments.filter(dep => {
      const created = new Date(dep.createdAt);
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    }).length;
    monthlyCounts.push(count);
  }

  const doughnutData = {
    labels: ['Tokens (ERC-20)', 'NFTs (ERC-721)', 'Auctions'],
    datasets: [{
      data: [tokens, nfts, auctions],
      backgroundColor: ['#06b6d4', '#8b5cf6', '#f59e0b'],
      hoverBackgroundColor: ['#22d3ee', '#a78bfa', '#fbbf24'],
      borderWidth: 0,
      cutout: '72%',
      borderRadius: 6,
      spacing: 3
    }]
  };

  const barData = {
    labels: months,
    datasets: [{
      label: 'Deployments',
      data: monthlyCounts,
      backgroundColor: 'rgba(6, 182, 212, 0.6)',
      hoverBackgroundColor: 'rgba(6, 182, 212, 0.9)',
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 28
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'Inter', size: 12, weight: 600 },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 10,
        cornerRadius: 8,
        borderColor: 'rgba(6, 182, 212, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-muted)', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(100,116,139,0.1)' },
        ticks: {
          color: 'var(--text-muted)',
          font: { family: 'Inter', size: 11 },
          stepSize: 1,
          beginAtZero: true
        }
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
      {/* Doughnut — Asset Distribution */}
      <div className="card animate-fade-in-up delay-100" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
           Asset Distribution
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '140px', height: '140px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={{ ...chartOptions, scales: undefined, cutout: '72%' }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {deployments.length}
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {[
              { label: 'Tokens', count: tokens, color: '#06b6d4' },
              { label: 'NFTs', count: nfts, color: '#8b5cf6' },
              { label: 'Auctions', count: auctions, color: '#f59e0b' }
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: '8px',
                background: 'var(--bg-input)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.count}</span>
              </div>
            ))}

            {/* Network breakdown */}
            <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {Object.entries(networkCounts).map(([net, count]) => (
                <span key={net} style={{
                  padding: '2px 8px', borderRadius: '6px', fontSize: '0.6rem',
                  fontWeight: 600, background: 'var(--accent-glow)', color: 'var(--accent)'
                }}>{net}: {count}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bar — Monthly Activity */}
      <div className="card animate-fade-in-up delay-200" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          📈 Monthly Activity
        </h3>
        <div style={{ height: '180px' }}>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler, TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { RefreshCw } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler, TimeScale
);

const RANGES = [
  { label: '1D',  value: '1',  interval: '15m', limit: 96  },
  { label: '1W',  value: '7',  interval: '1h',  limit: 168 },
  { label: '1M',  value: '30', interval: '6h',  limit: 120 },
  { label: '3M',  value: '90', interval: '12h', limit: 180 },
  { label: '1Y',  value: '365',interval: '3d',  limit: 120 },
];

/**
 * PriceChart
 * Chart.js line chart for a single coin with time-range tabs.
 * Props:
 *   coin - { symbol, name, binanceId, iconColor }
 */
export default function PriceChart({ coin }) {
  const [range, setRange]         = useState(RANGES[0]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const chartRef                  = useRef(null);

  useEffect(() => {
    if (!coin?.binanceId) return;
    let cancelled = false;
    setLoading(true);
    setChartData([]);

    (async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${coin.binanceId}&interval=${range.interval}&limit=${range.limit}`
        );
        const raw = await res.json();
        if (cancelled) return;
        setChartData(raw.map((k) => ({ x: k[0], y: parseFloat(k[4]) })));
      } catch (_) {}
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [coin?.binanceId, range.value]);

  const color = coin?.iconColor ?? '#8FB900';

  const data = {
    datasets: [{
      label: `${coin?.symbol} Price`,
      data: chartData,
      borderColor: color,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, color + '55');
        gradient.addColorStop(1, color + '00');
        return gradient;
      },
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      fill: true,
      tension: 0.3,
    }],
  };

  const options = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'MMM d, HH:mm',
          displayFormats: { hour: 'HH:mm', day: 'MMM d', month: 'MMM' },
        },
        grid:  { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#64748b', maxTicksLimit: 6 },
      },
      y: {
        grid:  { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#64748b',
          callback: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toLocaleString()}`,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0C1007',
        titleColor: '#ffffff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: ctx.parsed.y < 1 ? 6 : 2 })}`,
        },
      },
    },
  };

  return (
    <div className="price-chart">
      {/* Range Tabs */}
      <div className="price-chart__tabs">
        {RANGES.map((r) => (
          <button
            key={r.value}
            className={`price-chart__tab${range.value === r.value ? ' price-chart__tab--active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ height: '280px', position: 'relative' }}>
        {loading && (
          <div className="price-chart__loader">
            <RefreshCw size={20} className="animate-spin-slow" style={{ color: coin?.iconColor ?? 'var(--primary)', opacity: 0.7 }} />
          </div>
        )}
        {!loading && chartData.length > 0 && (
          <Line ref={chartRef} data={data} options={options} />
        )}
        {!loading && chartData.length === 0 && (
          <div className="price-chart__loader" style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

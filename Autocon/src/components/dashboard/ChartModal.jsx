import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler, TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import './styles/dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, TimeScale);

const RANGES = [
  { label: '1D', value: '1',   interval: '15m', limit: 96  },
  { label: '1W', value: '7',   interval: '1h',  limit: 168 },
  { label: '1M', value: '30',  interval: '6h',  limit: 120 },
  { label: '3M', value: '90',  interval: '12h', limit: 180 },
  { label: '1Y', value: '365', interval: '3d',  limit: 120 },
];

export default function ChartModal({ coin, onClose }) {
  const [range, setRange]         = useState(RANGES[0]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const chartRef                  = useRef(null);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = coin ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [coin]);

  // Fetch klines when coin or range changes
  useEffect(() => {
    if (!coin?.binanceId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setChartData([]);
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${coin.binanceId}&interval=${range.interval}&limit=${range.limit}`
        );
        const raw = await res.json();
        if (!cancelled) setChartData(raw.map(k => ({ x: k[0], y: parseFloat(k[4]) })));
      } catch (_) {
        // Silent fail
      }
      if (!cancelled) setLoading(false);
    };

    fetchData();

    return () => { cancelled = true; };
  }, [coin?.binanceId, range.value]);

  const isUp    = (coin?.change ?? 0) >= 0;
  const color   = isUp ? '#22c55e' : '#ef4444';
  const coinBg  = coin ? `${coin.iconColor}2e` : 'rgba(34,197,94,.18)';

  const data = {
    datasets: [{
      label: `${coin?.symbol} Price`,
      data: chartData,
      borderColor: color,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 190);
        g.addColorStop(0, isUp ? 'rgba(34,197,94,.18)' : 'rgba(239,68,68,.18)');
        g.addColorStop(1, 'transparent');
        return g;
      },
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.4,
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
        time: { tooltipFormat: 'MMM d, HH:mm', displayFormats: { hour: 'HH:mm', day: 'MMM d' } },
        display: false,
      },
      y: {
        grid: { color: 'var(--surface)' },
        ticks: {
          color: '#3d5f47', font: { size: 10, family: 'IBM Plex Mono' }, maxTicksLimit: 4,
          callback: v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toLocaleString()}`,
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--surface)', borderColor: 'rgba(34,197,94,.2)', borderWidth: .5,
        titleColor: '#e2ede6', bodyColor: '#7a9e85', padding: 10,
        callbacks: {
          label: c => ` $${c.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: c.parsed.y < 1 ? 6 : 2 })}`,
        },
      },
    },
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`db-overlay${coin ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`db-modal${coin ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={coin ? `${coin.name} price chart` : 'Price chart'}
      >
        {coin && (
          <>
            {/* Header */}
            <div className="db-modal-top">
              <div className="db-m-ico" style={{ background: coinBg, color: coin.iconColor }}>
                {coin.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="db-m-name">{coin.name}</div>
                <div className="db-m-sym">{coin.symbol} · ERC-20 · Sepolia</div>
              </div>
              <button className="db-m-close" onClick={onClose} aria-label="Close chart">✕</button>
            </div>

            {/* Body */}
            <div className="db-modal-body">
              {/* Live price */}
              <div className="db-m-price">
                {coin.price != null
                  ? `$${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2, maximumFractionDigits: coin.price < 1 ? 6 : 2 })}`
                  : '—'
                }
              </div>
              <div className={`db-m-chg ${isUp ? 'up' : 'dn'}`}>
                {isUp ? '▲' : '▼'} {coin.change != null ? `${isUp ? '+' : ''}${coin.change.toFixed(2)}% (24h)` : '—'}
              </div>

              {/* Range tabs */}
              <div className="db-range-row">
                {RANGES.map(r => (
                  <button
                    key={r.value}
                    className={`db-rp${range.value === r.value ? ' on' : ''}`}
                    onClick={() => setRange(r)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="db-m-chart" style={{ position: 'relative' }}>
                {loading && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 22, height: 22, border: '2px solid rgba(34,197,94,.15)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'db-spin .8s linear infinite' }} />
                  </div>
                )}
                {!loading && chartData.length > 0 && (
                  <Line ref={chartRef} data={data} options={options} />
                )}
              </div>

              {/* Stats grid */}
              <div className="db-m-stats">
                {[
                  { label: '24h High',   val: coin.high  ?? '—' },
                  { label: '24h Low',    val: coin.low   ?? '—' },
                  { label: 'Market Cap', val: coin.mcap  ?? '—' },
                  { label: '24h Volume', val: coin.vol   ?? '—' },
                ].map(s => (
                  <div key={s.label} className="db-ms-card">
                    <div className="db-ms-lbl">{s.label}</div>
                    <div className="db-ms-val">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Inline spin keyframe */}
      <style>{`@keyframes db-spin{to{transform:rotate(360deg)}}@keyframes db-drawLine{to{stroke-dashoffset:0}}`}</style>
    </>
  );
}

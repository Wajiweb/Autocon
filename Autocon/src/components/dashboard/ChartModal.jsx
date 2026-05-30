import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import './styles/dashboard.css';

// Register only what we need — no CategoryScale (we use LinearScale for timestamps)
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Filler);

/* ─── Fallback random-walk data ─────────────────────────────────────────── */
function generateFallbackData(basePrice, points = 48) {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.48) * 0.008);
    data.push({ x: now - i * 3600000, y: parseFloat(price.toFixed(2)) });
  }
  return data;
}

/* ─── Range config ───────────────────────────────────────────────────────── */
const RANGES = [
  { label: 'Live', value: 'live', interval: '1h',  limit: 24  },   // 24h hourly context
  { label: '1H',   value: '1',   interval: '1m',  limit: 60  },
  { label: '1D',   value: '24',  interval: '5m',  limit: 288 },
  { label: '1W',   value: '7',   interval: '15m', limit: 672 },
  { label: '1M',   value: '30',  interval: '1h',  limit: 720 },
  { label: '3M',   value: '90',  interval: '4h',  limit: 540 },
];

/* ─── Fetch helper ───────────────────────────────────────────────────────── */
async function fetchKlines(symbol, interval, limit) {
  const res = await fetch(
    `/api/binance/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  if (!res.ok) throw new Error(`Binance API ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Empty klines response');
  return raw.map(k => ({ x: Number(k[0]), y: parseFloat(k[4]) }));
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ChartModal({ coin, onClose }) {
  const [range, setRange]           = useState(RANGES[0]);
  const [chartData, setChartData]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [livePrice, setLivePrice]   = useState(null);
  const [priceFlash, setPriceFlash] = useState(null);
  const [wsStatus, setWsStatus]     = useState('connecting');

  const pollingRef   = useRef(null);
  const lastPriceRef = useRef(null);
  const prevPriceRef = useRef(null);

  /* ── Escape key / scroll lock ─────────────────────────────────────────── */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = coin ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [coin]);

  /* ── Historical ranges (non-live) ────────────────────────────────────── */
  useEffect(() => {
    if (!coin?.binanceId || range.value === 'live') return;
    let cancelled = false;
    setLoading(true);
    setChartData([]);

    fetchKlines(coin.binanceId, range.interval, range.limit)
      .then(pts => { if (!cancelled) { setChartData(pts); setLoading(false); } })
      .catch(err => {
        console.warn('Historical klines failed:', err.message);
        if (!cancelled && coin?.price) {
          setChartData(generateFallbackData(coin.price, range.limit));
        }
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [coin?.binanceId, range.value]);

  /* ── Live mode — 24 h context + REST polling every 2 s ──────────────── */
  useEffect(() => {
    if (!coin?.binanceId || range.value !== 'live') {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      setWsStatus('connecting');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setChartData([]);
    setWsStatus('connecting');
    lastPriceRef.current = null;
    prevPriceRef.current = null;

    // Step 1: Load 24 h of hourly klines so chart shows real price variation
    fetchKlines(coin.binanceId, '1h', 24)
      .then(pts => {
        if (cancelled) return;
        setChartData(pts);
        setLoading(false);
        const seed = pts[pts.length - 1].y;
        lastPriceRef.current = seed;
        prevPriceRef.current = seed;
      })
      .catch(err => {
        console.warn('Live init klines failed:', err.message);
        if (!cancelled && coin?.price) {
          const fb = generateFallbackData(coin.price, 24);
          setChartData(fb);
          lastPriceRef.current = coin.price;
          prevPriceRef.current = coin.price;
        }
        if (!cancelled) setLoading(false);
      });

    // Step 2: Poll price every 2 s and append new points
    setWsStatus('connected');
    pollingRef.current = setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/binance/api/v3/ticker/price?symbol=${coin.binanceId}`);
        if (!res.ok) return;
        const json    = await res.json();
        const newPrice = parseFloat(json.price);
        if (isNaN(newPrice)) return;

        const oldPrice = lastPriceRef.current;
        prevPriceRef.current = oldPrice;
        lastPriceRef.current = newPrice;

        setLivePrice(newPrice);

        if (oldPrice !== null && newPrice !== oldPrice) {
          setPriceFlash(newPrice > oldPrice ? 'up' : 'down');
          setTimeout(() => setPriceFlash(null), 900);
        }

        // Append new point — keep last 120 for performance
        setChartData(prev => [...prev, { x: Date.now(), y: newPrice }].slice(-120));
      } catch (e) {
        console.warn('Price poll error:', e.message);
      }
    }, 2000);

    return () => {
      cancelled = true;
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    };
  }, [coin?.binanceId, range.value]);

  /* ── Derived display values ──────────────────────────────────────────── */
  const isUp        = (coin?.change ?? 0) >= 0;
  const color       = isUp ? '#22c55e' : '#ef4444';
  const coinBg      = coin ? `${coin.iconColor}2e` : 'rgba(34,197,94,.18)';
  const displayPrice = livePrice ?? coin?.price;

  /* ── Chart.js data & options ─────────────────────────────────────────── */
  const chartJsData = {
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

  const chartOptions = {
    // IMPORTANT: disable animation in live mode so the chart doesn't
    // re-draw from scratch every 2 s — just append the new point smoothly
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        type: 'linear',      // ← KEY FIX: treat x as numeric (timestamps), not categories
        display: false,
        ticks: { display: false },
      },
      y: {
        type: 'linear',
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#3d5f47',
          font: { size: 10, family: 'IBM Plex Mono' },
          maxTicksLimit: 5,
          callback: v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toLocaleString()}`,
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--surface)',
        borderColor: 'rgba(34,197,94,.2)',
        borderWidth: 0.5,
        titleColor: '#e2ede6',
        bodyColor: '#7a9e85',
        padding: 10,
        callbacks: {
          title: () => '',
          label: c => ` $${c.parsed.y.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: c.parsed.y < 1 ? 6 : 2,
          })}`,
        },
      },
    },
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
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
              <div className="db-m-ico" style={{ background: coinBg, color: coin.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {coin.logo ? (
                  <img
                    src={coin.logo}
                    alt={coin.symbol}
                    style={{ width: '22px', height: '22px', objectFit: 'contain', display: 'block' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  style={{ display: coin.logo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--db-mono)', fontSize: '11px', fontWeight: 600 }}
                >
                  {coin.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="db-m-name">{coin.name}</div>
                <div className="db-m-sym">{coin.symbol} · ERC-20 · Sepolia</div>
              </div>
              <button className="db-m-close" onClick={onClose} aria-label="Close chart">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="db-modal-body">
              {/* Live price */}
              <div className="db-m-price-row">
                <div className={`db-m-price ${priceFlash === 'up' ? 'flash-up' : priceFlash === 'down' ? 'flash-down' : ''}`}>
                  {displayPrice != null
                    ? `$${displayPrice.toLocaleString(undefined, {
                        minimumFractionDigits: displayPrice < 1 ? 4 : 2,
                        maximumFractionDigits: displayPrice < 1 ? 6 : 2,
                      })}`
                    : '—'
                  }
                </div>
                {range.value === 'live' && (
                  <div className="db-live-badge">
                    <div className={`db-live-dot ${wsStatus === 'connected' ? '' : 'db-live-dot-disconnected'}`} />
                    {wsStatus === 'connected' ? 'LIVE' : 'CONNECTING'}
                  </div>
                )}
              </div>
              <div className={`db-m-chg ${isUp ? 'up' : 'dn'} flex items-center gap-1.5`}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {coin.change != null ? `${isUp ? '+' : ''}${coin.change.toFixed(2)}% (24h)` : '—'}
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
                {/* NOTE: NO key prop here — chart updates in-place, no remount every 2 s */}
                {!loading && chartData.length > 1 && (
                  <Line data={chartJsData} options={chartOptions} />
                )}
              </div>

              {/* Stats grid */}
              <div className="db-m-stats">
                {[
                  { label: '24h High',   val: coin.high ?? '—' },
                  { label: '24h Low',    val: coin.low  ?? '—' },
                  { label: 'Market Cap', val: coin.mcap ?? '—' },
                  { label: '24h Volume', val: coin.vol  ?? '—' },
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

      <style>{`@keyframes db-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

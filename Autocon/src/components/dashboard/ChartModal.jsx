import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { X, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import './styles/dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const RANGES = [
  { label: 'Live', value: 'live',  interval: '1s',   limit: 60   },
  { label: '1H',   value: '1',    interval: '1m',   limit: 60   },
  { label: '1D',   value: '24',   interval: '5m',   limit: 288  },
  { label: '1W',   value: '7',    interval: '15m',  limit: 672  },
  { label: '1M',   value: '30',   interval: '1h',   limit: 720  },
  { label: '3M',   value: '90',   interval: '4h',   limit: 540  },
];

export default function ChartModal({ coin, onClose }) {
  const [range, setRange]         = useState(RANGES[0]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [livePrice, setLivePrice] = useState(null);
  const [priceFlash, setPriceFlash] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected', 'polling'
  const chartRef                  = useRef(null);
  const wsRef                     = useRef(null);
  const lastPriceRef              = useRef(null);
  const pollingRef                = useRef(null);

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

  // Fetch historical klines when coin or range changes (non-live modes)
  useEffect(() => {
    if (!coin?.binanceId || range.value === 'live') return;
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

  // Force chart to update when data changes
  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      chartRef.current.update('default');
    }
  }, [chartData]);

  // WebSocket for live mode
  useEffect(() => {
    if (!coin?.binanceId || range.value !== 'live') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setWsStatus('connecting');
      return;
    }

    setLoading(true);
    setChartData([]);
    setWsStatus('connecting');

    // First fetch initial historical data for context
    const fetchInitial = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${coin.binanceId}&interval=1m&limit=30`
        );
        const raw = await res.json();
        const initialData = raw.map(k => ({ x: k[0], y: parseFloat(k[4]) }));
        setChartData(initialData);
        setLoading(false);
        if (initialData.length > 0) {
          lastPriceRef.current = initialData[initialData.length - 1].y;
        }
      } catch (_) {
        setLoading(false);
      }
    };

    fetchInitial();

    // Connect to Binance WebSocket for live trades
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${coin.binanceId.toLowerCase()}@trade`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ WebSocket connected for ${coin.binanceId}`);
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const trade = JSON.parse(event.data);
        const newPrice = parseFloat(trade.p);
        const now = Date.now();

        if (isNaN(newPrice)) return;

        // Update live price with flash effect
        setPrevPrice(lastPriceRef.current);
        lastPriceRef.current = newPrice;
        setLivePrice(newPrice);

        // Determine flash direction
        if (lastPriceRef.current !== null && prevPrice !== null) {
          if (newPrice > prevPrice) {
            setPriceFlash('up');
          } else if (newPrice < prevPrice) {
            setPriceFlash('down');
          }
          setTimeout(() => setPriceFlash(null), 900);
        }

        // Update chart data with new price point
        setChartData(prev => {
          const updated = [...prev, { x: now, y: newPrice }];
          // Keep only last 100 points for performance
          return updated.slice(-100);
        });
      } catch (_) {
        // Ignore malformed messages
      }
    };

    ws.onerror = (error) => {
      console.error(`❌ WebSocket error for ${coin.binanceId}:`, error);
      setWsStatus('disconnected');
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed for ${coin.binanceId}:`, event.code, event.reason);
      setWsStatus('disconnected');
      
      // Fallback to polling if WebSocket disconnects
      if (pollingRef.current === null) {
        console.warn('⚠️ Switching to polling mode...');
        setWsStatus('polling');
        pollingRef.current = setInterval(async () => {
          try {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin.binanceId}`);
            const data = await res.json();
            const newPrice = parseFloat(data.price);
            const now = Date.now();
            
            if (!isNaN(newPrice)) {
              const oldPrice = lastPriceRef.current;
              lastPriceRef.current = newPrice;
              setLivePrice(newPrice);
              setPrevPrice(oldPrice);
              
              if (oldPrice !== null) {
                if (newPrice > oldPrice) {
                  setPriceFlash('up');
                } else if (newPrice < oldPrice) {
                  setPriceFlash('down');
                }
                setTimeout(() => setPriceFlash(null), 900);
              }
              
              setChartData(prev => {
                const updated = [...prev, { x: now, y: newPrice }];
                return updated.slice(-100);
              });
            }
          } catch (err) {
            console.error('Polling failed:', err);
          }
        }, 3000);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [coin?.binanceId, range.value]);

  const isUp    = (coin?.change ?? 0) >= 0;
  const color   = isUp ? '#22c55e' : '#ef4444';
  const coinBg  = coin ? `${coin.iconColor}2e` : 'rgba(34,197,94,.18)';
  const displayPrice = livePrice ?? coin?.price;

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
    animation: range.value === 'live' ? { duration: 300, easing: 'easeOutQuart' } : false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        display: false,
        // Auto-scroll to latest data in live mode
        ...(range.value === 'live' && chartData.length > 50 ? {
          min: chartData[chartData.length - 50].x,
          max: chartData[chartData.length - 1].x,
        } : {}),
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
                    ? `$${displayPrice.toLocaleString(undefined, { minimumFractionDigits: displayPrice < 1 ? 4 : 2, maximumFractionDigits: displayPrice < 1 ? 6 : 2 })}`
                    : '—'
                  }
                </div>
                {range.value === 'live' && (
                  <div className="db-live-badge">
                    <div className={`db-live-dot ${wsStatus === 'connected' ? '' : wsStatus === 'polling' ? 'db-live-dot-polling' : 'db-live-dot-disconnected'}`} />
                    {wsStatus === 'connected' ? 'LIVE' : wsStatus === 'polling' ? 'POLLING' : 'CONNECTING'}
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
                {!loading && chartData.length > 0 && (
                  <Line key={chartData.length} ref={chartRef} data={data} options={options} />
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

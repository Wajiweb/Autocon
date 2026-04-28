import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, TimeScale, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { RefreshCw, Maximize2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler, zoomPlugin);

export default function LiveCryptoGraph() {
  const [coinId, setCoinId] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('live'); 
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const chartRef = useRef(null);

  const coins = [
    { id: 'BTCUSDT', symbol: 'BTC', color: '#f59e0b', name: 'Bitcoin' },
    { id: 'ETHUSDT', symbol: 'ETH', color: '#8b5cf6', name: 'Ethereum' },
    { id: 'SOLUSDT', symbol: 'SOL', color: '#2dd4bf', name: 'Solana' },
    { id: 'POLUSDT', symbol: 'POL', color: '#c084fc', name: 'Polygon' }
  ];

  const timeframes = [
    { label: 'Live', value: 'live', interval: '1m', limit: 30 },
    { label: 'Day', value: '1', interval: '15m', limit: 96 },
    { label: 'Week', value: '7', interval: '1h', limit: 168 },
    { label: 'Month', value: '30', interval: '6h', limit: 120 }
  ];

  const activeCoin = coins.find(c => c.id === coinId);
  const activeTimeframe = timeframes.find(t => t.value === timeframe);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Fetch historical graph using Binance Public API
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${coinId}&interval=${activeTimeframe.interval}&limit=${activeTimeframe.limit}`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        const formattedData = data.map(item => ({
          x: item[0], 
          y: parseFloat(item[4]) 
        }));
        
        setChartData(formattedData);

        if (formattedData.length > 0) {
          const latestPrice = formattedData[formattedData.length - 1].y;
          const firstPrice = formattedData[0].y;
          setCurrentPrice(latestPrice);
          setPriceChange(((latestPrice - firstPrice) / firstPrice) * 100);
        }
      } catch (err) {
        console.warn("Binance API network error", err);
      }
      setLoading(false);
    };

    fetchChartData();

    // Setting up Binance WebSocket for ultra-live sub-second streaming
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coinId.toLowerCase()}@trade`);
    
    let lastUpdate = 0;
    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        const livePrice = parseFloat(json.p);
        const loopNow = Date.now();
        if (loopNow - lastUpdate < 500) return;
        lastUpdate = loopNow;

        if (!isNaN(livePrice)) {
          setCurrentPrice(livePrice);
          setChartData(prev => {
            if (prev.length === 0) return prev;
            const now = Date.now();
            const last = prev[prev.length - 1];
            
            // Interval constraint to keep chart clean (Live: 2s, Day: 45s, Week: 5m, Month: 30m)
            const intervalMs = timeframe === 'live' ? 2000 : (timeframe === '1' ? 45000 : (timeframe === '7' ? 300000 : 1800000));
            
            if (now - last.x < intervalMs) {

                const withoutLast = prev.slice(0, -1);
                return [...withoutLast, { x: now, y: livePrice }];
            }
          
            const newArr = [...prev, { x: now, y: livePrice }];
            if (newArr.length > 500) newArr.shift(); 
            return newArr;
          });
        }
      } catch (_err) {}
    };

    return () => ws.close();
  }, [coinId, timeframe, activeTimeframe.interval, activeTimeframe.limit]);

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const minX = chartData.length > 0 ? chartData[0].x : undefined;
  const maxX = chartData.length > 0 ? chartData[chartData.length - 1].x + (timeframe === 'live' ? 10000 : (timeframe === '1' ? 1800000 : 86400000)) : undefined;

  const data = {
    datasets: [
      {
        label: `${activeCoin.symbol} Price`,
        data: chartData,
        borderColor: activeCoin.color,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, `${activeCoin.color}80`); 
          gradient.addColorStop(1, `${activeCoin.color}00`); 
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.1,
      }
    ]
  };

  const options = {
    animation: {
      duration: 0 
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'PPp', 
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd'
          }
        },
        grid: {
          color: 'var(--surface)'
        },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: {
          color: 'var(--surface)'
        },
        ticks: { 
          color: '#94a3b8',
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'var(--surface)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `Price: $${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
        }
      },
      zoom: {
        limits: {
          x: { min: minX, max: maxX, minRange: 300000 }
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        }
      }
    }
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-input)', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginTop: '24px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 Live Market Chart
            {loading && <RefreshCw size={14} className="animate-spin text-cyan-400" />}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--surface)' }}>
              {currentPrice !== null ? `$${currentPrice.toLocaleString(undefined, { maximumFractionDigits: (currentPrice < 1 ? 4 : 2) })}` : '...'}
            </span>
            {priceChange !== null && (
              <span style={{
                fontSize: '0.75rem', fontWeight: 700,
                padding: '2px 8px', borderRadius: '6px',
                background: priceChange >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: priceChange >= 0 ? '#10b981' : '#ef4444'
              }}>
                {priceChange >= 0 ? '▲ ' : '▼ '}{Math.abs(priceChange).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Timescale Selector */}
          <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '10px', border: '1px solid var(--surface)' }}>
            {timeframes.map(tf => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                style={{
                  fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                  background: timeframe === tf.value ? 'rgba(6,182,212,0.15)' : 'transparent',
                  color: timeframe === tf.value ? '#06b6d4' : '#94a3b8',
                  border: 'none'
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Coin Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {coins.map(coin => (
              <button
                key={coin.id}
                onClick={() => setCoinId(coin.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '10px',
                  border: `1px solid ${coinId === coin.id ? coin.color + '80' : 'var(--surface)'}`,
                  background: coinId === coin.id ? coin.color + '20' : 'var(--surface)',
                  color: coinId === coin.id ? 'var(--surface)' : '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: coin.color }} />
                {coin.symbol}
              </button>
            ))}
          </div>

          <button onClick={handleResetZoom} style={{
             padding: '6px', background: 'var(--surface)', border: '1px solid var(--surface)',
             borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center'
          }} title="Reset Zoom">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: '320px', position: 'relative' }}>
        {!loading && chartData.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            <RefreshCw size={24} className="animate-spin" style={{ opacity: 0.5, marginBottom: '8px' }} />
            Loading graph data...
          </div>
        ) : (
          <Line ref={chartRef} data={data} options={options} />
        )}
      </div>
    </div>
  );
}

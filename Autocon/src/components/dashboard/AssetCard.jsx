import React, { useEffect, useRef, memo, useMemo } from 'react';
import './styles/dashboard.css';

/* ─── Sparkline helpers (unchanged from original) ────────────────────── */
function makeSpark(data, w, h, color) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = ((i / (data.length - 1)) * w).toFixed(1);
    const y = (h - ((v - min) / range) * (h * 0.82) - h * 0.08).toFixed(1);
    return `${x},${y}`;
  });
  const len = Math.ceil(pts.reduce((acc, _, i) => {
    if (i === 0) return 0;
    const [x1, y1] = pts[i - 1].split(',').map(Number);
    const [x2, y2] = pts[i].split(',').map(Number);
    return acc + Math.hypot(x2 - x1, y2 - y1);
  }, 0));
  const fillPts = `${pts[0]} ${pts.join(' ')} ${w},${h} 0,${h}`;
  const gId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${fillPts}" fill="url(#${gId})"
      style="opacity:0;animation:db-fadeUp .9s ease .4s forwards" />
    <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round"
      style="stroke-dasharray:${len};stroke-dashoffset:${len};animation:db-drawLine .9s ease .3s forwards"/>
  </svg>`;
}



/* ─── Trend arrow SVG ────────────────────────────────────────────────── */
function TrendArrow({ up }) {
  return up ? (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: 'inline' }}>
      <path d="M6 2L10 8H2L6 2Z" fill="#22c55e"/>
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: 'inline' }}>
      <path d="M6 10L2 4H10L6 10Z" fill="#ef4444"/>
    </svg>
  );
}

/* ─── Individual market row — MEMOIZED to prevent full-table re-renders ─ */
const MarketRow = memo(function MarketRow({ token, price, change, flashing, historyData, onClick, rank, animDelay }) {
  const rowRef     = useRef(null);
  const animActive = useRef(false);
  const sparkRef   = useRef(null);

  const isUp = change >= 0;

  const displayPrice = price != null
    ? `$${price.toLocaleString(undefined, { minimumFractionDigits: price < 1 ? 4 : 2, maximumFractionDigits: price < 1 ? 6 : 2 })}`
    : '—';
  const displayChange = change != null
    ? `${isUp ? '+' : ''}${change.toFixed(2)}%`
    : '—';

  /* Plot sparkline from real historical data */
  useEffect(() => {
    if (!sparkRef.current || !historyData || historyData.length === 0) return;
    
    // Determine 7-day trend from the oldest to the newest data point
    const firstPrice = historyData[0];
    const lastPrice = historyData[historyData.length - 1];
    const is7dUp = lastPrice >= firstPrice;
    
    const color = is7dUp ? '#22c55e' : '#ef4444';
    sparkRef.current.innerHTML = makeSpark(historyData, 90, 32, color);
  }, [historyData]); 

  /* Flash on price update — identical logic to original */
  useEffect(() => {
    if (!rowRef.current || !flashing || animActive.current) return;
    const el  = rowRef.current;
    const cls = flashing === 'up' ? 'mkt-flash-up' : 'mkt-flash-down';
    animActive.current = true;
    el.classList.remove('mkt-flash-up', 'mkt-flash-down');
    void el.offsetWidth;
    el.classList.add(cls);
    const t = setTimeout(() => {
      el.classList.remove(cls);
      animActive.current = false;
    }, 900);
    return () => clearTimeout(t);
  }, [flashing]);

  const coinColor = token.iconColor;
  const coinBg    = `${coinColor}28`;

  return (
    <div
      ref={rowRef}
      className={`mkt-row ${isUp ? 'up' : 'dn'}`}
      style={{ animationDelay: animDelay }}
      /* ── ALL ORIGINAL CLICK LOGIC PRESERVED ── */
      onClick={() => onClick && onClick({ ...token, price, change })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick({ ...token, price, change })}
      aria-label={`Open ${token.name} chart`}
    >
      {/* Rank */}
      <div className="mkt-col-rank">{rank}</div>

      {/* Coin identity */}
      <div className="mkt-col-asset">
        <div className="mkt-avatar" style={{ background: coinBg, color: coinColor }}>
          {token.symbol.slice(0, 2)}
        </div>
        <div className="mkt-asset-names">
          <span className="mkt-name">{token.name}</span>
          <span className="mkt-sym">{token.symbol} / USDT</span>
        </div>
      </div>

      {/* 24h change badge */}
      <div className="mkt-col-change">
        <span className={`mkt-badge ${isUp ? 'up' : 'dn'}`}>
          <TrendArrow up={isUp} />
          {displayChange}
        </span>
      </div>

      {/* Price */}
      <div className="mkt-col-price">
        <span className="mkt-price">{displayPrice}</span>
      </div>

      {/* Trend direction arrow (large) */}
      <div className="mkt-col-trend">
        <span className={`mkt-trend-arrow ${isUp ? 'up' : 'dn'}`}>
          {isUp ? '▲' : '▼'}
        </span>
      </div>

      {/* Mini sparkline — hidden on small screens via CSS */}
      <div className="mkt-col-spark mkt-spark-hide-sm">
        <div ref={sparkRef} className="mkt-spark" />
      </div>
    </div>
  );
});

export default MarketRow;

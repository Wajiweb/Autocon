import React, { useEffect, useRef } from 'react';
import './styles/dashboard.css';

/**
 * Generates a smooth SVG polyline spark from an array of numbers.
 * Returns an SVG string.
 */
function makeSpark(data, w, h, color) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = ((i / (data.length - 1)) * w).toFixed(1);
    const y = (h - ((v - min) / range) * (h * 0.82) - h * 0.08).toFixed(1);
    return `${x},${y}`;
  });

  // Approximate polyline length for dash animation
  const len = Math.ceil(pts.reduce((acc, _, i) => {
    if (i === 0) return 0;
    const [x1, y1] = pts[i - 1].split(',').map(Number);
    const [x2, y2] = pts[i].split(',').map(Number);
    return acc + Math.hypot(x2 - x1, y2 - y1);
  }, 0));

  const first = pts[0];
  const last  = pts[pts.length - 1];
  const fillPts = `${first} ${pts.join(' ')} ${w},${h} 0,${h}`;
  const gId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;

  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${fillPts}" fill="url(#${gId})"
      style="opacity:0;animation:db-fadeUp .9s ease .4s forwards" />
    <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round"
      style="stroke-dasharray:${len};stroke-dashoffset:${len};animation:db-drawLine .9s ease .3s forwards"/>
  </svg>`;
}

function sparkData(n, up) {
  const d = [50];
  for (let i = 1; i < n; i++) {
    const trend = up ? 0.3 : -0.3;
    d.push(Math.max(10, Math.min(90, d[i - 1] + (Math.random() - 0.5 + trend) * 8)));
  }
  return d;
}

/**
 * NewAssetCard — matches the HTML reference design.
 * Props: token, price, change, flashing, onClick
 */
export default function NewAssetCard({ token, price, change, flashing, onClick }) {
  const cardRef    = useRef(null);
  const animActive = useRef(false);
  const sparkRef   = useRef(null);

  const isUp = change >= 0;
  const displayPrice = price != null
    ? `$${price.toLocaleString(undefined, { minimumFractionDigits: price < 1 ? 4 : 2, maximumFractionDigits: price < 1 ? 6 : 2 })}`
    : '—';
  const displayChange = change != null
    ? `${isUp ? '+' : ''}${change.toFixed(2)}%`
    : '—';

  // Render spark on mount
  useEffect(() => {
    if (!sparkRef.current) return;
    const data = sparkData(18, isUp);
    const color = isUp ? '#22c55e' : '#ef4444';
    sparkRef.current.innerHTML = makeSpark(data, 200, 34, color);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Flash on price change
  useEffect(() => {
    if (!cardRef.current || !flashing || animActive.current) return;
    const el  = cardRef.current;
    const cls = flashing === 'up' ? 'db-flash-up' : 'db-flash-down';
    animActive.current = true;
    el.classList.remove('db-flash-up', 'db-flash-down');
    void el.offsetWidth;
    el.classList.add(cls);
    const t = setTimeout(() => {
      el.classList.remove(cls);
      animActive.current = false;
    }, 900);
    return () => clearTimeout(t);
  }, [flashing]);

  const coinColor = token.iconColor;
  const coinBg    = `${coinColor}2e`;

  return (
    <div
      ref={cardRef}
      className={`db-asset-card ${isUp ? 'up' : 'dn'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`Open ${token.name} chart`}
    >
      {/* Row: coin id + % change */}
      <div className="db-ac-row">
        <div className="db-coin-id">
          <div
            className="db-coin-avatar"
            style={{ background: coinBg, color: coinColor }}
          >
            {token.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="db-coin-name">{token.name}</div>
            <div className="db-coin-sym">{token.symbol}</div>
          </div>
        </div>
        <span className={`db-pct-tag ${isUp ? 'up' : 'dn'}`}>{displayChange}</span>
      </div>

      {/* Price */}
      <div className="db-ac-price">{displayPrice}</div>

      {/* Sparkline */}
      <div className="db-ac-spark" ref={sparkRef} />
    </div>
  );
}

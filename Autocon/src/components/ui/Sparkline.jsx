import React, { useEffect, useRef } from 'react';

/**
 * Animated SVG Sparkline for Dashboard stats
 */
export default function Sparkline({ up, color }) {
    const ref = useRef(null);
  
    useEffect(() => {
      if (!ref.current) return;
      const d2 = [50];
      for (let i = 1; i < 14; i++) {
        const trend = up ? 0.3 : -0.3;
        d2.push(Math.max(10, Math.min(90, d2[i - 1] + (Math.random() - 0.5 + trend) * 8)));
      }
      const W = 200, H = 30;
      const max = Math.max(...d2), min = Math.min(...d2), range = max - min || 1;
      const pts = d2.map((v, i) => {
        const x = ((i / (d2.length - 1)) * W).toFixed(1);
        const y = (H - ((v - min) / range) * (H * 0.82) - H * 0.08).toFixed(1);
        return `${x},${y}`;
      });
      const len = Math.ceil(pts.reduce((acc, _, i) => {
        if (i === 0) return 0;
        const [x1, y1] = pts[i - 1].split(',').map(Number);
        const [x2, y2] = pts[i].split(',').map(Number);
        return acc + Math.hypot(x2 - x1, y2 - y1);
      }, 0));
      const gId = `sg${color.replace(/[^a-z0-9]/gi, '')}${Math.random().toString(36).slice(2, 6)}`;
      const fillPts = `${pts[0]} ${pts.join(' ')} ${W},${H} 0,${H}`;
      ref.current.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polygon points="${fillPts}" fill="url(#${gId})" style="opacity:0;animation:db-fadeUp .9s ease .4s forwards"/>
        <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round"
          style="stroke-dasharray:${len};stroke-dashoffset:${len};animation:db-drawLine .9s ease .3s forwards"/>
      </svg>`;
    }, [up, color]); 
  
    return <div ref={ref} className="db-sc-spark" />;
}

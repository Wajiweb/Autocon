import { useState, useEffect, memo } from 'react';
import { Fuel } from 'lucide-react';
import { useGasTracker } from '../../hooks/useGasTracker';
import './styles/dashboard.css';

/* ══════════════════════════════════════════════════════
   GasWidget — compact topbar gas price chip
   Polls live via MetaMask or Cloudflare RPC every 15s.
   Color: green (cheap <15 Gwei) | amber (average) | red (expensive >40 Gwei)
══════════════════════════════════════════════════════ */
const GasWidget = memo(function GasWidget() {
  const { gasPriceGwei, status, isLoading } = useGasTracker();
  const [ethPriceUsd, setEthPriceUsd] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.ethereum?.usd) setEthPriceUsd(data.ethereum.usd);
      } catch (_) {}
    };
    fetchPrice();
    const iv = setInterval(fetchPrice, 60_000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  // Color tokens matched to db-* design system
  const palette = {
    cheap:     { color: 'var(--db-acc)',   glow: 'rgba(34,197,94,.35)',   border: 'rgba(34,197,94,.25)' },
    expensive: { color: 'var(--db-red)',   glow: 'rgba(239,68,68,.3)',    border: 'rgba(239,68,68,.22)' },
    average:   { color: 'var(--db-amber)', glow: 'rgba(245,158,11,.3)',   border: 'rgba(245,158,11,.22)' },
  };
  const { color, glow, border } = palette[status] || palette.average;

  const loading = isLoading || gasPriceGwei === null;
  const gwei    = loading ? null : Math.round(gasPriceGwei);

  // Estimate deployment cost in USD (1.5M gas = typical ERC-20 deploy)
  const fiatStr = (!loading && ethPriceUsd)
    ? `~$${((gasPriceGwei * 1_500_000 / 1e9) * ethPriceUsd).toFixed(2)}`
    : null;

  return (
    <div
      title={`Gas ${status}: ${gwei ?? '…'} Gwei — estimated deploy cost`}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '4px 11px', borderRadius: var_r,
        border: `.5px solid ${border}`,
        background: 'var(--db-s2)',
        cursor: 'default', userSelect: 'none',
        transition: 'border-color .3s',
        fontFamily: 'var(--db-font)',
      }}
    >
      {/* Animated dot */}
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: loading ? 'var(--db-t3)' : color,
        boxShadow: loading ? 'none' : `0 0 6px ${glow}`,
        animation: loading ? 'none' : 'db-pulse 1.8s ease infinite',
      }} />

      {/* Values */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        {fiatStr
          ? <>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--db-t1)' }}>{fiatStr}</span>
              <span style={{ fontSize: 9.5, fontFamily: 'var(--db-mono)', color: 'var(--db-t3)' }}>{gwei} Gwei</span>
            </>
          : <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--db-mono)', color: loading ? 'var(--db-t3)' : color }}>
              {loading ? '…' : `${gwei} Gwei`}
            </span>
        }
      </div>

      {/* Fuel icon */}
      <Fuel size={14} style={{ opacity: .7 }} />
    </div>
  );
});

// small helper to avoid string template in JSX style object
const var_r = 'var(--db-r-sm)';

export default GasWidget;

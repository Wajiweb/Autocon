import { useState, useEffect, memo } from 'react';
import { useGasTracker } from '../../hooks/useGasTracker';
import { useNetwork } from '../../context/NetworkContext';
import { Fuel } from 'lucide-react';
import './styles/dashboard.css';

/* ══════════════════════════════════════════════════════
   GasWidget — compact topbar gas price chip
   • Network-aware: updates when user switches chain
   • Shows correct currency (ETH / tBNB / etc.)
   • Polls every 15 s via selected network's RPC
══════════════════════════════════════════════════════ */
const GasWidget = memo(function GasWidget() {
  const { gasPriceGwei, status, isLoading } = useGasTracker();
  const { network } = useNetwork();

  // Coingecko coin ID per network key
  const COIN_ID = {
    sepolia:    'ethereum',
    bnbTestnet: 'binancecoin',
  };

  const [nativePriceUsd, setNativePriceUsd] = useState(null);
  const coinId = COIN_ID[network?.key] ?? 'ethereum';

  // Re-fetch native token price whenever the network changes
  useEffect(() => {
    let mounted = true;
    setNativePriceUsd(null);

    const fetchPrice = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data[coinId]?.usd) setNativePriceUsd(data[coinId].usd);
      } catch (_) {}
    };

    fetchPrice();
    const iv = setInterval(fetchPrice, 60_000);
    return () => { mounted = false; clearInterval(iv); };
  }, [coinId]);

  // Color palette
  const palette = {
    cheap:     { color: 'var(--db-acc)',   glow: 'rgba(34,197,94,.35)',   border: 'rgba(34,197,94,.25)' },
    expensive: { color: 'var(--db-red)',   glow: 'rgba(239,68,68,.3)',    border: 'rgba(239,68,68,.22)' },
    average:   { color: 'var(--db-amber)', glow: 'rgba(245,158,11,.3)',   border: 'rgba(245,158,11,.22)' },
  };
  const { color, glow, border } = palette[status] || palette.average;

  const loading = isLoading || gasPriceGwei === null;
  const gwei    = loading ? null : gasPriceGwei.toFixed(2);

  // USD estimate: realistic gas units for simple contract deploy
  // BNB chain: gas price is the full price (no tip/base split)
  // ETH: showing priority tip only → multiply by slightly more for realistic estimate
  const isBNB         = network?.key?.toLowerCase().includes('bnb');
  const DEPLOY_GAS    = isBNB ? 1_200_000 : 200_000; // BNB uses full gasPrice (cheap), ETH uses tip only
  const currency      = network?.currencySymbol ?? 'ETH';

  const fiatStr = (!loading && nativePriceUsd)
    ? `~$${((gasPriceGwei * DEPLOY_GAS / 1e9) * nativePriceUsd).toFixed(isBNB ? 2 : 3)}`
    : null;

  const tooltipLabel = `${network?.name ?? ''} gas · ${gwei ?? '…'} Gwei (${status}) · est. deploy cost`;

  return (
    <div
      title={tooltipLabel}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '4px 11px', borderRadius: VAR_R,
        border: `.5px solid ${border}`,
        background: 'rgba(255,255,255,0.055)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
              <span style={{ fontSize: 9.5, fontFamily: 'var(--db-mono)', color: 'var(--db-t3)' }}>
                {gwei} Gwei · {currency}
              </span>
            </>
          : <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--db-mono)', color: loading ? 'var(--db-t3)' : color }}>
              {loading ? '…' : `${gwei} Gwei`}
            </span>
        }
      </div>

      {/* Fuel icon */}
      <span style={{ display: 'flex', alignItems: 'center', opacity: .7, color: 'var(--db-t3)' }}>
        <Fuel size={14} />
      </span>
    </div>
  );
});

const VAR_R = 'var(--db-r-sm)';
export default GasWidget;

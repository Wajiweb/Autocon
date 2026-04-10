import { useState, useEffect, memo } from 'react';
import { Fuel } from 'lucide-react';
import { useGasTracker } from '../../hooks/useGasTracker';

const GasWidget = memo(function GasWidget() {
  const { gasPriceGwei, status, isLoading: gasLoading } = useGasTracker();
  const [ethPriceUsd, setEthPriceUsd] = useState(null);
  useEffect(() => {
    let isMounted = true;
    const fetchEthPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        if (!res.ok) throw new Error('Failed to fetch to coin price');
        const data = await res.json();
        if (isMounted && data.ethereum && data.ethereum.usd) {
          setEthPriceUsd(data.ethereum.usd);
        }
      } catch (err) {
        console.error("CoinGecko API error:", err);
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

 
  const getStatusStyles = () => {
    switch (status) {
      case 'cheap':
        return {
          color: 'var(--success)', // #10b981
          border: 'rgba(16, 185, 129, 0.3)',
          glow: 'rgba(16, 185, 129, 0.4)'
        };
      case 'expensive':
        return {
          color: 'var(--danger)', // #ef4444
          border: 'rgba(239, 68, 68, 0.3)',
          glow: 'rgba(239, 68, 68, 0.4)'
        };
      case 'average':
      default:
        return {
          color: 'var(--warning)', // #f59e0b
          border: 'rgba(245, 158, 11, 0.3)',
          glow: 'rgba(245, 158, 11, 0.4)'
        };
    }
  };

  const styles = getStatusStyles();
  const loading = gasLoading || gasPriceGwei === null;


  let fiatCostRaw = null;
  if (!loading && ethPriceUsd !== null) {
    const gasCostEth = (gasPriceGwei * 1500000) / 1e9;
    fiatCostRaw = gasCostEth * ethPriceUsd;
  }

  const formattedFiat = fiatCostRaw !== null 
    ? `~$${fiatCostRaw.toFixed(2)}` 
    : '---';

  const formattedGwei = !loading ? Math.round(gasPriceGwei) : '---';

  return (
    <div
      className="glass"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '16px',
        background: 'rgba(22, 29, 43, 0.8)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${styles.border}`,
        boxShadow: `0 4px 20px ${styles.glow.replace('0.4', '0.05')}`, 
        transition: 'all 0.3s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      title={`Gas status: ${status}. Standard deployment (1.5M gas) estimated cost.`}
    >
      {/* Icon Area */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Fuel size={20} color={styles.color} />
        <div 
          className="absolute right-[-4px] bottom-[-2px] animate-pulse"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: styles.color,
            boxShadow: `0 0 8px ${styles.color}`
          }}
        />
      </div>

      {/* Pricing Information */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '70px' }}>
        {ethPriceUsd ? (
          <>
            <span style={{ 
              fontFamily: '"Space Grotesk", sans-serif', 
              fontSize: '1rem', 
              fontWeight: 700, 
              color: 'var(--on-surface)',
              lineHeight: 1.1
            }}>
              {formattedFiat}
            </span>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 600, 
              color: 'var(--outline)',
              letterSpacing: '0.02em',
              fontFamily: 'Inter, sans-serif'
            }}>
              {formattedGwei} Gwei
            </span>
          </>
        ) : (
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            color: 'var(--on-surface)',
            letterSpacing: '0.02em',
            fontFamily: 'Inter, sans-serif'
          }}>
            {formattedGwei} Gwei
          </span>
        )}
      </div>
    </div>
  );
});

export default GasWidget;

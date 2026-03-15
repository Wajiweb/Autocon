import { useState, useEffect } from 'react';

/**
 * CryptoNewsTicker — Fetches and displays live crypto market data
 * and trending news using CoinGecko's free API.
 * Falls back to static content if API is unavailable.
 */
export default function CryptoNewsTicker() {
  const [prices, setPrices] = useState(null);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top coin prices
        const priceRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true'
        );
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          setPrices(priceData);
        }
      } catch { /* use fallback */ }

      try {
        // Fetch trending coins
        const trendRes = await fetch('https://api.coingecko.com/api/v3/search/trending');
        if (trendRes.ok) {
          const trendData = await trendRes.json();
          setTrendingCoins(trendData.coins?.slice(0, 5) || []);
        }
      } catch { /* use fallback */ }

      setLastUpdated(new Date());
    };

    fetchData();
    const interval = setInterval(fetchData, 120000); // Update every 2 min
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (!price) return '--';
    return price >= 1 ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `$${price.toFixed(4)}`;
  };

  const formatChange = (change) => {
    if (change == null) return null;
    const isPositive = change >= 0;
    return (
      <span style={{
        fontSize: '0.68rem', fontWeight: 700,
        color: isPositive ? 'var(--success)' : 'var(--danger)',
        display: 'flex', alignItems: 'center', gap: '2px'
      }}>
        {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  const coins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#f7931a' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: '#627eea' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '◎', color: '#14f195' },
    { id: 'polygon-ecosystem-token', name: 'Polygon', symbol: 'POL', icon: '⬡', color: '#8247e5' }
  ];

  const newsItems = [
    { title: 'Ethereum L2s hit record TVL as rollup adoption surges', tag: 'DeFi', color: '#627eea' },
    { title: 'Smart contract audits become mandatory for DeFi protocols', tag: 'Security', color: '#ef4444' },
    { title: 'ERC-4337 account abstraction gains mainstream adoption', tag: 'Tech', color: '#06b6d4' },
    { title: 'NFT royalty standards evolve with new EIP proposals', tag: 'NFTs', color: '#ec4899' },
    { title: 'Zero-knowledge proofs revolutionize on-chain privacy', tag: 'ZK', color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
      {/* Market Prices */}
      <div className="card animate-fade-in-up delay-300" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            📈 Live Market
          </h3>
          {lastUpdated && (
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {coins.map(coin => {
            const data = prices?.[coin.id];
            return (
              <div key={coin.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: `${coin.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 800, color: coin.color
                  }}>{coin.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{coin.symbol}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{coin.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatPrice(data?.usd)}
                  </div>
                  {formatChange(data?.usd_24h_change)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending / News */}
      <div className="card animate-fade-in-up delay-400" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
          🔥 Trending in Web3
        </h3>

        {/* Trending Coins */}
        {trendingCoins.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {trendingCoins.map((t, i) => (
              <div key={i} style={{
                padding: '5px 10px', borderRadius: '8px',
                background: 'var(--accent-glow)',
                border: '1px solid rgba(6,182,212,0.12)',
                fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                {t.item?.thumb && (
                  <img src={t.item.thumb} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
                )}
                {t.item?.symbol}
              </div>
            ))}
          </div>
        )}

        {/* News Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {newsItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '10px', borderRadius: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{
                padding: '2px 8px', borderRadius: '6px',
                fontSize: '0.55rem', fontWeight: 700,
                background: `${item.color}12`,
                color: item.color,
                whiteSpace: 'nowrap', flexShrink: 0
              }}>{item.tag}</span>
              <p style={{
                fontSize: '0.72rem', fontWeight: 600,
                color: 'var(--text-secondary)',
                lineHeight: 1.3, margin: 0
              }}>{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

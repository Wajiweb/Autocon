import React from 'react';
import AssetCard from './AssetCard';
import { ASSET_TOKENS } from '../../utils/assets';
import useLivePrices from '../../hooks/useLivePrices';
import './styles/dashboard.css';

const SYMBOLS = ASSET_TOKENS.map((t) => t.binanceId);

export default function AssetGrid({ onSelectCoin }) {
  const { prices } = useLivePrices(SYMBOLS);

  return (
    <>
      {/* Section header */}
      <div className="db-sec-head db-enter db-enter-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span className="db-sec-title">Live Assets</span>
            <div className="db-live-badge">
              <div className="db-live-dot" />
              Live
            </div>
          </div>
          <div className="db-sec-sub">Real-time prices via Binance WebSocket</div>
        </div>
        <button className="db-sec-link">View all →</button>
      </div>

      {/* Cards */}
      <div className="db-asset-grid db-enter db-enter-4">
        {ASSET_TOKENS.map((token) => {
          const live = prices[token.binanceId] || {};
          return (
            <AssetCard
              key={token.binanceId}
              token={token}
              price={live.price}
              change={live.change}
              flashing={live.flashing}
              onClick={() => onSelectCoin({ ...token, price: live.price, change: live.change })}
            />
          );
        })}
      </div>
    </>
  );
}

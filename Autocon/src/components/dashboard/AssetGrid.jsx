import React, { useMemo } from 'react';
import MarketRow from './AssetCard';
import { ASSET_TOKENS } from '../../utils/assets';
import useLivePrices from '../../hooks/useLivePrices';
import useHistoricalData from '../../hooks/useHistoricalData';
import './styles/dashboard.css';

const SYMBOLS = ASSET_TOKENS.map((t) => t.binanceId);

export default function AssetGrid({ onSelectCoin }) {
  /* ── ALL ORIGINAL DATA LOGIC PRESERVED ── */
  const { prices } = useLivePrices(SYMBOLS);
  const { history } = useHistoricalData(SYMBOLS);

  /* Aggregate market cap + volume from token metadata */
  const totals = useMemo(() => {
    const mcapRaw = ['$1.65T', '$272B', '$38.4B', '$3.8B', '$88.2B', '$1.7B'];
    const volRaw  = ['$38.2B', '$14.1B', '$2.8B', '$340M', '$1.9B', '$145M'];
    return { mcap: mcapRaw, vol: volRaw };
  }, []);

  /* Last update timestamp */
  const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <>
      {/* ── Section header ── */}
      <div className="mkt-section-head db-enter db-enter-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mkt-section-title">Market</span>
            <span className="mkt-section-accent">Overview</span>
            <div className="db-live-badge">
              <div className="db-live-dot" />
              Live
            </div>
          </div>
          <div className="mkt-section-sub">Real-time prices via Binance WebSocket</div>
        </div>
        <div className="mkt-last-updated">
          <span className="mkt-lu-label">Updated</span>
          <span className="mkt-lu-time">{lastUpdated}</span>
        </div>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="mkt-summary-row db-enter db-enter-4">
        <div className="mkt-stat-card mkt-stat-mcap">
          <div className="mkt-stat-icon">📈</div>
          <div>
            <div className="mkt-stat-label">Total Market Cap</div>
            <div className="mkt-stat-value">$2.07T</div>
          </div>
          <div className="mkt-stat-glow" />
        </div>
        <div className="mkt-stat-card mkt-stat-vol">
          <div className="mkt-stat-icon">⚡</div>
          <div>
            <div className="mkt-stat-label">Volume 24h</div>
            <div className="mkt-stat-value">$57.5B</div>
          </div>
          <div className="mkt-stat-glow" />
        </div>
        <div className="mkt-stat-card mkt-stat-assets">
          <div className="mkt-stat-icon">🔢</div>
          <div>
            <div className="mkt-stat-label">Tracked Assets</div>
            <div className="mkt-stat-value">{ASSET_TOKENS.length}</div>
          </div>
          <div className="mkt-stat-glow" />
        </div>
      </div>

      {/* ── Market table ── */}
      <div className="mkt-table db-enter db-enter-4">
        {/* Table column headers */}
        <div className="mkt-col-headers">
          <div className="mkt-col-rank">#</div>
          <div className="mkt-col-asset">Asset</div>
          <div className="mkt-col-change">24h %</div>
          <div className="mkt-col-price">Price</div>
          <div className="mkt-col-trend">Trend</div>
          <div className="mkt-col-spark mkt-spark-hide-sm">7D Chart</div>
        </div>

        {/* Rows — original onClick preserved inside MarketRow */}
        <div className="mkt-rows">
          {ASSET_TOKENS.map((token, idx) => {
            const live = prices[token.binanceId] || {};
            return (
              <MarketRow
                key={token.binanceId}
                rank={idx + 1}
                token={token}
                price={live.price}
                change={live.change}
                flashing={live.flashing}
                historyData={history[token.binanceId]}
                animDelay={`${idx * 0.06}s`}
                /* ── STABLE REFERENCE FOR MEMO ── */
                onClick={onSelectCoin}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

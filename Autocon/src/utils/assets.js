/**
 * assets.js — Static list of crypto tokens shown in the AssetGrid.
 * iconColor is used as the accent colour for each card.
 * high/low/mcap/vol are shown in the ChartModal stats section.
 */
export const ASSET_TOKENS = [
  {
    symbol:    'BTC',
    binanceId: 'BTCUSDT',
    name:      'Bitcoin',
    iconColor: '#f59e0b',
    iconUrl:   'https://assets.coincap.io/assets/icons/btc@2x.png',
    holdings:  0.00124,
    high:  '$86,400', low:  '$81,200', mcap: '$1.65T', vol: '$38.2B',
  },
  {
    symbol:    'ETH',
    binanceId: 'ETHUSDT',
    name:      'Ethereum',
    iconColor: '#818cf8',
    iconUrl:   'https://assets.coincap.io/assets/icons/eth@2x.png',
    holdings:  0.082,
    high:  '$2,340', low:  '$2,190', mcap: '$272B', vol: '$14.1B',
  },
  {
    symbol:    'SOL',
    binanceId: 'SOLUSDT',
    name:      'Solana',
    iconColor: '#22c55e',
    iconUrl:   'https://assets.coincap.io/assets/icons/sol@2x.png',
    holdings:  1.54,
    high:  '$86.50', low:  '$81.30', mcap: '$38.4B', vol: '$2.8B',
  },
  {
    symbol:    'MATIC',
    binanceId: 'MATICUSDT',
    name:      'Polygon',
    iconColor: '#a78bfa',
    iconUrl:   'https://assets.coincap.io/assets/icons/matic@2x.png',
    holdings:  124,
    high:  '$0.3920', low:  '$0.3690', mcap: '$3.8B', vol: '$340M',
  },
  {
    symbol:    'BNB',
    binanceId: 'BNBUSDT',
    name:      'BNB',
    iconColor: '#fbbf24',
    iconUrl:   'https://assets.coincap.io/assets/icons/bnb@2x.png',
    holdings:  0.6,
    high:  '$612.00', low:  '$601.20', mcap: '$88.2B', vol: '$1.9B',
  },
  {
    symbol:    'DOT',
    binanceId: 'DOTUSDT',
    name:      'Polkadot',
    iconColor: '#f472b6',
    iconUrl:   'https://assets.coincap.io/assets/icons/dot@2x.png',
    holdings:  10,
    high:  '$1.22', low:  '$1.16', mcap: '$1.7B', vol: '$145M',
  },
];

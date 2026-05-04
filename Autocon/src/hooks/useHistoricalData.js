import { useState, useEffect } from 'react';

// In-memory cache to prevent spamming the Binance API on component remounts
// Format: { 'BTCUSDT': { data: [prices...], timestamp: 123456789 } }
const CACHE = {};
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

/**
 * Fetches 7-day historical candlestick data from Binance for sparklines.
 * 
 * @param {string[]} symbols - Array of Binance symbols (e.g. ['BTCUSDT', 'ETHUSDT'])
 * @returns { history, loading } - history is an object mapping symbols to arrays of closing prices.
 */
export default function useHistoricalData(symbols = []) {
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbols.length) return;

    let isMounted = true;

    const fetchHistory = async () => {
      setLoading(true);
      const results = {};
      const now = Date.now();
      
      const fetchPromises = symbols.map(async (sym) => {
        // 1. Check if we have fresh data in the cache
        if (CACHE[sym] && (now - CACHE[sym].timestamp < CACHE_TTL)) {
          results[sym] = CACHE[sym].data;
          return;
        }

        // 2. Otherwise, fetch from Binance
        try {
          // interval=4h, limit=42 exactly covers 7 days (7 * 24 / 4 = 42)
          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=4h&limit=42`);
          if (!res.ok) throw new Error(`API Error: ${res.status}`);
          const data = await res.json();
          
          // Kline array format:
          // [Open time, Open, High, Low, Close, Volume, Close time, ...]
          // We extract only the Close price (index 4) for the sparkline trend
          const closePrices = data.map(candle => parseFloat(candle[4]));
          
          results[sym] = closePrices;
          
          // Save to cache
          CACHE[sym] = { data: closePrices, timestamp: now };
        } catch (error) {
          console.error(`Failed to fetch history for ${sym}:`, error);
          results[sym] = []; // fallback to empty array on failure
        }
      });

      await Promise.all(fetchPromises);

      if (isMounted) {
        setHistory(results);
        setLoading(false);
      }
    };

    fetchHistory();

    return () => { isMounted = false; };
  }, [symbols.join(',')]);

  return { history, loading };
}

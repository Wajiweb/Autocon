import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useLivePrices
 * Opens one Binance combined-stream WebSocket for all requested symbols.
 * Returns { prices, connectionStatus } where prices[symbol] = { price, change, flashing }.
 *
 * Features:
 *   - Automatic reconnection with exponential backoff (2s → 4s → 8s → 16s → 32s)
 *   - Falls back to REST polling after 5 failed reconnection attempts
 *   - Connection status tracking: 'connecting' | 'connected' | 'reconnecting' | 'polling' | 'failed'
 *
 * @param {string[]} symbols  – e.g. ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'MATICUSDT']
 */
export default function useLivePrices(symbols = []) {
  const [prices, setPrices] = useState(() => {
    const init = {};
    symbols.forEach((s) => { init[s] = { price: null, change: null, flashing: null }; });
    return init;
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const wsRef              = useRef(null);
  const seedsRef           = useRef({});
  const lastTickRef        = useRef({});
  const lastFlashRef       = useRef({});
  const lastPriceRef       = useRef({});
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const pollingRef         = useRef(null);
  const isUnmountedRef     = useRef(false);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 2000;

  // ── 1. Seed with REST 24-hr ticker snapshot ──────────────────────────────
  const seedPrices = useCallback(async () => {
    try {
      const joined = symbols.map((s) => `"${s}"`).join(',');
      const res = await fetch(
        `/api/binance/api/v3/ticker/24hr?symbols=[${joined}]`
      );
      const data = await res.json();
      if (!Array.isArray(data)) return;

      data.forEach((item) => {
        const p = parseFloat(item.lastPrice);
        seedsRef.current[item.symbol]     = p;
        lastPriceRef.current[item.symbol] = p;
      });

      setPrices((prev) => {
        const next = { ...prev };
        data.forEach((item) => {
          next[item.symbol] = {
            price:    parseFloat(item.lastPrice),
            change:   parseFloat(item.priceChangePercent),
            flashing: null,
          };
        });
        return next;
      });
    } catch (_) { /* silent fail – WS/polling will fill in prices */ }
  }, [symbols.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. REST Polling Fallback ─────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (isUnmountedRef.current) return;
    setConnectionStatus('polling');
    console.log('🔄 Switching to REST polling fallback...');
    
    pollingRef.current = setInterval(async () => {
      if (isUnmountedRef.current) return;
      try {
        const joined = symbols.map((s) => `"${s}"`).join(',');
        const res = await fetch(`/api/binance/api/v3/ticker/24hr?symbols=[${joined}]`);
        const data = await res.json();
        if (!Array.isArray(data)) return;

        data.forEach((item) => {
          const newPrice = parseFloat(item.lastPrice);
          const sym = item.symbol;
          const prevPrice = lastPriceRef.current[sym];
          
          if (prevPrice != null && newPrice !== prevPrice) {
            const flashDir = newPrice >= prevPrice ? 'up' : 'down';
            lastPriceRef.current[sym] = newPrice;
            
            const baseline = seedsRef.current[sym] ?? newPrice;
            const change = baseline ? ((newPrice - baseline) / baseline) * 100 : 0;

            setPrices((prev) => ({
              ...prev,
              [sym]: { price: newPrice, change, flashing: flashDir },
            }));

            setTimeout(() => {
              if (!isUnmountedRef.current) {
                setPrices((prev) => ({
                  ...prev,
                  [sym]: { ...prev[sym], flashing: null },
                }));
              }
            }, 900);
          } else {
            lastPriceRef.current[sym] = newPrice;
          }
        });
      } catch (err) {
        console.error('REST polling failed:', err);
      }
    }, 5000);
  }, [symbols.join(',')]);

  // ── 3. Reconnection Logic ────────────────────────────────────────────────
  const reconnect = useCallback(() => {
    if (isUnmountedRef.current) return;
    
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn(`⚠️ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Falling back to REST polling.`);
      startPolling();
      return;
    }
    
    const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
    reconnectAttemptsRef.current++;
    
    setConnectionStatus('reconnecting');
    console.log(`🔁 Reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        connectWebSocket();
      }
    }, delay);
  }, [startPolling]);

  // ── 4. WebSocket Connection ─────────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    if (isUnmountedRef.current || !symbols.length) return;

    const streams = symbols.map((s) => `${s.toLowerCase()}@trade`).join('/');
    const url     = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    
    setConnectionStatus('connecting');
    
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isUnmountedRef.current) return;
      console.log(`✅ WebSocket connected for ${symbols.length} symbols`);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      if (isUnmountedRef.current) return;
      try {
        const envelope = JSON.parse(event.data);
        const trade    = envelope.data;
        if (!trade) return;

        const sym = trade.s;
        const now = Date.now();

        if (now - (lastTickRef.current[sym] || 0) < 1000) return;
        lastTickRef.current[sym] = now;

        const newPrice = parseFloat(trade.p);
        if (isNaN(newPrice)) return;

        const prevPrice     = lastPriceRef.current[sym];
        const priceChanged  = prevPrice != null && newPrice !== prevPrice;
        const flashReady    = now - (lastFlashRef.current[sym] || 0) >= 3000;
        const shouldFlash   = priceChanged && flashReady;

        const flashDir = shouldFlash
          ? (newPrice >= prevPrice ? 'up' : 'down')
          : null;

        if (shouldFlash) lastFlashRef.current[sym] = now;
        lastPriceRef.current[sym] = newPrice;

        const baseline = seedsRef.current[sym] ?? newPrice;
        const change   = baseline ? ((newPrice - baseline) / baseline) * 100 : 0;

        setPrices((prev) => ({
          ...prev,
          [sym]: { price: newPrice, change, flashing: flashDir },
        }));

        if (shouldFlash) {
          setTimeout(() => {
            if (!isUnmountedRef.current) {
              setPrices((prev) => ({
                ...prev,
                [sym]: { ...prev[sym], flashing: null },
              }));
            }
          }, 900);
        }
      } catch (_) { /* ignore malformed messages */ }
    };

    ws.onerror = (error) => {
      if (isUnmountedRef.current) return;
      console.error(`❌ WebSocket error:`, error);
      setConnectionStatus('failed');
    };

    ws.onclose = (event) => {
      if (isUnmountedRef.current) return;
      console.log(`🔌 WebSocket closed (code: ${event.code})`);
      
      // Code 1000 = normal closure, 1006 = abnormal (network issue)
      if (event.code !== 1000 && event.code !== 1001) {
        reconnect();
      }
    };
  }, [symbols.join(','), reconnect]);

  // ─ 5. Main Effect ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!symbols.length) return;
    isUnmountedRef.current = false;

    seedPrices();
    connectWebSocket();

    return () => {
      isUnmountedRef.current = true;
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [symbols.join(','), seedPrices, connectWebSocket]); // eslint-disable-line react-hooks/exhaustive-deps

  return { prices, connectionStatus };
}

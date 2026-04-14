import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useLivePrices
 * Opens one Binance combined-stream WebSocket for all requested symbols.
 * Returns { prices } where prices[symbol] = { price, change, flashing }.
 *
 * Flash behaviour:
 *   - price updates are throttled to once per second per symbol
 *   - a flash only triggers when the price *actually changes* AND at least
 *     3 seconds have passed since the last flash (prevents continuous blinking)
 *
 * @param {string[]} symbols  – e.g. ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'MATICUSDT']
 */
export default function useLivePrices(symbols = []) {
  const [prices, setPrices] = useState(() => {
    const init = {};
    symbols.forEach((s) => { init[s] = { price: null, change: null, flashing: null }; });
    return init;
  });

  const wsRef        = useRef(null);
  const seedsRef     = useRef({});  // baseline prices from REST (for 24 hr % change)
  const lastTickRef  = useRef({});  // throttle: last price-update ms per symbol (1 s gate)
  const lastFlashRef = useRef({});  // flash cooldown: last flash ms per symbol  (3 s gate)
  const lastPriceRef = useRef({});  // previous displayed price per symbol (detect real change)

  // ── 1. Seed with REST 24-hr ticker snapshot ──────────────────────────────
  const seedPrices = useCallback(async () => {
    try {
      const joined = symbols.map((s) => `"${s}"`).join(',');
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=[${joined}]`
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
    } catch (_) { /* silent fail – WS will fill in prices */ }
  }, [symbols.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Open combined WebSocket stream ────────────────────────────────────
  useEffect(() => {
    if (!symbols.length) return;

    seedPrices();

    const streams = symbols.map((s) => `${s.toLowerCase()}@trade`).join('/');
    const url     = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const ws      = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const envelope = JSON.parse(event.data);
        const trade    = envelope.data;
        if (!trade) return;

        const sym = trade.s;   // e.g. "BTCUSDT"
        const now = Date.now();

        // Gate 1: throttle price updates to once per second
        if (now - (lastTickRef.current[sym] || 0) < 1000) return;
        lastTickRef.current[sym] = now;

        const newPrice = parseFloat(trade.p);
        if (isNaN(newPrice)) return;

        // Gate 2: only flash when the price truly changed
        const prevPrice     = lastPriceRef.current[sym];
        const priceChanged  = prevPrice != null && newPrice !== prevPrice;

        // Gate 3: enforce a 3-second flash cooldown per symbol
        const flashReady    = now - (lastFlashRef.current[sym] || 0) >= 3000;
        const shouldFlash   = priceChanged && flashReady;

        const flashDir = shouldFlash
          ? (newPrice >= prevPrice ? 'up' : 'down')
          : null;

        if (shouldFlash) lastFlashRef.current[sym] = now;
        lastPriceRef.current[sym] = newPrice;

        // Compute running % change from REST baseline
        const baseline = seedsRef.current[sym] ?? newPrice;
        const change   = baseline ? ((newPrice - baseline) / baseline) * 100 : 0;

        setPrices((prev) => ({
          ...prev,
          [sym]: { price: newPrice, change, flashing: flashDir },
        }));

        // Auto-clear flash after CSS animation completes (900 ms)
        if (shouldFlash) {
          setTimeout(() => {
            setPrices((prev) => ({
              ...prev,
              [sym]: { ...prev[sym], flashing: null },
            }));
          }, 900);
        }
      } catch (_) { /* ignore malformed messages */ }
    };

    ws.onerror = () => ws.close();

    return () => { ws.close(); };
  }, [symbols.join(','), seedPrices]); // eslint-disable-line react-hooks/exhaustive-deps

  return { prices };
}

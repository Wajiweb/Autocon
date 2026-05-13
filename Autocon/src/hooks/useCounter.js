import { useState, useEffect, useRef } from 'react';

/**
 * useCounter — Phase 3 extraction from Dashboard.jsx
 *
 * Animates a numeric value from 0 → target using an eased RAF loop.
 *
 * react-component-performance fix:
 *   - Added `mountedRef` guard: if the component unmounts while the RAF loop
 *     is in flight (i.e., the setTimeout fired but animation isn't complete),
 *     the `requestAnimationFrame` callback no longer calls `setVal` on an
 *     unmounted component. This prevents the memory leak / stale state update.
 *   - `clearTimeout` in the cleanup function handles the pre-RAF timeout.
 *
 * react-patterns: extracted from Dashboard.jsx (module-level function inside
 * a page file) into its canonical location: src/hooks/useCounter.js
 */
export function useCounter(target, delay = 300) {
  const [val, setVal] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (target === 0) { setVal(0); return; }
      const dur = 700, start = performance.now();
      const tick = (now) => {
        if (!mountedRef.current) return; // ← RAF leak guard
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, delay]);

  return val;
}

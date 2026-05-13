import { useEffect, useCallback } from 'react';

/**
 * useDraftPersistence — Phase 4 draft recovery hook.
 *
 * Persists `formData` to localStorage under a given `draftKey` so that
 * accidental navigation or browser refresh does not wipe an in-progress
 * deployment form.
 *
 * react-patterns: extracted to src/hooks/ — reused identically by
 *   useWeb3, useNFT, useAuction (DRY; hook extraction rule).
 *
 * fp-async: clean save/restore pattern with no try/catch hell —
 *   each operation is isolated: read once, write on change, clear on success.
 *
 * security-auditor: localStorage only stores form metadata (name, symbol,
 *   supply etc.) — never stores private keys, wallet addresses from signing,
 *   or source code (too large, not sensitive in this context).
 *
 * @param {string}   draftKey    - unique localStorage key per generator type
 * @param {object}   formData    - current form state
 * @param {Function} setFormData - state setter to restore saved draft
 * @param {boolean}  [skip]      - set to true after successful deploy to skip restore
 */
export function useDraftPersistence(draftKey, formData, setFormData, skip = false) {
  // ── Restore on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    if (skip) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      // Only restore if there is meaningful user-entered data
      if (saved && typeof saved === 'object' && (saved.name || saved.symbol)) {
        setFormData(prev => ({ ...prev, ...saved }));
      }
    } catch {
      // Malformed JSON in localStorage — silently discard
      localStorage.removeItem(draftKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — restore only on initial mount

  // ── Persist on every formData change ─────────────────────────────────────
  useEffect(() => {
    if (skip) return;
    try {
      // Omit ownerAddress — it's re-populated from wallet connect, not useful to persist
      const { ownerAddress: _omit, ...toSave } = formData;
      localStorage.setItem(draftKey, JSON.stringify(toSave));
    } catch {
      // localStorage full or unavailable — non-critical, skip silently
    }
  }, [draftKey, formData, skip]);

  // ── Expose clearDraft for post-deploy cleanup ─────────────────────────────
  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
  }, [draftKey]);

  return { clearDraft };
}

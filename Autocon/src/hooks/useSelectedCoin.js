import { useState, useCallback } from 'react';

/**
 * useSelectedCoin
 * Tracks which asset card was tapped to open the ChartModal.
 * null  →  modal closed
 * object → modal open, object is the coin data shape
 */
export default function useSelectedCoin() {
  const [selectedCoin, setSelectedCoin] = useState(null);

  const openModal  = useCallback((coin) => setSelectedCoin(coin), []);
  const closeModal = useCallback(() => setSelectedCoin(null), []);

  return { selectedCoin, openModal, closeModal };
}

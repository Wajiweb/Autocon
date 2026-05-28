import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNetwork } from '../context/NetworkContext';

/**
 * useGasTracker — fetches live gas prices for the *currently selected network*.
 *
 * Re-fetches automatically whenever the user switches networks (Sepolia ↔ BNB Testnet etc.)
 *
 * Gas price strategy (EIP-1559 aware):
 *   - Use `maxPriorityFeePerGas` (the miner tip) as the primary display value.
 *   - Fall back to legacy `gasPrice` on non-EIP-1559 chains (e.g. BNB chain).
 *   - Avoid `maxFeePerGas` — that's only the theoretical ceiling, not the real cost.
 *
 * Thresholds are network-aware:
 *   BNB chain: fixed 1–3 Gwei normally, so tighter thresholds apply.
 *   ETH-based: 0.5–10 Gwei priority fee in 2024-2025.
 */
export function useGasTracker() {
  const { network } = useNetwork();

  const [gasPriceGwei, setGasPriceGwei] = useState(null);
  const [blockNumber, setBlockNumber]   = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [status, setStatus]             = useState('average');

  // Re-run the entire effect whenever the selected network changes
  useEffect(() => {
    let cancelled = false;
    let intervalId;
    setIsLoading(true);
    setGasPriceGwei(null);
    setBlockNumber(null);

    const isBNB = network?.key?.toLowerCase().includes('bnb');

    const fetchGasPrice = async () => {
      try {
        let provider;

        // ── Choose provider ──────────────────────────────────────────────
        // If MetaMask is on the same chain as our selected network, use it.
        // Otherwise (or if no MetaMask), use the network's own public RPC.
        let metaMaskChainId = null;
        if (window.ethereum) {
          try {
            metaMaskChainId = await window.ethereum.request({ method: 'eth_chainId' });
          } catch (_) {}
        }

        const metaMaskMatchesNetwork =
          metaMaskChainId &&
          network?.chainId &&
          metaMaskChainId.toLowerCase() === network.chainId.toLowerCase();

        if (metaMaskMatchesNetwork) {
          provider = new ethers.BrowserProvider(window.ethereum);
        } else {
          // Use the selected network's own public RPC endpoint directly
          provider = new ethers.JsonRpcProvider(network.rpcUrl);
        }

        const [feeData, blockNum] = await Promise.all([
          provider.getFeeData(),
          provider.getBlockNumber(),
        ]);

        if (cancelled) return;
        setBlockNumber(blockNum);

        // ── Select the right gas price field ────────────────────────────
        // BNB chain (BSC) is NOT EIP-1559 — it uses legacy gasPrice.
        // Ethereum / Sepolia is EIP-1559 — use maxPriorityFeePerGas (the tip).
        const priceWei = isBNB
          ? (feeData.gasPrice)                          // BSC: legacy fixed gas
          : (feeData.maxPriorityFeePerGas ?? feeData.gasPrice); // ETH: EIP-1559 tip

        if (!priceWei || cancelled) return;

        const gwei = Number(ethers.formatUnits(priceWei, 'gwei'));

        // Sanity clamp: if maxFeePerGas leaked through somehow, cap at 500
        const safeGwei = gwei > 500
          ? Number(ethers.formatUnits(feeData.gasPrice ?? priceWei, 'gwei'))
          : gwei;

        setGasPriceGwei(safeGwei);

        // ── Status thresholds (network-aware) ────────────────────────────
        if (isBNB) {
          // BSC Testnet: fixed 10 Gwei; Mainnet: 1–3 Gwei
          if (safeGwei < 3)       setStatus('cheap');
          else if (safeGwei > 8)  setStatus('expensive');
          else                    setStatus('average');
        } else {
          // ETH priority tip ranges (2024-2025)
          if (safeGwei < 2)       setStatus('cheap');
          else if (safeGwei > 10) setStatus('expensive');
          else                    setStatus('average');
        }
      } catch (err) {
        console.warn(`[GasTracker] ${network?.name ?? 'unknown'} fetch failed:`, err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchGasPrice();
    intervalId = setInterval(fetchGasPrice, 15_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [network?.key, network?.rpcUrl, network?.chainId]); // ← re-runs on network switch

  return { gasPriceGwei, status, isLoading, blockNumber };
}

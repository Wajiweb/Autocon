import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

/**
 * useGasTracker - Custom hook to fetch live network gas prices.
 * Polls the current network's RPC node every 15 seconds.
 */
export function useGasTracker() {
  const [gasPriceGwei, setGasPriceGwei] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('average'); // 'cheap', 'average', 'expensive'

  useEffect(() => {
    let intervalId;

    const fetchGasPrice = async () => {
      try {
        let provider;

        // 1. Try to use the user's injected Web3 provider (MetaMask) so it matches their current network
        if (window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
        } else {
            // 2. Fallback to a highly reliable public Ethereum Mainnet RPC so the widget still works beautifully
            provider = new ethers.JsonRpcProvider('https://cloudflare-eth.com');
        }

        const feeData = await provider.getFeeData();

        // Calculate current gas price (maxFeePerGas for EIP-1559, or fallback to gasPrice)
        const currentGasWei = feeData.maxFeePerGas || feeData.gasPrice;
        if (!currentGasWei) return;

        const gwei = Number(ethers.formatUnits(currentGasWei, 'gwei'));
        setGasPriceGwei(gwei);

        // Determine status thresholds based on general network feel
        if (gwei < 15) {
          setStatus('cheap');
        } else if (gwei > 40) {
          setStatus('expensive');
        } else {
          setStatus('average');
        }

      } catch (error) {
        console.error("Error fetching gas price:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchGasPrice();

    // Poll every 15 seconds
    intervalId = setInterval(fetchGasPrice, 15000);

    return () => clearInterval(intervalId);
  }, []); // Remove network dependency so it just uses the global provider

  return { gasPriceGwei, status, isLoading };
}

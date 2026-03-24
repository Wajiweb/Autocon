import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

/**
 * useLiveEvents - Custom hook to securely listen to multiple smart contracts via WebSocket.
 * @param {Array} deployedContracts - Array of { contractAddress, abi } objects.
 */
export function useLiveEvents(deployedContracts = []) {
  const [latestEvents, setLatestEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Keep contracts references stable for cleanup
  const contractsRef = useRef([]);

  const connectAndListen = useCallback(() => {
    if (!deployedContracts || deployedContracts.length === 0) return;

    let provider;
    try {
      // Use fallback public WSS if no custom env is provided (good for FYP demo)
      const wssUrl = import.meta.env.VITE_SEPOLIA_WSS_URL || 'wss://ethereum-sepolia-rpc.publicnode.com';
      provider = new ethers.WebSocketProvider(wssUrl);

      // Handle raw connection events
      provider.websocket.onopen = () => setIsConnected(true);
      provider.websocket.onclose = () => setIsConnected(false);
      provider.websocket.onerror = () => setIsConnected(false);

      // Instantiate Ethers Contract interfaces and attach listeners
      contractsRef.current = deployedContracts.map(c => {
        if (!c.contractAddress || !c.abi) return null;
        
        try {
          const parsedAbi = typeof c.abi === 'string' ? JSON.parse(c.abi) : c.abi;
          const contract = new ethers.Contract(c.contractAddress, parsedAbi, provider);
          
          // Ethers v6 global wildcard listener
          contract.on('*', (eventPayload) => {
            // Unpack Ethers v6 * listener generic payload
            const eventName = eventPayload.eventName || eventPayload.fragment?.name || 'UnknownEvent';
            const log = eventPayload.log || eventPayload;
            const args = eventPayload.args || {};

            // Extract standard parameters safely
            const from = args.from || args.sender || args[0] || '';
            const to = args.to || args.recipient || args[1] || '';
            
            // Format generic amount for display
            let amount = null;
            const rawValue = args.value || args.amount || args.tokenId || args[2];
            if (rawValue !== undefined && typeof rawValue === 'bigint') {
              amount = ethers.formatEther(rawValue); // Assume 18 decimals by default for demo
              // Cut long decimals off
              if (amount.includes('.')) amount = parseFloat(amount).toFixed(4).replace(/\.0000$/, '');
            } else if (rawValue !== undefined) {
              amount = String(rawValue);
            }

            const formatEvent = {
              id: log.transactionHash,
              type: eventName,
              from,
              to,
              amount,
              timestamp: Date.now(),
              address: c.contractAddress
            };

            // Add new event to top, slice to max 10
            setLatestEvents(prev => [formatEvent, ...prev].slice(0, 10));
          });
          
          return contract;
        } catch (e) {
          console.error("Failed to bind contract listener:", e);
          return null;
        }
      }).filter(Boolean);

    } catch (err) {
      console.error("WSS Connection error:", err);
      setIsConnected(false);
    }

    // Cleanup logic
    return () => {
      contractsRef.current.forEach(contract => {
        if (contract) contract.removeAllListeners();
      });
      if (provider) {
        try { provider.destroy(); } catch (e) { /* ignore */ }
      }
      setIsConnected(false);
    };
  }, [deployedContracts]);

  // Handle Mount / Reconnect Logic
  useEffect(() => {
    const cleanup = connectAndListen();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connectAndListen]);

  return { latestEvents, isConnected };
}

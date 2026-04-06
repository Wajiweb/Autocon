/**
 * useQuickActions — executes ABI write functions and estimates gas.
 */
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

export function useQuickActions(contractAddress, abi) {
  const [txResults, setTxResults] = useState({}); // { fnName: { status, hash, error } }

  const execute = useCallback(async (fnName, args) => {
    setTxResults(prev => ({ ...prev, [fnName]: { status: 'pending' } }));
    try {
      if (!window.ethereum) throw new Error('MetaMask is not installed.');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx      = await contract[fnName](...args);
      const receipt = await tx.wait();

      setTxResults(prev => ({
        ...prev,
        [fnName]: { status: 'success', hash: receipt.hash }
      }));
    } catch (err) {
      setTxResults(prev => ({
        ...prev,
        [fnName]: {
          status: 'error',
          error:  err.reason ?? err.shortMessage ?? err.message ?? 'Transaction failed.'
        }
      }));
    }
  }, [contractAddress, abi]);

  const estimateGas = useCallback(async (fnName, args) => {
    try {
      if (!window.ethereum) return null;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const gas      = await contract[fnName].estimateGas(...args);
      return gas.toString();
    } catch {
      return null;
    }
  }, [contractAddress, abi]);

  return { txResults, execute, estimateGas };
}

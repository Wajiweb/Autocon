import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Shared wallet connection hook — eliminates duplicated connectWallet
 * logic across useWeb3, useNFT, and useAuction.
 */
export const useWallet = () => {
    const [walletAddress, setWalletAddress] = useState('');

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            toast.error('Please install MetaMask!');
            return null;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWalletAddress(accounts[0]);
            toast.success('MetaMask Connected!');
            return accounts[0];
        } catch (err) {
            toast.error('Wallet connection failed.');
            return null;
        }
    }, []);

    return { walletAddress, setWalletAddress, connectWallet };
};

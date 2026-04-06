import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Shared wallet connection hook — eliminates duplicated connectWallet
 * logic across useWeb3, useNFT, and useAuction.
 * Also listens for wallet account changes from MetaMask.
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
        } catch (_err) {
            toast.error('Wallet connection failed.');
            return null;
        }
    }, []);

    // Listen for MetaMask account changes / disconnects
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                setWalletAddress('');
                toast.error('Wallet disconnected.');
            } else {
                const newAddress = accounts[0];
                setWalletAddress(newAddress);
                toast(`Wallet switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`);
            }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, []);

    return { walletAddress, setWalletAddress, connectWallet };
};


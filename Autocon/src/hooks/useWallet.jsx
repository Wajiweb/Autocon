import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
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

        // Automatically fetch already connected account on page load
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                }
            })
            .catch(console.error);

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

    return (
        <WalletContext.Provider value={{ walletAddress, setWalletAddress, connectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        console.warn('useWallet must be used within a WalletProvider');
        return { walletAddress: '', setWalletAddress: () => {}, connectWallet: async () => null };
    }
    return context;
};


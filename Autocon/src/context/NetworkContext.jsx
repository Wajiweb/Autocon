import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   NETWORK REGISTRY — all supported networks
═══════════════════════════════════════════════════════════ */
export const NETWORKS = {
    sepolia: {
        key:            'sepolia',
        name:           'Sepolia',
        chainId:        '0xaa36a7',
        chainIdDecimal: 11155111,
        rpcUrl:         'https://rpc.sepolia.org',
        explorer:       'https://sepolia.etherscan.io',
        currency:       'ETH',
        currencySymbol: 'ETH',
        icon:           '🔵',
        color:          '#6366f1',
        faucet:         'https://sepoliafaucet.com',
        layer:          'L1 Testnet',
    },
    amoy: {
        key:            'amoy',
        name:           'Polygon Amoy',
        chainId:        '0x13882',
        chainIdDecimal: 80002,
        rpcUrl:         'https://rpc-amoy.polygon.technology',
        explorer:       'https://amoy.polygonscan.com',
        currency:       'MATIC',
        currencySymbol: 'MATIC',
        icon:           '🟣',
        color:          '#8b5cf6',
        faucet:         'https://faucet.polygon.technology',
        layer:          'L2 Testnet',
    },
    bnbTestnet: {
        key:            'bnbTestnet',
        name:           'BNB Testnet',
        chainId:        '0x61',
        chainIdDecimal: 97,
        rpcUrl:         'https://data-seed-prebsc-1-s1.binance.org:8545',
        explorer:       'https://testnet.bscscan.com',
        currency:       'tBNB',
        currencySymbol: 'tBNB',
        icon:           '🟡',
        color:          '#f3ba2f',
        faucet:         'https://testnet.bnbchain.org/faucet-smart',
        layer:          'L1 Testnet',
    },
};

/* ── Helpers ──────────────────────────────────────────── */
const STORAGE_KEY = 'autocon_selected_network';

/** Given a MetaMask chainId hex string, return matching NETWORKS key or null */
function keyFromChainId(hexChainId) {
    const id = hexChainId?.toLowerCase();
    return Object.keys(NETWORKS).find(k => NETWORKS[k].chainId.toLowerCase() === id) ?? null;
}

/* ═══════════════════════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════════════════════ */
const NetworkContext = createContext();

export function NetworkProvider({ children }) {
    /* ── Initial state: prefer MetaMask's real chain → localStorage → sepolia ── */
    const [selectedNetwork, setSelectedNetworkState] = useState(() => {
        // Try to read MetaMask's current chain synchronously via cached value
        const saved = localStorage.getItem(STORAGE_KEY);
        return (saved && NETWORKS[saved]) ? saved : 'sepolia';
    });

    const network = NETWORKS[selectedNetwork];

    /* ── Sync from MetaMask on first mount ──────────────────
       After mount we can do async calls to read the live chain. */
    useEffect(() => {
        if (!window.ethereum) return;

        const syncFromMetaMask = async () => {
            try {
                const hexChain = await window.ethereum.request({ method: 'eth_chainId' });
                const key = keyFromChainId(hexChain);
                if (key && key !== selectedNetwork) {
                    setSelectedNetworkState(key);
                    localStorage.setItem(STORAGE_KEY, key);
                }
            } catch (_) {}
        };

        syncFromMetaMask();

        /* ── Listen for MetaMask chain changes (user switches in extension) ── */
        const onChainChanged = (hexChain) => {
            const key = keyFromChainId(hexChain);
            if (key) {
                // Known network — sync app state
                setSelectedNetworkState(key);
                localStorage.setItem(STORAGE_KEY, key);
            } else {
                // Unknown network — keep app state but warn in console
                console.warn('[NetworkContext] Connected to unsupported chain:', hexChain);
            }
        };

        window.ethereum.on('chainChanged', onChainChanged);
        return () => window.ethereum.removeListener('chainChanged', onChainChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── switchNetwork — called by UI, pushes to MetaMask ── */
    const switchNetwork = useCallback(async (networkKey) => {
        if (!NETWORKS[networkKey]) return;

        // Optimistic update for instant UI responsiveness
        setSelectedNetworkState(networkKey);
        localStorage.setItem(STORAGE_KEY, networkKey);

        if (!window.ethereum) return; // no wallet — just update UI label

        const target = NETWORKS[networkKey];
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: target.chainId }],
            });
            // chainChanged event will fire and confirm the state
        } catch (switchError) {
            if (switchError.code === 4902) {
                // Chain not added to MetaMask yet — add it automatically
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId:           target.chainId,
                            chainName:         target.name,
                            rpcUrls:           [target.rpcUrl],
                            blockExplorerUrls: [target.explorer],
                            nativeCurrency: {
                                name:     target.currency,
                                symbol:   target.currencySymbol,
                                decimals: 18,
                            },
                        }],
                    });
                    // After add, MetaMask auto-switches and fires chainChanged
                } catch (addError) {
                    console.error('[NetworkContext] Failed to add network:', addError);
                    // Revert optimistic update — MetaMask rejected the add
                    const prev = localStorage.getItem(STORAGE_KEY) || 'sepolia';
                    setSelectedNetworkState(prev);
                    localStorage.setItem(STORAGE_KEY, prev);
                }
            } else if (switchError.code === 4001) {
                // User rejected switch in MetaMask — revert optimistic update
                try {
                    const hexChain = await window.ethereum.request({ method: 'eth_chainId' });
                    const key = keyFromChainId(hexChain) || 'sepolia';
                    setSelectedNetworkState(key);
                    localStorage.setItem(STORAGE_KEY, key);
                } catch (_) {}
            }
        }
    }, []);

    return (
        <NetworkContext.Provider value={{
            selectedNetwork,
            setSelectedNetwork: switchNetwork,
            network,
            networks: NETWORKS,
            allNetworkKeys: Object.keys(NETWORKS),
        }}>
            {children}
        </NetworkContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNetwork = () => useContext(NetworkContext);

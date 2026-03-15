import { createContext, useContext, useState } from 'react';

const NETWORKS = {
    sepolia: {
        name: 'Sepolia',
        chainId: '0xaa36a7',
        chainIdDecimal: 11155111,
        rpcUrl: 'https://rpc.sepolia.org',
        explorer: 'https://sepolia.etherscan.io',
        currency: 'ETH',
        icon: '🔵',
        color: '#6366f1'
    },
    goerli: {
        name: 'Goerli',
        chainId: '0x5',
        chainIdDecimal: 5,
        rpcUrl: 'https://rpc.ankr.com/eth_goerli',
        explorer: 'https://goerli.etherscan.io',
        currency: 'ETH',
        icon: '🟡',
        color: '#eab308'
    },
    mumbai: {
        name: 'Polygon Mumbai',
        chainId: '0x13881',
        chainIdDecimal: 80001,
        rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
        explorer: 'https://mumbai.polygonscan.com',
        currency: 'MATIC',
        icon: '🟣',
        color: '#8b5cf6'
    },
    amoy: {
        name: 'Polygon Amoy',
        chainId: '0x13882',
        chainIdDecimal: 80002,
        rpcUrl: 'https://rpc-amoy.polygon.technology',
        explorer: 'https://amoy.polygonscan.com',
        currency: 'MATIC',
        icon: '🟣',
        color: '#8b5cf6'
    }
};

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
    const [selectedNetwork, setSelectedNetwork] = useState('sepolia');

    const network = NETWORKS[selectedNetwork];

    const switchNetwork = async (networkKey) => {
        if (!NETWORKS[networkKey]) return;

        setSelectedNetwork(networkKey);

        // Try to switch MetaMask's network
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: NETWORKS[networkKey].chainId }],
                });
            } catch (switchError) {
                // If the chain hasn't been added to MetaMask
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: NETWORKS[networkKey].chainId,
                                chainName: NETWORKS[networkKey].name,
                                rpcUrls: [NETWORKS[networkKey].rpcUrl],
                                blockExplorerUrls: [NETWORKS[networkKey].explorer],
                                nativeCurrency: {
                                    name: NETWORKS[networkKey].currency,
                                    symbol: NETWORKS[networkKey].currency,
                                    decimals: 18
                                }
                            }],
                        });
                    } catch (addError) {
                        console.error('Failed to add network:', addError);
                    }
                }
            }
        }
    };

    return (
        <NetworkContext.Provider value={{
            selectedNetwork, setSelectedNetwork: switchNetwork,
            network, networks: NETWORKS, allNetworkKeys: Object.keys(NETWORKS)
        }}>
            {children}
        </NetworkContext.Provider>
    );
}

export const useNetwork = () => useContext(NetworkContext);

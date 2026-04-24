'use strict';
const { ethers } = require('ethers');

// Base public RPCs as fallback
const PUBLIC_RPCS = {
    sepolia: 'https://ethereum-sepolia-rpc.publicnode.com',
    amoy: 'https://rpc-amoy.polygon.technology',
    bnbTestnet: 'https://data-seed-prebsc-1-s1.binance.org:8545'
};

/**
 * Returns a robust ethers provider, preferring premium API keys if available.
 * Uses FallbackProvider if multiple endpoints are available to ensure high uptime.
 * 
 * @param {string} networkKey 
 * @returns {ethers.Provider}
 */
function getResilientProvider(networkKey = 'sepolia') {
    const providers = [];

    // 1. Infura (Highest Priority if configured)
    if (process.env.INFURA_API_KEY) {
        let networkName = networkKey;
        if (networkKey === 'amoy') networkName = 'maticmum'; // Infura legacy naming
        try {
            providers.push(new ethers.InfuraProvider(networkName, process.env.INFURA_API_KEY));
        } catch (e) { /* ignore unsupported network for Infura */ }
    }

    // 2. Alchemy
    if (process.env.ALCHEMY_API_KEY) {
        let networkName = networkKey;
        if (networkKey === 'amoy') networkName = 'maticmum';
        try {
            providers.push(new ethers.AlchemyProvider(networkName, process.env.ALCHEMY_API_KEY));
        } catch (e) { /* ignore */ }
    }

    // 3. Fallback to ENV-provided custom RPC or Public RPC
    const customEnvRpc = process.env[`${networkKey.toUpperCase()}_RPC_URL`];
    const publicRpc = customEnvRpc || PUBLIC_RPCS[networkKey] || PUBLIC_RPCS.sepolia;
    providers.push(new ethers.JsonRpcProvider(publicRpc));

    // If we only have 1 provider, return it directly
    if (providers.length === 1) {
        return providers[0];
    }

    // Return a FallbackProvider for automatic failover
    return new ethers.FallbackProvider(
        providers.map((p, index) => ({
            provider: p,
            priority: index, // Lower index = higher priority
            stallTimeout: 1500
        }))
    );
}

module.exports = { getResilientProvider };

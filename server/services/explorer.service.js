'use strict';

const EXPLORERS = {
    sepolia: {
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io',
        apiUrl: 'https://api-sepolia.etherscan.io/api'
    },
    amoy: {
        name: 'Polygonscan',
        url: 'https://amoy.polygonscan.com',
        apiUrl: 'https://api-amoy.polygonscan.com/api'
    },
    bnbTestnet: {
        name: 'BscScan',
        url: 'https://testnet.bscscan.com',
        apiUrl: 'https://api-testnet.bscscan.com/api'
    }
};

/**
 * Returns block explorer details for a given network.
 * @param {string} networkKey 
 * @returns {Object} { name, url, apiUrl }
 */
function getExplorerConfig(networkKey) {
    return EXPLORERS[networkKey] || EXPLORERS.sepolia;
}

/**
 * Constructs a block explorer URL for a contract address.
 */
function getContractUrl(networkKey, address) {
    const config = getExplorerConfig(networkKey);
    return `${config.url}/address/${address}`;
}

/**
 * Constructs a block explorer URL for a transaction hash.
 */
function getTxUrl(networkKey, txHash) {
    const config = getExplorerConfig(networkKey);
    return `${config.url}/tx/${txHash}`;
}

module.exports = { getExplorerConfig, getContractUrl, getTxUrl };

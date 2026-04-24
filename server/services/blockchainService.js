'use strict';
const { ethers } = require('ethers');
const { AppError } = require('../middleware/errorHandler');

const RPC_URLS = {
    sepolia:    process.env.SEPOLIA_RPC_URL    || 'https://ethereum-sepolia-rpc.publicnode.com',
    amoy:       process.env.AMOY_RPC_URL       || 'https://rpc-amoy.polygon.technology',
    bnbTestnet: process.env.BNB_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
};

// Fallback RPC endpoints for redundancy
const FALLBACK_RPC_URLS = {
    sepolia: [
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://rpc.sepolia.org',
        'https://eth-sepolia.g.alchemy.com/v2/demo'
    ],
    amoy: [
        'https://rpc-amoy.polygon.technology',
        'https://polygon-amoy-rpc.g.alchemy.com/v2/demo'
    ],
    bnbTestnet: [
        'https://data-seed-prebsc-1-s1.binance.org:8545',
        'https://bsc-testnet-rpc.publicnode.com'
    ]
};

let currentRpcIndex = {};

/**
 * Returns an ethers JsonRpcProvider for the given network key with automatic fallback.
 * @param {string} networkKey - 'sepolia' | 'amoy' | 'bnbTestnet'
 * @returns {ethers.JsonRpcProvider}
 */
function getProvider(networkKey = 'sepolia') {
    const rpcUrl = RPC_URLS[networkKey] || RPC_URLS.sepolia;
    return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Tries multiple RPC endpoints with fallback on failure.
 * @param {string} networkKey - Network key
 * @param {Function} fn - Async function to execute with provider
 * @returns {Promise<any>}
 */
async function withRpcFallback(networkKey, fn) {
    const fallbacks = [RPC_URLS[networkKey], ...(FALLBACK_RPC_URLS[networkKey] || [])];
    let lastError = null;
    
    for (const rpcUrl of fallbacks) {
        try {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            return await fn(provider);
        } catch (error) {
            console.warn(`[BlockchainService] RPC ${rpcUrl} failed:`, error.message);
            lastError = error;
        }
    }
    
    throw new AppError('All RPC endpoints failed. Network may be experiencing issues.', 502, 'RPC_ALL_FAILED');
}

/**
 * Estimates gas cost for deploying a contract.
 *
 * @param {object} params
 * @param {Array}  params.abi
 * @param {string} params.bytecode
 * @param {string} params.ownerAddress
 * @param {Array}  [params.constructorArgs]
 * @param {string} [params.supply]          - Legacy ERC-20 param
 * @param {string} [params.network]
 * @returns {{ gasUnits, gasPriceGwei, estimatedCostETH }}
 */
async function estimateGas({ abi, bytecode, ownerAddress, constructorArgs, supply, network }) {
    const provider = getProvider(network || 'sepolia');

    let args;
    if (Array.isArray(constructorArgs) && constructorArgs.length > 0) {
        args = constructorArgs;
    } else if (supply) {
        args = [ownerAddress, supply];
    } else {
        args = [];
    }

    const factory   = new ethers.ContractFactory(abi, bytecode);
    const deployTx  = await factory.getDeployTransaction(...args);
    const gasUnits  = await provider.estimateGas({ ...deployTx, from: ownerAddress });
    const feeData   = await provider.getFeeData();
    const gasPrice  = feeData.gasPrice;

    const totalCostWei = gasUnits * gasPrice;
    const totalCostETH = ethers.formatEther(totalCostWei);
    const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');

    return {
        gasUnits:         gasUnits.toString(),
        gasPriceGwei:     parseFloat(gasPriceGwei).toFixed(2),
        estimatedCostETH: parseFloat(totalCostETH).toFixed(6),
        estimatedCostUSD: null,
    };
}

/**
 * Validates that a string is a valid Ethereum address.
 * @param {string} address
 * @returns {boolean}
 */
function isValidAddress(address) {
    return ethers.isAddress(address);
}

module.exports = { estimateGas, getProvider, isValidAddress };

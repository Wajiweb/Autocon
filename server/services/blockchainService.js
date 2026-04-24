'use strict';
const { ethers } = require('ethers');

const RPC_URLS = {
    sepolia:    process.env.SEPOLIA_RPC_URL    || 'https://ethereum-sepolia-rpc.publicnode.com',
    amoy:       process.env.AMOY_RPC_URL       || 'https://rpc-amoy.polygon.technology',
    bnbTestnet: process.env.BNB_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
};

/**
 * Returns an ethers JsonRpcProvider for the given network key.
 * @param {string} networkKey - 'sepolia' | 'amoy' | 'bnbTestnet'
 * @returns {ethers.JsonRpcProvider}
 */
function getProvider(networkKey = 'sepolia') {
    const rpcUrl = RPC_URLS[networkKey] || RPC_URLS.sepolia;
    return new ethers.JsonRpcProvider(rpcUrl);
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

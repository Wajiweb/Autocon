const express = require('express');
const { ethers } = require('ethers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

/**
 * POST /api/estimate-gas
 * Estimates the gas cost for deploying any contract.
 * Body: { abi, bytecode, ownerAddress, constructorArgs?, supply? }
 * 
 * - `constructorArgs` (array): direct constructor arguments for NFT/Auction contracts
 * - `supply` (string): legacy support for ERC-20 tokens (used as [ownerAddress, supply])
 */
router.post('/estimate-gas', authMiddleware, async (req, res) => {
    try {
        const { abi, bytecode, ownerAddress, constructorArgs, supply } = req.body;

        if (!abi || !bytecode || !ownerAddress) {
            return res.status(400).json({
                success: false,
                error: 'abi, bytecode, and ownerAddress are required.'
            });
        }

        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

        // Determine constructor arguments
        // If constructorArgs is provided, use it directly (for NFT/Auction)
        // Otherwise, fall back to [ownerAddress, supply] (for ERC-20)
        let args;
        if (Array.isArray(constructorArgs) && constructorArgs.length > 0) {
            args = constructorArgs;
        } else if (supply) {
            args = [ownerAddress, supply];
        } else {
            args = [];
        }

        const factory = new ethers.ContractFactory(abi, bytecode);
        const deployTx = await factory.getDeployTransaction(...args);

        // Estimate gas units needed
        const gasEstimate = await provider.estimateGas({
            ...deployTx,
            from: ownerAddress
        });

        // Get current gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice;

        // Calculate total cost in ETH
        const totalCostWei = gasEstimate * gasPrice;
        const totalCostETH = ethers.formatEther(totalCostWei);
        const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');

        res.json({
            success: true,
            gasUnits: gasEstimate.toString(),
            gasPriceGwei: parseFloat(gasPriceGwei).toFixed(2),
            estimatedCostETH: parseFloat(totalCostETH).toFixed(6),
            estimatedCostUSD: null
        });

    } catch (error) {
        console.error('Gas Estimation Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to estimate gas. The RPC might be unavailable.',
            details: error.message
        });
    }
});

module.exports = router;

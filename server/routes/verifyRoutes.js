const express = require('express');
const axios = require('axios');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Etherscan V2 Unified API — Chain ID map
 * One API key works across ALL these networks.
 * Source: https://docs.etherscan.io/etherscan-v2
 */
const NETWORK_CHAIN_IDS = {
    'sepolia':       11155111,
    'mainnet':       1,
    'polygon amoy':  80002,
    'amoy':          80002,
    'bnb testnet':   97,
    'bnbtestnet':    97,
    'bsc testnet':   97,
};

/**
 * POST /api/verify
 * Verifies a deployed smart contract using Etherscan V2 unified API.
 * Supports: Sepolia, Mainnet, Polygon Amoy, BNB Testnet — all with ONE API key.
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { contractAddress, sourceCode, contractName, compilerVersion, network, constructorArguements } = req.body;

        if (!contractAddress || !sourceCode || !contractName || !compilerVersion || !network) {
            return res.status(400).json({ success: false, error: 'Missing required parameters for verification.' });
        }

        const apiKey = process.env.ETHERSCAN_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'Etherscan API key not configured on server.' });
        }

        // Resolve the chain ID for the requested network
        const chainId = NETWORK_CHAIN_IDS[network.toLowerCase()];
        if (!chainId) {
            return res.status(400).json({
                success: false,
                error: `Unsupported network for verification: "${network}". Supported: Sepolia, Mainnet, Polygon Amoy, BNB Testnet.`
            });
        }

        // Etherscan V2 unified endpoint — use chainid param instead of per-chain subdomain
        const apiUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}`;

        const params = new URLSearchParams();
        params.append('apikey',          apiKey);
        params.append('module',          'contract');
        params.append('action',          'verifysourcecode');
        params.append('contractaddress', contractAddress);
        params.append('sourceCode',      sourceCode);
        params.append('codeformat',      'solidity-single-file');
        params.append('contractname',    contractName);
        params.append('compilerversion', compilerVersion);
        params.append('optimizationUsed', '1');  // AutoCon compiles with optimization
        params.append('runs',            '200');

        if (constructorArguements) {
            // Etherscan expects ABI-encoded args WITHOUT the '0x' prefix
            const cleanArgs = constructorArguements.startsWith('0x')
                ? constructorArguements.slice(2)
                : constructorArguements;
            params.append('constructorArguements', cleanArgs);
        }

        // Submit verification to Etherscan V2
        const response = await axios.post(apiUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data.status !== '1') {
            return res.status(400).json({
                success: false,
                error: response.data.result || 'Etherscan verification submission failed.'
            });
        }

        const guid = response.data.result;

        res.json({
            success: true,
            message: `Verification request submitted to Etherscan (chainId: ${chainId}) successfully.`,
            guid,
            network,
            chainId
        });

    } catch (error) {
        console.error('❌ Etherscan V2 Verification Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Internal server error during verification.' });
    }
});

module.exports = router;

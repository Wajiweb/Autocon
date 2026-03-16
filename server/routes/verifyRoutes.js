const express = require('express');
const axios = require('axios');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/verify
 * Verifies a deployed smart contract on Etherscan.
 */
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { contractAddress, sourceCode, contractName, compilerVersion, network, constructorArguements } = req.body;

        if (!contractAddress || !sourceCode || !contractName || !compilerVersion || !network) {
            return res.status(400).json({ success: false, error: 'Missing required parameters for verification.' });
        }

        // Determine Etherscan API URL based on network
        let apiUrl = '';
        if (network.toLowerCase() === 'sepolia') {
            apiUrl = 'https://api-sepolia.etherscan.io/api';
        } else if (network.toLowerCase() === 'mainnet') {
            apiUrl = 'https://api.etherscan.io/api';
        } else {
            return res.status(400).json({ success: false, error: 'Unsupported network for verification.' });
        }

        const apiKey = process.env.ETHERSCAN_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'Etherscan API key not configured on server.' });
        }

        // Clean up source code (Etherscan expects raw string for single files)
        // AutoCon templates are mostly single-file or flattened already.
        
        const params = new URLSearchParams();
        params.append('apikey', apiKey);
        params.append('module', 'contract');
        params.append('action', 'verifysourcecode');
        params.append('contractaddress', contractAddress);
        params.append('sourceCode', sourceCode);
        params.append('codeformat', 'solidity-single-file');
        params.append('contractname', contractName);
        params.append('compilerversion', compilerVersion);
        params.append('optimizationUsed', '1'); // Solc compiles with optimization enabled in AutoCon
        params.append('runs', '200');

        if (constructorArguements) {
            // Etherscan expects ABI-encoded constructor arguments WITHOUT the '0x' prefix
            const cleanArgs = constructorArguements.startsWith('0x') ? constructorArguements.slice(2) : constructorArguements;
            params.append('constructorArguements', cleanArgs);
        }

        // 1. Submit Verification Request
        const response = await axios.post(apiUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.status !== '1') {
            return res.status(400).json({ 
                success: false, 
                error: response.data.result || 'Etherscan verification submission failed.' 
            });
        }

        const guid = response.data.result;

        // Note: Polling for exact status can take up to 30 seconds. 
        // We will return the GUID to the frontend so it can poll or just trust the submission.
        res.json({
            success: true,
            message: 'Verification request submitted to Etherscan successfully.',
            guid: guid,
            network: network
        });

    } catch (error) {
        console.error('❌ Etherscan Verification Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Internal server error during verification.' });
    }
});

module.exports = router;

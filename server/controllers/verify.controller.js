'use strict';

/**
 * verify.controller.js
 *
 * Handles Etherscan V2 contract verification.
 * Previously inlined directly inside verifyRoutes.js — now a proper controller.
 *
 * Etherscan V2 Unified API: one API key works across all supported chains
 * via the `chainid` query parameter.
 * Reference: https://docs.etherscan.io/etherscan-v2
 */

const axios        = require('axios');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// ─── Constants ─────────────────────────────────────────────────────────────
const MAX_SOURCE_CODE_SIZE = 100 * 1024; // 100KB max source code
const NETWORK_CHAIN_IDS = {
    'sepolia':       11155111,
    'mainnet':       1,
    'polygon amoy':  80002,
    'amoy':          80002,
    'bnb testnet':   97,
    'bnbtestnet':    97,
    'bsc testnet':   97,
};

const SUPPORTED_NETWORKS = Object.keys(NETWORK_CHAIN_IDS).join(', ');

/**
 * POST /api/verify
 * Submits a source-code verification request to Etherscan V2.
 *
 * Body (validated by Joi schema `verifyContract`):
 *   contractAddress, sourceCode, contractName, compilerVersion, network, constructorArguements?
 *
 * Response:
 *   { success: true, data: { guid, network, chainId, message } }
 */
const submitVerification = asyncHandler(async (req, res) => {
    const {
        contractAddress, sourceCode, contractName,
        compilerVersion, network, constructorArguements,
    } = req.body;

    // Validate input sizes
    if (sourceCode && sourceCode.length > MAX_SOURCE_CODE_SIZE) {
        throw new AppError(`Source code too large. Maximum ${MAX_SOURCE_CODE_SIZE / 1024}KB allowed.`, 400, 'SOURCE_TOO_LARGE');
    }

    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
        throw new AppError('Etherscan API key not configured on server.', 500, 'CONFIG_ERROR');
    }

    const chainId = NETWORK_CHAIN_IDS[network.toLowerCase()];
    if (!chainId) {
        throw new AppError(
            `Unsupported network: "${network}". Supported: ${SUPPORTED_NETWORKS}`,
            400, 'UNSUPPORTED_NETWORK'
        );
    }

    const apiUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}`;

    const params = new URLSearchParams();
    params.append('apikey',           apiKey);
    params.append('module',           'contract');
    params.append('action',           'verifysourcecode');
    params.append('contractaddress',  contractAddress);
    params.append('sourceCode',       sourceCode);
    params.append('codeformat',       'solidity-single-file');
    params.append('contractname',     contractName);
    params.append('compilerversion',  compilerVersion);
    params.append('optimizationUsed', '1');
    params.append('runs',             '200');

    if (constructorArguements) {
        const cleanArgs = constructorArguements.startsWith('0x')
            ? constructorArguements.slice(2)
            : constructorArguements;
        params.append('constructorArguements', cleanArgs);
    }

    const response = await axios.post(apiUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data.status !== '1') {
        throw new AppError(
            response.data.result || 'Etherscan verification submission failed.',
            400, 'VERIFICATION_FAILED'
        );
    }

    const guid = response.data.result;

    return res.json({
        success: true,
        data: {
            guid,
            network,
            chainId,
            message: `Verification submitted to Etherscan (chainId: ${chainId}).`,
        },
    });
});

/**
 * GET /api/verify/status/:network/:guid
 * Polls the status of a pending verification on Etherscan V2.
 *
 * Response:
 *   { success: true, data: { status, isPending, isVerified } }
 */
const checkVerificationStatus = asyncHandler(async (req, res) => {
    const { network, guid } = req.params;

    const apiKey = process.env.ETHERSCAN_API_KEY;
    const chainId = NETWORK_CHAIN_IDS[network.toLowerCase()];

    if (!chainId) {
        throw new AppError(`Unsupported network: "${network}".`, 400, 'UNSUPPORTED_NETWORK');
    }

    const apiUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}`;

    const response = await axios.get(apiUrl, {
        params: {
            apikey: apiKey,
            module: 'contract',
            action: 'checkverifystatus',
            guid,
        },
    });

    const statusMessage = response.data.result || '';
    const isPending  = statusMessage.includes('Pending in queue');
    const isVerified = statusMessage.includes('Pass - Verified') || statusMessage.includes('Already Verified');

    return res.json({
        success: true,
        data: { status: statusMessage, isPending, isVerified },
    });
});

module.exports = { submitVerification, checkVerificationStatus };

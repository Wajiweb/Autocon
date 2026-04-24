'use strict';
const { estimateGas, isValidAddress } = require('../services/blockchainService');

/** POST /api/estimate-gas */
async function estimateGasHandler(req, res) {
    try {
        const { abi, bytecode, ownerAddress, constructorArgs, supply, network } = req.body;

        if (!abi || !bytecode || !ownerAddress) {
            return res.status(400).json({ success: false, error: 'abi, bytecode, and ownerAddress are required.' });
        }
        if (!isValidAddress(ownerAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid owner address format.' });
        }

        const result = await estimateGas({ abi, bytecode, ownerAddress, constructorArgs, supply, network });
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('[GasController] estimateGas:', error.message);

        let errorMessage = 'Failed to estimate gas. Contract might revert or RPC is unavailable.';
        if (error.code === 'UNSUPPORTED_OPERATION' && error.operation === 'resolveName') {
            errorMessage = 'Invalid Ethereum address used in constructor arguments.';
        } else if (error.info?.error?.message) {
            errorMessage = 'Estimation reverted: ' + error.info.error.message;
        } else if (error.shortMessage) {
            errorMessage = error.shortMessage;
        }

        res.status(500).json({ success: false, error: errorMessage, details: error.message });
    }
}

module.exports = { estimateGasHandler };

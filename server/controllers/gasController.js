'use strict';
const { estimateGas, isValidAddress } = require('../services/blockchainService');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

/** POST /api/estimate-gas */
const estimateGasHandler = asyncHandler(async (req, res) => {
    const { abi, bytecode, ownerAddress, constructorArgs, supply, network } = req.body;

    if (!abi || !bytecode || !ownerAddress) {
        throw new AppError('abi, bytecode, and ownerAddress are required.', 400, 'BAD_REQUEST');
    }
    if (!isValidAddress(ownerAddress)) {
        throw new AppError('Invalid owner address format.', 400, 'INVALID_ADDRESS');
    }

    try {
        const result = await estimateGas({ abi, bytecode, ownerAddress, constructorArgs, supply, network });
        return res.json({ success: true, ...result });
    } catch (error) {
        let errorMessage = 'Failed to estimate gas. Contract might revert or RPC is unavailable.';
        if (error.code === 'UNSUPPORTED_OPERATION' && error.operation === 'resolveName') {
            errorMessage = 'Invalid Ethereum address used in constructor arguments.';
        } else if (error.info?.error?.message) {
            errorMessage = 'Estimation reverted: ' + error.info.error.message;
        } else if (error.shortMessage) {
            errorMessage = error.shortMessage;
        }

        throw new AppError(errorMessage, 500, 'GAS_ESTIMATION_FAILED', { details: error.message });
    }
});

module.exports = { estimateGasHandler };

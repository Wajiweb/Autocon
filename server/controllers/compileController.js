'use strict';
const { AppError } = require('../middleware/errorHandler');
const { enqueueCompileJobHelper } = require('./jobController');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/compile
 * Compiles an arbitrary Solidity string. Used when users manually edit code via Monaco.
 */
const compileCustomContract = asyncHandler(async (req, res) => {
    const { sourceCode, contractName } = req.body;
    const ownerAddress = req.user.walletAddress;

    if (!sourceCode || !contractName) {
        throw new AppError('sourceCode and contractName are required.', 400, 'BAD_REQUEST');
    }

    // Additional validation: reject empty or whitespace-only code
    const trimmedCode = sourceCode.trim();
    if (trimmedCode.length < 10) {
        throw new AppError('Contract code is too short or empty. Minimum 10 characters required.', 400, 'INVALID_CODE');
    }

    const jobId = await enqueueCompileJobHelper(sourceCode, contractName, ownerAddress);
    
    return res.status(202).json({
        success: true,
        data: {
            jobId,
            contractCode: sourceCode,
            contractName,
            sourceFile: 'CustomContract.sol'
        }
    });
});

module.exports = { compileCustomContract };

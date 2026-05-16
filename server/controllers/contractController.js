'use strict';

const mongoose = require('mongoose');
const Contract = require('../models/Contract');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/contracts/my-contracts/:walletAddress
 * Fetches all contracts (ERC20, ERC721, AUCTION) for a user in a single query.
 */
const getMyContracts = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (req.user.walletAddress !== walletAddress.toLowerCase()) {
        throw new AppError('You can only view your own contracts.', 403, 'FORBIDDEN');
    }

    const contracts = await Contract.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
    
    // To ensure legacy frontend support during migration without heavy refactor on UI components,
    // we return them under a single array, but the frontend usePlatformSync already expects an array
    // mapped properly. Let's just return the raw array.
    return res.json({ success: true, data: contracts });
});

/**
 * DELETE /api/contracts/delete/:id
 * Deletes a contract from the registry regardless of type.
 */
const deleteContract = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format.', 400, 'INVALID_ID');
    }

    const contract = await Contract.findById(id);
    if (!contract) throw new AppError('Contract not found.', 404, 'NOT_FOUND');
    if (req.user.walletAddress !== contract.ownerAddress.toLowerCase()) {
        throw new AppError('You can only delete your own contracts.', 403, 'FORBIDDEN');
    }

    await Contract.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Contract removed from registry.' });
});

module.exports = { getMyContracts, deleteContract };

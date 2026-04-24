'use strict';

/**
 * auctionController.js
 *
 * Handles English Auction contract generation, saving, retrieval, and deletion.
 * Uses asyncHandler for robust error management and delegates input
 * validation to Joi middleware.
 */

const mongoose     = require('mongoose');
const Auction      = require('../models/Auction');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { incrementDeployments } = require('../services/usageService');

/** POST /api/auction/generate */
const generateAuction = asyncHandler(async (req, res) => {
    const { name, itemName, itemDescription, duration, minimumBid, ownerAddress } = req.body;

    const safeName     = sanitize(name || '');

    const className  = toClassName(safeName, 'AuctionContract');
    let contractCode = readTemplate('EnglishAuctionTemplate.txt');
    const finalCode  = contractCode.replace(/{{CONTRACT_NAME}}/g, className);

    const { abi, bytecode } = compileContract(finalCode, 'Auction.sol', className);

    return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, contractName: className } });
});

/** POST /api/auction/save */
const saveAuction = asyncHandler(async (req, res) => {
    const { name, itemName, itemDescription, contractAddress, ownerAddress, network, duration, minimumBid } = req.body;

    if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
        throw new AppError('You can only save your own auctions.', 403, 'FORBIDDEN');
    }

    const newAuction = new Auction({
        name, itemName, itemDescription, contractAddress,
        ownerAddress: ownerAddress.toLowerCase(),
        network: network || 'Sepolia',
        duration, minimumBid,
    });
    await newAuction.save();

    incrementDeployments(req.user.userId); // Fire and forget

    return res.status(201).json({ success: true, message: 'Auction saved successfully!' });
});

/** GET /api/auction/my-auctions/:walletAddress */
const getMyAuctions = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (req.user.walletAddress !== walletAddress.toLowerCase()) {
        throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const auctions = await Auction.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
    return res.json({ success: true, data: { auctions } });
});

/** DELETE /api/auction/delete/:id */
const deleteAuction = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format.', 400, 'INVALID_ID');
    }

    const auction = await Auction.findById(id);
    if (!auction) throw new AppError('Not found.', 404, 'NOT_FOUND');
    if (req.user.walletAddress !== auction.ownerAddress.toLowerCase()) {
        throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    await Auction.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Auction removed.' });
});

module.exports = { generateAuction, saveAuction, getMyAuctions, deleteAuction };

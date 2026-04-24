'use strict';

/**
 * nftController.js
 *
 * Handles ERC-721 NFT generation, saving, retrieval, and deletion.
 * Uses asyncHandler for robust error management and delegates input
 * validation to Joi middleware.
 */

const mongoose     = require('mongoose');
const NFT          = require('../models/NFT');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { incrementDeployments } = require('../services/usageService');

/** POST /api/nft/generate */
const generateNFT = asyncHandler(async (req, res) => {
    const { name, symbol, maxSupply, baseURI, mintPrice, ownerAddress } = req.body;

    const safeName      = sanitize(name   || '');
    const safeSymbol    = sanitize(symbol || '').toUpperCase();
    // Assuming template doesn't necessarily need the rest for basic code structure,
    // or they are handled in frontend parameters. If needed, replace in template.

    const className  = toClassName(safeName, 'NFTContract');
    let contractCode = readTemplate('ERC721Template.txt');
    const finalCode  = contractCode
        .replace(/{{CONTRACT_NAME}}/g, className)
        .replace(/{{NFT_NAME}}/g,      safeName)
        .replace(/{{NFT_SYMBOL}}/g,    safeSymbol);

    const { abi, bytecode } = compileContract(finalCode, 'NFT.sol', className);

    return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, contractName: className } });
});

/** POST /api/nft/save */
const saveNFT = asyncHandler(async (req, res) => {
    const { name, symbol, contractAddress, ownerAddress, network, maxSupply, mintPrice, baseURI, abi } = req.body;

    if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
        throw new AppError('You can only save NFTs for your own wallet.', 403, 'FORBIDDEN');
    }

    const newNFT = new NFT({
        name, symbol, contractAddress,
        ownerAddress: ownerAddress.toLowerCase(),
        network: network || 'Sepolia',
        maxSupply, mintPrice, baseURI,
        abi: abi || null,
    });
    await newNFT.save();

    incrementDeployments(req.user.userId); // Fire and forget

    return res.status(201).json({ success: true, message: 'NFT collection saved successfully!' });
});

/** GET /api/nft/my-nfts/:walletAddress */
const getMyNFTs = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (req.user.walletAddress !== walletAddress.toLowerCase()) {
        throw new AppError('You can only view your own NFTs.', 403, 'FORBIDDEN');
    }

    const nfts = await NFT.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
    return res.json({ success: true, data: { nfts } });
});

/** DELETE /api/nft/delete/:id */
const deleteNFT = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format.', 400, 'INVALID_ID');
    }

    const nft = await NFT.findById(id);
    if (!nft) throw new AppError('NFT not found.', 404, 'NOT_FOUND');
    if (req.user.walletAddress !== nft.ownerAddress.toLowerCase()) {
        throw new AppError('You can only delete your own NFTs.', 403, 'FORBIDDEN');
    }

    await NFT.findByIdAndDelete(id);
    return res.json({ success: true, message: 'NFT removed from registry.' });
});

module.exports = { generateNFT, saveNFT, getMyNFTs, deleteNFT };

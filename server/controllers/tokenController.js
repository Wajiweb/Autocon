'use strict';

/**
 * tokenController.js
 *
 * Handles ERC-20 token generation, saving, retrieval, and deletion.
 * All input validation is handled by Joi middleware in the route layer.
 * Business logic is delegated to services.
 * Errors propagate via asyncHandler → centralized errorHandler.
 */

const mongoose     = require('mongoose');
const Token        = require('../models/Token');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { isValidAddress } = require('../services/blockchainService');
const { incrementDeployments } = require('../services/usageService');

/**
 * POST /api/token/generate-token
 * Generates and compiles a new ERC-20 contract from the template.
 */
const generateToken = asyncHandler(async (req, res) => {
    const { name, symbol, supply, ownerAddress } = req.body;

    const safeName   = sanitize(name   || '');
    const safeSymbol = sanitize(symbol || '').toUpperCase();
    const safeSupply = String(parseInt(supply) || 1000000);

    const className  = toClassName(safeName, 'TokenContract');
    let contractCode = readTemplate('ERC20Template.txt');
    const finalCode  = contractCode
        .replace(/{{CONTRACT_NAME}}/g,    className)
        .replace(/{{TOKEN_NAME}}/g,       safeName)
        .replace(/{{TOKEN_SYMBOL}}/g,     safeSymbol)
        .replace(/{{SUPPLY}}/g,           safeSupply)
        .replace(/{{IMPORT_BURNABLE}}/g,  '').replace(/{{IMPORT_PAUSABLE}}/g,  '')
        .replace(/{{INHERIT_BURNABLE}}/g, '').replace(/{{INHERIT_PAUSABLE}}/g, '')
        .replace(/{{FUNCTION_MINT}}/g,    '').replace(/{{FUNCTION_PAUSE}}/g,   '');

    const { abi, bytecode, ast } = compileContract(finalCode, 'Token.sol', className, true);

    return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, ast } });
});

/**
 * POST /api/token/save-token
 * Persists a deployed token to the registry.
 */
const saveToken = asyncHandler(async (req, res) => {
    const { name, symbol, contractAddress, ownerAddress, network, abi } = req.body;

    if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
        throw new AppError('You can only save tokens for your own wallet.', 403, 'FORBIDDEN');
    }

    const newToken = new Token({
        name, symbol, contractAddress,
        ownerAddress: ownerAddress.toLowerCase(),
        network:      network || 'Sepolia',
        abi:          abi || null,
    });
    await newToken.save();

    incrementDeployments(req.user.userId); // fire-and-forget, non-fatal

    return res.status(201).json({ success: true, message: 'Token saved successfully!' });
});

/**
 * GET /api/token/my-tokens/:walletAddress
 * Returns all tokens owned by the authenticated user.
 */
const getMyTokens = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (req.user.walletAddress !== walletAddress.toLowerCase()) {
        throw new AppError('You can only view your own tokens.', 403, 'FORBIDDEN');
    }

    const tokens = await Token.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
    return res.json({ success: true, data: { tokens } });
});

/**
 * DELETE /api/token/delete-token/:id
 * Removes a token from the registry.
 */
const deleteToken = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format.', 400, 'INVALID_ID');
    }

    const token = await Token.findById(id);
    if (!token) throw new AppError('Token not found.', 404, 'NOT_FOUND');
    if (req.user.walletAddress !== token.ownerAddress.toLowerCase()) {
        throw new AppError('You can only delete your own tokens.', 403, 'FORBIDDEN');
    }

    await Token.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deployment removed from registry.' });
});

module.exports = { generateToken, saveToken, getMyTokens, deleteToken };

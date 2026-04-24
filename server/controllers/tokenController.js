const mongoose = require('mongoose');
const Token    = require('../models/Token');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { isValidAddress } = require('../services/blockchainService');
const { incrementDeployments } = require('../services/usageService');

/**
 * POST /api/token/generate-token
 */
async function generateToken(req, res) {
    const { name, symbol, supply, ownerAddress } = req.body;

    const safeName   = sanitize(name   || '');
    const safeSymbol = sanitize(symbol || '').toUpperCase();
    const safeSupply = String(parseInt(supply) || 1000000);

    if (!safeName || !safeSymbol || !ownerAddress) {
        return res.status(400).json({ success: false, error: 'name, symbol, supply, and ownerAddress are required.' });
    }

    try {
        const className    = toClassName(safeName, 'TokenContract');
        let contractCode   = readTemplate('ERC20Template.txt');
        const finalCode    = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className)
            .replace(/{{TOKEN_NAME}}/g,    safeName)
            .replace(/{{TOKEN_SYMBOL}}/g,  safeSymbol)
            .replace(/{{SUPPLY}}/g,        safeSupply)
            .replace(/{{IMPORT_BURNABLE}}/g,  '').replace(/{{IMPORT_PAUSABLE}}/g,  '')
            .replace(/{{INHERIT_BURNABLE}}/g, '').replace(/{{INHERIT_PAUSABLE}}/g, '')
            .replace(/{{FUNCTION_MINT}}/g,    '').replace(/{{FUNCTION_PAUSE}}/g,   '');

        const { abi, bytecode, ast } = compileContract(finalCode, 'Token.sol', className, true);

        res.json({ success: true, contractCode: finalCode, abi, bytecode, ast });
    } catch (error) {
        console.error('[TokenController] generateToken:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Generation failed' });
    }
}

/**
 * POST /api/token/save-token
 */
async function saveToken(req, res) {
    try {
        const { name, symbol, contractAddress, ownerAddress, network, abi } = req.body;

        if (!name || !symbol || !contractAddress || !ownerAddress) {
            return res.status(400).json({ success: false, error: 'name, symbol, contractAddress, and ownerAddress are required.' });
        }
        if (!isValidAddress(contractAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid contract address format.' });
        }
        if (!isValidAddress(ownerAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid owner address format.' });
        }
        if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only save tokens for your own wallet.' });
        }

        const newToken = new Token({
            name, symbol, contractAddress,
            ownerAddress: ownerAddress.toLowerCase(),
            network: network || 'Sepolia',
            abi: abi || null,
        });
        await newToken.save();

        // Track deployment usage (atomic, non-fatal)
        incrementDeployments(req.user.userId);

        res.status(201).json({ success: true, message: 'Token saved successfully!' });
    } catch (error) {
        console.error('[TokenController] saveToken:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save token' });
    }
}

/**
 * GET /api/token/my-tokens/:walletAddress
 */
async function getMyTokens(req, res) {
    try {
        const { walletAddress } = req.params;

        if (req.user.walletAddress !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only view your own tokens.' });
        }

        const tokens = await Token.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
        res.json({ success: true, tokens });
    } catch (error) {
        console.error('[TokenController] getMyTokens:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch tokens' });
    }
}

/**
 * DELETE /api/token/delete-token/:id
 */
async function deleteToken(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format.' });
        }

        const token = await Token.findById(id);
        if (!token) return res.status(404).json({ success: false, error: 'Token not found.' });
        if (req.user.walletAddress !== token.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only delete your own tokens.' });
        }

        await Token.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deployment removed from registry.' });
    } catch (error) {
        console.error('[TokenController] deleteToken:', error.message);
        res.status(500).json({ success: false, error: 'Failed to delete token.' });
    }
}

module.exports = { generateToken, saveToken, getMyTokens, deleteToken };

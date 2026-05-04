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
 * Dynamically injects optional features based on boolean flags.
 */
const generateToken = asyncHandler(async (req, res) => {
    const {
        name, symbol, supply, ownerAddress,
        isMintable = false, isBurnable = false, isPausable = false,
        isCapped = false, hasAntiWhale = false, hasTax = false, taxRate = 0,
    } = req.body;

    const safeName   = sanitize(name   || '');
    const safeSymbol = sanitize(symbol || '').toUpperCase();
    const safeSupply = String(parseInt(supply) || 1000000);
    const className  = toClassName(safeName, 'TokenContract');

    // ── Dynamic imports ────────────────────────────────────────────────────────
    const imports = [
        'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";',
        'import "@openzeppelin/contracts/access/Ownable.sol";',
        isBurnable  ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";' : '',
        isPausable  ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";' : '',
        isCapped    ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";'   : '',
    ].filter(Boolean).join('\n');

    // ── Dynamic inheritance ────────────────────────────────────────────────────
    const inherits = [
        'ERC20',
        isBurnable ? 'ERC20Burnable' : '',
        isPausable ? 'ERC20Pausable' : '',
        isCapped   ? 'ERC20Capped'   : '',
        'Ownable',
    ].filter(Boolean).join(', ');

    // ── Constructor args & body ────────────────────────────────────────────────
    const constructorSuper = isCapped
        ? `ERC20("${safeName}", "${safeSymbol}")\n        ERC20Capped(${safeSupply} * 10 ** decimals())\n        Ownable(initialOwner)`
        : `ERC20("${safeName}", "${safeSymbol}")\n        Ownable(initialOwner)`;

    const mintLine = isCapped
        ? `_mint(initialOwner, initialSupply * 10 ** decimals());`
        : `_mint(initialOwner, initialSupply * 10 ** decimals());`;

    // ── Optional state variables ───────────────────────────────────────────────
    const stateVars = [
        hasAntiWhale ? `    uint256 public maxWalletAmount = (${safeSupply} * 10 ** 18) / 100; // 1% max wallet` : '',
        hasTax       ? `    uint256 public taxRate = ${Math.min(25, Math.max(0, parseFloat(taxRate) || 0))}; // basis points (1 = 0.01%)` : '',
        hasTax       ? `    address public taxRecipient;` : '',
    ].filter(Boolean).join('\n');

    // ── Optional functions ─────────────────────────────────────────────────────
    const functions = [
        // Mint (always included if mintable; burnable has its own via extension)
        isMintable ? `
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }` : '',

        // Pause/unpause (only if pausable)
        isPausable ? `
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }` : '',

        // Anti-whale transfer override
        hasAntiWhale ? `
    function setMaxWalletAmount(uint256 amount) public onlyOwner {
        maxWalletAmount = amount;
    }` : '',

        // Tax recipient setter
        hasTax ? `
    function setTaxRecipient(address recipient) public onlyOwner {
        taxRecipient = recipient;
    }

    function setTaxRate(uint256 rate) public onlyOwner {
        require(rate <= 2500, "Tax cannot exceed 25%");
        taxRate = rate;
    }` : '',

        // Required override for Pausable + ERC20
        isPausable ? `
    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }` : '',

        // Required override for Capped + ERC20
        (isCapped && !isPausable) ? `
    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Capped)
    {
        super._update(from, to, value);
    }` : '',

        // Required override for Capped + Pausable + ERC20
        (isCapped && isPausable) ? `
    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Capped, ERC20Pausable)
    {
        super._update(from, to, value);
    }` : '',
    ].filter(Boolean).join('\n');

    const finalCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

${imports}

contract ${className} is ${inherits} {
${stateVars ? stateVars + '\n' : ''}
    constructor(address initialOwner, uint256 initialSupply)
        ${constructorSuper}
    {
        ${mintLine}
    }
${functions}
}
`;

    const { abi, bytecode, ast } = compileContract(finalCode, 'Token.sol', className, true);

    return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, ast } });
});

/**
 * POST /api/token/save-token
 * Persists a deployed token to the registry.
 */
const saveToken = asyncHandler(async (req, res) => {
    const { name, symbol, contractAddress, ownerAddress, network, abi, sourceCode, compilerVersion, constructorArgs } = req.body;

    console.log('[saveToken] Received fields:', { name, symbol, contractAddress, sourceCode: sourceCode?.substring(0, 50), compilerVersion, constructorArgs: constructorArgs?.substring(0, 20) });

    if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
        throw new AppError('You can only save tokens for your own wallet.', 403, 'FORBIDDEN');
    }

    const newToken = new Token({
        name, symbol, contractAddress,
        ownerAddress: ownerAddress.toLowerCase(),
        network:      network || 'Sepolia',
        abi:          abi || null,
        sourceCode:     sourceCode || '',
        compilerVersion: compilerVersion || 'v0.8.20+commit.a1b79de6',
        constructorArgs: constructorArgs || '',
    });
    await newToken.save();

    console.log('[saveToken] Saved successfully with sourceCode length:', sourceCode?.length || 0);

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

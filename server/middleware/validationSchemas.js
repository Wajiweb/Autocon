'use strict';

/**
 * validationSchemas.js
 *
 * Centralized Joi schemas for all API request bodies and query params.
 * Import `validate` middleware into any route to enforce schemas.
 *
 * Usage in a route:
 *   const { validate, schemas } = require('../middleware/validationSchemas');
 *   router.post('/generate-token', validate(schemas.generateToken), handler);
 */

const Joi = require('joi');

// ─── Reusable Field Rules ─────────────────────────────────────────────────────

const eth = {
    address: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .messages({ 'string.pattern.base': '{{#label}} must be a valid Ethereum address (0x...)' }),

    txHash: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{64}$/)
        .messages({ 'string.pattern.base': '{{#label}} must be a valid transaction hash' }),

    network: Joi.string()
        .valid('sepolia', 'mainnet', 'amoy', 'polygon amoy', 'bnb testnet', 'bnbtestnet', 'bsc testnet')
        .lowercase()
        .messages({ 'any.only': '{{#label}} must be a supported network (sepolia, mainnet, amoy, bnb testnet)' }),

    solidity: Joi.string().min(10).max(200000),
    
    // Large payload validation for AI and verification endpoints
    largeSolidity: Joi.string().min(10).max(500000), // 500KB max for large contracts
};

const name  = Joi.string().min(1).max(64).trim();
const symbol = Joi.string().min(1).max(12).uppercase().trim();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const schemas = {

    // ── ERC-20 Token Generation ───────────────────────────────────────────────
    generateToken: Joi.object({
        name:         name.required(),
        symbol:       symbol.required(),
        supply:       Joi.number().positive().max(1e24).required(),
        ownerAddress: eth.address.required(),
        isMintable:   Joi.boolean().optional(),
        isBurnable:   Joi.boolean().optional(),
        isPausable:   Joi.boolean().optional(),
        isCapped:     Joi.boolean().optional(),
        hasAntiWhale: Joi.boolean().optional(),
        hasTax:       Joi.boolean().optional(),
        taxRate:      Joi.when('hasTax', { is: true, then: Joi.number().min(0).max(25).required(), otherwise: Joi.optional() }),
    }),

    // ── NFT Collection Generation ─────────────────────────────────────────────
    generateNFT: Joi.object({
        name:         name.required(),
        symbol:       symbol.required(),
        baseURI:      Joi.string().uri().optional().allow(''),
        maxSupply:    Joi.number().integer().positive().max(1000000).required(),
        mintPrice:    Joi.string().pattern(/^\d+(\.\d+)?$/).required()
            .messages({ 'string.pattern.base': 'mintPrice must be a positive decimal number (e.g. "0.05")' }),
        ownerAddress: eth.address.required(),
        isRevealed:   Joi.boolean().optional(),
        isBurnable:   Joi.boolean().optional(),
        isEnumerable: Joi.boolean().optional(),
    }),

    // ── Auction Generation ────────────────────────────────────────────────────
    generateAuction: Joi.object({
        name:            name.required(),
        itemName:        name.required(),
        itemDescription: Joi.string().max(500).optional().allow(''),
        duration:        Joi.number().integer().min(1).max(30).required()
            .messages({ 'number.min': 'Duration must be at least 1 day', 'number.max': 'Duration cannot exceed 30 days' }),
        minimumBid:      Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
        ownerAddress:    eth.address.required(),
    }),

    // ── Security Audit (legacy direct route) ─────────────────────────────────
    auditContract: Joi.object({
        contractCode:    eth.solidity.required(),
        contractAddress: eth.address.optional(),
    }),

    // ── Job Creation ──────────────────────────────────────────────────────────
    createJob: Joi.object({
        type: Joi.string().valid('verification', 'audit').required(),
        payload: Joi.when('type', {
            is: 'verification',
            then: Joi.object({
                contractAddress:      eth.address.required(),
                sourceCode:           eth.solidity.required(),
                contractName:         name.required(),
                compilerVersion:      Joi.string().pattern(/^v\d+\.\d+\.\d+\+commit\.[a-f0-9]+$/).required()
                    .messages({ 'string.pattern.base': 'compilerVersion must be in format v0.8.20+commit.xxxxxxxx' }),
                network:              eth.network.required(),
                constructorArguements: Joi.string().optional().allow('', null),
            }).required(),
            otherwise: Joi.object({
                contractCode:    eth.solidity.required(),
                contractAddress: eth.address.optional(),
            }).required(),
        }),
    }),

    // ── AI Chat ───────────────────────────────────────────────────────────────
    chatMessage: Joi.object({
        contractCode: eth.solidity.required(),
        question: Joi.string().min(1).max(2000).trim().required(),
    }),

    // ── AI Assistant ──────────────────────────────────────────────────────────
    aiSuggest: Joi.object({
        contractType: Joi.string().valid('ERC20', 'ERC721', 'Auction', 'Token', 'NFT').required(),
        userDescription: Joi.string().max(500).required(),
        partialInputs: Joi.object().optional().default({}),
    }),
    aiAuditExplain: Joi.object({
        vulnerabilities: Joi.array().items(Joi.object()).required(),
        contractCode: eth.solidity.required(),
    }),

    // ── Pagination Query Params ───────────────────────────────────────────────
    pagination: Joi.object({
        page:   Joi.number().integer().min(1).default(1),
        limit:  Joi.number().integer().min(1).max(50).default(10),
        type:   Joi.string().valid('verification', 'audit').optional(),
        status: Joi.string().valid('pending', 'processing', 'completed', 'failed').optional(),
    }),

    // ── Save Deployments (previously unvalidated) ─────────────────────────────
    saveToken: Joi.object({
        name:            name.required(),
        symbol:          symbol.required(),
        contractAddress: eth.address.required(),
        ownerAddress:    eth.address.required(),
        network:         eth.network.optional().default('sepolia'),
        abi:             Joi.array().optional(),
    }),

    saveNFT: Joi.object({
        name:            name.required(),
        symbol:          symbol.required(),
        contractAddress: eth.address.required(),
        ownerAddress:    eth.address.required(),
        network:         eth.network.optional().default('sepolia'),
        maxSupply:       Joi.number().integer().positive().optional(),
        mintPrice:       Joi.string().pattern(/^\d+(\.\d+)?$/).optional(),
        baseURI:         Joi.string().optional().allow(''),
        abi:             Joi.array().optional(),
    }),

    saveAuction: Joi.object({
        name:            name.required(),
        itemName:        name.optional().allow(''),
        itemDescription: Joi.string().max(500).optional().allow(''),
        contractAddress: eth.address.required(),
        ownerAddress:    eth.address.required(),
        network:         eth.network.optional().default('sepolia'),
        duration:        Joi.number().integer().optional(),
        minimumBid:      Joi.string().pattern(/^\d+(\.\d+)?$/).optional(),
    }),

    // ── Etherscan Verification ────────────────────────────────────────────────
    verifyContract: Joi.object({
        contractAddress:       eth.address.required(),
        sourceCode:            eth.solidity.required(),
        contractName:          name.required(),
        compilerVersion:       Joi.string().required(),
        network:               eth.network.required(),
        constructorArguements: Joi.string().optional().allow('', null),
    }),

    // ── Gas Estimation ────────────────────────────────────────────────────────
    estimateGas: Joi.object({
        abi:             Joi.array().required(),
        bytecode:        Joi.string().min(2).required(),
        ownerAddress:    eth.address.required(),
        constructorArgs: Joi.array().optional(),
        supply:          Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        network:         eth.network.optional().default('sepolia'),
    }),

    // ── Custom Compile (Monaco editor) ───────────────────────────────────────
    compileCustom: Joi.object({
        sourceCode:   eth.solidity.required(),
        contractName: name.required(),
    }),

    // ── Large Contract Compile (for verification) ────────────────────────
    compileLarge: Joi.object({
        sourceCode:   eth.largeSolidity.required(),
        contractName: name.required(),
    }),
};

// ─── Validate Middleware Factory ──────────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against a Joi schema.
 * On failure, calls next(err) with a Joi-compatible ValidationError
 * that our centralized errorHandler catches and formats.
 *
 * @param {Joi.Schema} schema
 * @param {'body'|'query'|'params'} source
 */
function validate(schema, source = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,      // Collect ALL errors, not just first
            stripUnknown: true,     // Remove unrecognized keys silently
            convert: true,          // Coerce types (e.g. "123" → 123)
        });

        if (error) {
            error.isJoi = true;     // Flag for errorHandler
            return next(error);
        }

        req[source] = value;        // Replace with sanitized + coerced value
        next();
    };
}

module.exports = { validate, schemas, eth };

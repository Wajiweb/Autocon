'use strict';
const { compileContract } = require('../services/compilerService');

/**
 * POST /api/compile
 * Compiles an arbitrary Solidity string. Used when users manually edit code via Monaco.
 */
async function compileCustomContract(req, res) {
    const { sourceCode, contractName } = req.body;

    if (!sourceCode || !contractName) {
        return res.status(400).json({ success: false, error: 'sourceCode and contractName are required.' });
    }

    try {
        const { abi, bytecode, ast } = compileContract(sourceCode, 'CustomContract.sol', contractName, true);
        res.json({ success: true, abi, bytecode, ast });
    } catch (error) {
        console.error('[CompileController] compileCustomContract error:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Custom compilation failed' });
    }
}

module.exports = { compileCustomContract };

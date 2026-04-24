'use strict';
const fs   = require('fs');
const path = require('path');
const solc = require('solc');

/**
 * Resolves @openzeppelin imports for the solc compiler.
 * @param {string} importPath
 * @returns {{ contents: string } | { error: string }}
 */
function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin/')) {
            const actualPath = require.resolve(importPath, { paths: [path.join(__dirname, '..')] });
            return { contents: fs.readFileSync(actualPath, 'utf8') };
        }
        return { error: 'File not found' };
    } catch (e) {
        return { error: 'File not found: ' + e.message };
    }
}

/**
 * Compiles a Solidity source string and returns ABI + bytecode.
 *
 * @param {string} sourceCode   - Full Solidity source
 * @param {string} fileName     - Virtual filename (e.g. 'Token.sol')
 * @param {string} className    - Contract class name to extract from output
 * @param {boolean} includeAST  - Whether to include AST in output
 * @returns {{ abi, bytecode, ast? }}
 * @throws {Error} with human-readable message on compile failure
 */
function compileContract(sourceCode, fileName, className, includeAST = false) {
    const input = {
        language: 'Solidity',
        sources: { [fileName]: { content: sourceCode } },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            outputSelection: {
                '*': { '*': ['abi', 'evm.bytecode.object'] },
                ...(includeAST ? { '': { '': ['ast'] } } : {})
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error(`[CompilerService] Errors in ${fileName}:`, errors);
            throw new Error('Compile Error: ' + errors[0].message);
        }
    }

    const contractData = output.contracts[fileName]?.[className];
    if (!contractData) {
        throw new Error(`Compilation produced no output for contract "${className}".`);
    }

    const rawVersion = solc.version();
    const formattedVersion = 'v' + rawVersion.replace('.Emscripten.clang', '');

    const result = {
        abi:      contractData.abi,
        bytecode: contractData.evm.bytecode.object,
        compilerVersion: formattedVersion,
        optimizationUsed: 1,
        runs: 200
    };

    if (includeAST) {
        const firstFile = Object.keys(output.sources ?? {})[0];
        result.ast = output.sources?.[firstFile]?.ast ?? null;
    }

    return result;
}

/**
 * Sanitizes a string to only contain alphanumeric characters and spaces.
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
    return str.replace(/[^a-zA-Z0-9\s]/g, '');
}

/**
 * Derives a valid Solidity class name from a human-readable name.
 * @param {string} name
 * @param {string} fallback - Used if name is empty
 * @returns {string}
 */
function toClassName(name, fallback = 'Contract') {
    let className = name.replace(/\s+/g, '');
    if (!className) className = fallback;
    if (/^[0-9]/.test(className)) className = '_' + className;
    return className;
}

/**
 * Reads a contract template file from the templates/ directory.
 * @param {string} templateName - e.g. 'ERC20Template.txt'
 * @returns {string}
 */
function readTemplate(templateName) {
    const templatePath = path.join(__dirname, '..', 'templates', templateName);
    return fs.readFileSync(templatePath, 'utf8');
}

module.exports = { compileContract, findImports, sanitize, toClassName, readTemplate };

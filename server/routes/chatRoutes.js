const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * POST /api/chat
 * AI-powered contract explainer.
 * Uses a rule-based analysis (no external API key required).
 * Body: { contractCode, question }
 */
router.post('/', strictLimiter, authMiddleware, (req, res) => {
    try {
        const { contractCode, question } = req.body;

        if (!contractCode || !question) {
            return res.status(400).json({
                success: false,
                error: 'contractCode and question are required.'
            });
        }

        // Analyze the contract and build context
        const analysis = analyzeContract(contractCode);
        const answer = answerQuestion(question, analysis, contractCode);

        res.json({
            success: true,
            answer,
            analysis: {
                contractName: analysis.contractName,
                standard: analysis.standard,
                functionCount: analysis.functions.length,
                hasOwner: analysis.hasOwner
            }
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze contract.' });
    }
});

/**
 * Analyze a Solidity contract and extract key information
 */
function analyzeContract(code) {
    const analysis = {
        contractName: '',
        standard: 'Custom',
        functions: [],
        events: [],
        modifiers: [],
        stateVars: [],
        imports: [],
        hasOwner: false,
        hasMint: false,
        hasBurn: false,
        hasPause: false,
        isPayable: false,
        inherits: []
    };

    // Extract contract name
    const contractMatch = code.match(/contract\s+(\w+)/);
    if (contractMatch) analysis.contractName = contractMatch[1];

    // Extract imports
    const importMatches = code.matchAll(/import\s+["']([^"']+)["']/g);
    for (const m of importMatches) analysis.imports.push(m[1]);

    // Detect standard
    if (code.includes('ERC20')) analysis.standard = 'ERC-20';
    else if (code.includes('ERC721')) analysis.standard = 'ERC-721';
    else if (code.includes('ERC1155')) analysis.standard = 'ERC-1155';

    // Extract inheritance
    const inheritMatch = code.match(/contract\s+\w+\s+is\s+([^{]+)/);
    if (inheritMatch) {
        analysis.inherits = inheritMatch[1].split(',').map(s => s.trim());
    }

    // Extract functions
    const funcMatches = code.matchAll(/function\s+(\w+)\s*\(([^)]*)\)\s*([^{]*)\{/g);
    for (const m of funcMatches) {
        const visibility = m[3].includes('public') ? 'public' :
            m[3].includes('external') ? 'external' :
                m[3].includes('internal') ? 'internal' : 'private';
        const isPayable = m[3].includes('payable');
        const isView = m[3].includes('view') || m[3].includes('pure');
        const modifiers = [];
        if (m[3].includes('onlyOwner')) modifiers.push('onlyOwner');

        analysis.functions.push({
            name: m[1],
            params: m[2].trim(),
            visibility,
            isPayable,
            isView,
            modifiers
        });
    }

    // Extract events
    const eventMatches = code.matchAll(/event\s+(\w+)\s*\(([^)]*)\)/g);
    for (const m of eventMatches) {
        analysis.events.push({ name: m[1], params: m[2].trim() });
    }

    // Detect features
    analysis.hasOwner = code.includes('Ownable') || code.includes('onlyOwner');
    analysis.hasMint = code.includes('_mint') || code.includes('function mint');
    analysis.hasBurn = code.includes('Burnable') || code.includes('_burn');
    analysis.hasPause = code.includes('Pausable');
    analysis.isPayable = code.includes('payable');

    return analysis;
}

/**
 * Generate an answer based on the question and analysis
 */
function answerQuestion(question, analysis, code) {
    const q = question.toLowerCase();

    // What does this contract do?
    if (q.includes('what does') || q.includes('what is') || q.includes('explain') || q.includes('overview') || q.includes('describe')) {
        let answer = `**${analysis.contractName}** is a ${analysis.standard} smart contract`;
        if (analysis.inherits.length > 0) {
            answer += ` that inherits from ${analysis.inherits.join(', ')}`;
        }
        answer += `.\n\n`;

        answer += `### Key Features:\n`;
        if (analysis.hasMint) answer += `- ✅ **Minting**: Can create new tokens\n`;
        if (analysis.hasBurn) answer += `- 🔥 **Burning**: Tokens can be destroyed\n`;
        if (analysis.hasOwner) answer += `- 👑 **Ownership**: Has access control via Ownable\n`;
        if (analysis.hasPause) answer += `- ⏸️ **Pausable**: Can pause/unpause operations\n`;
        if (analysis.isPayable) answer += `- 💰 **Payable**: Can receive/send ETH\n`;

        answer += `\n### Functions (${analysis.functions.length}):\n`;
        analysis.functions.forEach(f => {
            const tags = [];
            if (f.isPayable) tags.push('💰 payable');
            if (f.isView) tags.push('👁️ view');
            if (f.modifiers.length > 0) tags.push(`🔒 ${f.modifiers.join(', ')}`);
            answer += `- \`${f.name}(${f.params})\` — ${f.visibility} ${tags.join(' ')}\n`;
        });

        if (analysis.events.length > 0) {
            answer += `\n### Events:\n`;
            analysis.events.forEach(e => {
                answer += `- \`${e.name}(${e.params})\`\n`;
            });
        }

        return answer;
    }

    // Questions about specific functions
    if (q.includes('function') || q.includes('method')) {
        const funcName = extractFunctionName(q, analysis.functions);
        if (funcName) {
            const func = analysis.functions.find(f => f.name.toLowerCase() === funcName.toLowerCase());
            if (func) {
                let answer = `### \`${func.name}(${func.params})\`\n\n`;
                answer += `- **Visibility**: ${func.visibility}\n`;
                answer += `- **Payable**: ${func.isPayable ? 'Yes — accepts ETH' : 'No'}\n`;
                answer += `- **View/Pure**: ${func.isView ? 'Yes — read-only, no gas cost' : 'No — modifies state'}\n`;
                if (func.modifiers.length > 0) answer += `- **Access**: Restricted by ${func.modifiers.join(', ')}\n`;

                // Try to explain what common functions do
                const explanations = {
                    'mint': 'Creates new tokens and assigns them to an address.',
                    'safemint': 'Safely mints a new token, checking that the receiver can handle ERC-721 tokens.',
                    'burn': 'Permanently destroys tokens, reducing the total supply.',
                    'transfer': 'Sends tokens from the caller to another address.',
                    'approve': 'Grants another address permission to spend tokens on your behalf.',
                    'withdraw': 'Withdraws accumulated ETH from the contract to the owner.',
                    'bid': 'Places a bid in the auction. Must be higher than the current highest bid.',
                    'endauction': 'Ends the auction and sends the highest bid to the beneficiary.',
                    'setbaseuri': 'Updates the base metadata URI for all tokens.',
                    'setmintprice': 'Changes the mint price for future mints.',
                    'ownermint': 'Allows the owner to mint tokens without paying the mint price.',
                    'totalminted': 'Returns the total number of tokens that have been minted.',
                    'extendauction': 'Extends the auction end time by a specified number of seconds.',
                    'timeleft': 'Returns the remaining time in seconds before the auction ends.',
                    'getauctioninfo': 'Returns comprehensive auction state information.',
                };

                const lowerName = func.name.toLowerCase();
                if (explanations[lowerName]) {
                    answer += `\n**What it does**: ${explanations[lowerName]}`;
                }

                return answer;
            }
        }

        // List all functions
        let answer = `### All Functions in ${analysis.contractName}:\n\n`;
        analysis.functions.forEach(f => {
            answer += `- \`${f.name}(${f.params})\` — ${f.visibility}`;
            if (f.isPayable) answer += ' 💰';
            if (f.isView) answer += ' 👁️';
            if (f.modifiers.length > 0) answer += ` 🔒`;
            answer += '\n';
        });
        return answer;
    }

    // Security questions
    if (q.includes('secure') || q.includes('security') || q.includes('safe') || q.includes('vulnerab') || q.includes('audit')) {
        let answer = `### Security Analysis of ${analysis.contractName}\n\n`;
        let score = 100;
        const issues = [];

        if (!analysis.hasOwner) { issues.push('⚠️ No ownership control — any address can call privileged functions'); score -= 20; }
        if (code.includes('tx.origin')) { issues.push('🔴 Uses `tx.origin` — vulnerable to phishing attacks'); score -= 25; }
        if (code.includes('selfdestruct')) { issues.push('🔴 Contains `selfdestruct` — contract can be permanently destroyed'); score -= 20; }
        if (!code.includes('pragma solidity ^')) { issues.push('⚠️ No fixed Solidity version — may compile with vulnerable compilers'); score -= 10; }
        if (code.includes('.call{value:')) { answer += '✅ Uses `.call{value:}` instead of `.transfer()` — gas-safe ETH transfers\n'; }
        if (code.includes('require(')) { answer += '✅ Uses `require()` for input validation\n'; }
        if (analysis.hasOwner) { answer += '✅ Has ownership controls via Ownable\n'; }
        if (analysis.imports.some(i => i.includes('openzeppelin'))) { answer += '✅ Uses OpenZeppelin audited libraries\n'; }

        if (issues.length > 0) {
            answer += `\n**Issues Found:**\n`;
            issues.forEach(i => answer += `- ${i}\n`);
        } else {
            answer += `\n🎉 No major security issues detected.\n`;
        }

        answer += `\n**Security Score: ${Math.max(0, score)}/100**`;
        return answer;
    }

    // Owner / access control
    if (q.includes('owner') || q.includes('access') || q.includes('permission') || q.includes('who can')) {
        let answer = `### Access Control in ${analysis.contractName}\n\n`;
        if (analysis.hasOwner) {
            answer += `This contract uses **OpenZeppelin's Ownable** pattern.\n\n`;
            answer += `**Owner-only functions:**\n`;
            analysis.functions.filter(f => f.modifiers.includes('onlyOwner')).forEach(f => {
                answer += `- \`${f.name}()\` — only the contract owner can call this\n`;
            });
            answer += `\n**Public functions:**\n`;
            analysis.functions.filter(f => f.visibility === 'public' && !f.modifiers.includes('onlyOwner')).forEach(f => {
                answer += `- \`${f.name}()\` — anyone can call this\n`;
            });
        } else {
            answer += `⚠️ This contract has **no access control**. All functions are callable by anyone.\n`;
        }
        return answer;
    }

    // Gas / cost questions
    if (q.includes('gas') || q.includes('cost') || q.includes('expensive') || q.includes('cheap')) {
        let answer = `### Gas Cost Analysis\n\n`;
        answer += `**Read-only functions (no gas):**\n`;
        analysis.functions.filter(f => f.isView).forEach(f => {
            answer += `- \`${f.name}()\` — free to call\n`;
        });
        answer += `\n**State-modifying functions (require gas):**\n`;
        analysis.functions.filter(f => !f.isView).forEach(f => {
            answer += `- \`${f.name}()\` — costs gas\n`;
        });
        answer += `\nDeploying this ${analysis.standard} contract typically costs **0.003–0.01 ETH** on Sepolia, depending on complexity.`;
        return answer;
    }

    // Fallback — general summary
    let answer = `### About ${analysis.contractName}\n\n`;
    answer += `This is a **${analysis.standard}** contract with **${analysis.functions.length} functions** and **${analysis.events.length} events**.\n\n`;
    answer += `Try asking:\n`;
    answer += `- "What does this contract do?"\n`;
    answer += `- "Is this contract secure?"\n`;
    answer += `- "Explain the ${analysis.functions[0]?.name || 'mint'} function"\n`;
    answer += `- "Who can call privileged functions?"\n`;
    answer += `- "What are the gas costs?"\n`;
    return answer;
}

function extractFunctionName(question, functions) {
    for (const f of functions) {
        if (question.includes(f.name.toLowerCase())) return f.name;
    }
    return null;
}

module.exports = router;

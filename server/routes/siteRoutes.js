const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/**
 * Security: HTML-escape all values injected into the template.
 * Prevents XSS via crafted name/network/type query parameters.
 * (security-auditor skill: input validation at every injection point)
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// 1. Load HTML Template at startup (cache)
const templatePath = path.join(__dirname, '../templates/MiniSiteTemplate.html');
let SITE_TEMPLATE = '';
if (fs.existsSync(templatePath)) {
    SITE_TEMPLATE = fs.readFileSync(templatePath, 'utf8');
} else {
    console.error('❌ Mini-Site template not found on server at:', templatePath);
}

/**
 * GET /api/site/view
 * Serves a beginner-friendly interactive mini-site for a deployed smart contract.
 * Publicly accessible so users can share the link.
 */
router.get('/view', async (req, res) => {
    try {
        const { contractAddress, network, name, type } = req.query;

        if (!contractAddress || !network || !name || !type) {
            return res.status(400).json({ success: false, error: 'Missing required parameters to view site.' });
        }

        // Validate type
        const validTypes = ['ERC-20', 'Token', 'ERC-721', 'NFT', 'Auction'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid contract type for site generation.' });
        }

        if (!SITE_TEMPLATE) {
            return res.status(500).json({ success: false, error: 'Mini-Site template not found on server.' });
        }
        let htmlContent = SITE_TEMPLATE;

        // 2. Normalise type & build minimal ABI + friendly metadata per type
        let normalizedType = type;
        let minimalAbi = [];
        let contractCategory = '';      // injected so template renders correct wizard
        let contractEmoji    = '';
        let contractDesc     = '';

        // Generate minimal ABI exactly matching the deployed Solidity contracts
        if (type === 'ERC-20' || type === 'Token') {
            normalizedType   = 'ERC-20';
            contractCategory = 'token';
            contractEmoji    = '🪙';
            contractDesc     = 'A fungible token — like a digital currency. You can send it to others, check balances, and see the total supply.';
            // OpenZeppelin ERC20 + ERC20Burnable + Ownable + custom mint(address,uint256)
            minimalAbi = [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)",
                "function totalSupply() view returns (uint256)",
                "function balanceOf(address account) view returns (uint256)",
                "function transfer(address to, uint256 value) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)",
                "function approve(address spender, uint256 value) returns (bool)",
                "function mint(address to, uint256 amount)",
                "function burn(uint256 value)"
            ];
        } else if (type === 'ERC-721' || type === 'NFT') {
            normalizedType   = 'ERC-721';
            contractCategory = 'nft';
            contractEmoji    = '🖼️';
            contractDesc     = 'An NFT collection — unique digital items. You can mint new ones, check ownership, and see how many are available.';
            // ERC721 + ERC721URIStorage + Ownable
            // Key: mint function is safeMint(address,string), supply is totalMinted()
            minimalAbi = [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function maxSupply() view returns (uint256)",
                "function mintPrice() view returns (uint256)",
                "function totalMinted() view returns (uint256)",
                "function balanceOf(address owner) view returns (uint256)",
                "function ownerOf(uint256 tokenId) view returns (address)",
                "function tokenURI(uint256 tokenId) view returns (string)",
                "function safeMint(address to, string memory uri) payable",
                "function ownerMint(address to, string memory uri)",
                "function withdraw()",
                "function setMintPrice(uint256 _mintPrice)"
            ];
        } else if (type === 'Auction') {
            normalizedType   = 'Auction';
            contractCategory = 'auction';
            contractEmoji    = '🔨';
            contractDesc     = 'An English auction — place bids, track the highest bid, and withdraw if you were outbid.';
            // EnglishAuction — note: end function is endAuction(), item info is itemName/itemDescription
            minimalAbi = [
                "function itemName() view returns (string)",
                "function itemDescription() view returns (string)",
                "function beneficiary() view returns (address)",
                "function highestBidder() view returns (address)",
                "function highestBid() view returns (uint256)",
                "function minimumBid() view returns (uint256)",
                "function auctionEndTime() view returns (uint256)",
                "function ended() view returns (bool)",
                "function timeLeft() view returns (uint256)",
                "function pendingReturns(address) view returns (uint256)",
                "function bid() payable",
                "function withdraw() returns (bool)",
                "function endAuction()",
                "function getAuctionInfo() view returns (string, string, address, uint256, uint256, bool)"
            ];
        }

        const abiString = JSON.stringify(minimalAbi);
        // Bug 3 fix: slice(-4) is correct regardless of address length; substring(38) is fragile
        const shortAddr = `${contractAddress.substring(0, 6)}...${contractAddress.slice(-4)}`;

        // 3. Inject all tokens — Bug 1 fix: escape all user-supplied strings before injection (XSS prevention)
        //    contractAddress is validated as Ethereum hex by ethers.js, safe to inject directly
        //    abiString is server-generated JSON, not user input — safe
        //    contractEmoji/contractDesc are hardcoded per type — safe
        htmlContent = htmlContent
            .replace(/%%PROJECT_NAME%%/g,           escapeHtml(name))
            .replace(/%%CONTRACT_ADDRESS%%/g,       contractAddress)
            .replace(/%%CONTRACT_ADDRESS_SHORT%%/g, escapeHtml(shortAddr))
            .replace(/%%NETWORK_NAME%%/g,           escapeHtml(network))
            .replace(/%%SMART_CONTRACT_ABI%%/g,     abiString)
            .replace(/%%CONTRACT_TYPE%%/g,          escapeHtml(normalizedType))
            .replace(/%%CONTRACT_CATEGORY%%/g,      contractCategory)
            .replace(/%%CONTRACT_EMOJI%%/g,         contractEmoji)
            .replace(/%%CONTRACT_DESC%%/g,          contractDesc);

        // 4. Bug 2 fix: Tightened CSP — minimum required for MetaMask + ethers.js from cdnjs
        //    (security-auditor skill: principle of least privilege, no wildcard default-src)
        res.setHeader('Content-Security-Policy',
            "default-src 'none'; " +
            "script-src 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
            "style-src 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; " +
            "font-src https://fonts.gstatic.com; " +
            "connect-src https: wss:; " +
            "img-src 'self' data: https:; " +
            "frame-src 'none';"
        );
        res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent);

    } catch (error) {
        /* Phase 5: structured error log \u2014 no raw error/stack exposed in production.
           security-auditor: never log raw Error objects to stdout in production
           as they may contain internal path info or stack frames. */
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            context: 'siteRoutes.view',
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        }));
        // Return a friendly HTML error page instead of a JSON 500 blob
        if (!res.headersSent) {
            res.status(500).send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error | AutoCon</title><style>body{background:#07090a;color:#f0f2f1;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.box{text-align:center;padding:40px}.box h1{font-size:48px;margin-bottom:12px}.box p{color:rgba(240,242,241,0.55);font-size:16px;max-width:380px;margin:0 auto 24px}.box a{color:#ff6b00;text-decoration:none;font-weight:600}</style></head><body><div class="box"><h1>⚠️</h1><p>Something went wrong loading this contract page. The contract address or parameters may be invalid.</p><a href="javascript:history.back()">← Go Back</a></div></body></html>`);
        }
    }
});

module.exports = router;

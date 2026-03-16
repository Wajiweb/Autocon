const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/site/view
 * Serves a stylized HTML mini-site injected with the deployed smart contract data.
 * Publicly accessible so users can share the link.
 */
router.get('/view', async (req, res) => {
    try {
        const { contractAddress, network, name, type } = req.query;

        if (!contractAddress || !network || !name || !type) {
            return res.status(400).json({ success: false, error: 'Missing required parameters to view site.' });
        }

        // 1. Load the Generic HTML Template
        const templatePath = path.join(__dirname, '../templates/MiniSiteTemplate.html');
        if (!fs.existsSync(templatePath)) {
            return res.status(500).json({ success: false, error: 'Mini-Site template not found on server.' });
        }
        
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // 2. Load the corresponding ABI based on the Contract Type
        let abiPath = '';
        if (type === 'ERC-20' || type === 'Token') {
            abiPath = path.join(__dirname, '../templates/ERC20Template.txt');
        } else if (type === 'ERC-721' || type === 'NFT') {
            abiPath = path.join(__dirname, '../templates/ERC721Template.txt');
        } else if (type === 'Auction') {
            abiPath = path.join(__dirname, '../templates/EnglishAuctionTemplate.txt');
        } else {
            return res.status(400).json({ success: false, error: 'Invalid contract type for site generation.' });
        }

        if (!fs.existsSync(abiPath)) {
            return res.status(500).json({ success: false, error: 'Contract ABI template not found.' });
        }

        // Generate standard minimal ABI based on the type
        let minimalAbi = [];
        if (type === 'ERC-20' || type === 'Token') {
            minimalAbi = [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function totalSupply() view returns (uint256)",
                "function balanceOf(address account) view returns (uint256)",
                "function transfer(address to, uint256 value) returns (bool)"
            ];
        } else if (type === 'ERC-721' || type === 'NFT') {
            minimalAbi = [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function maxSupply() view returns (uint256)",
                "function mint() payable",
                "function ownerOf(uint256 tokenId) view returns (address)"
            ];
        } else if (type === 'Auction') {
            minimalAbi = [
                "function item() view returns (string)",
                "function highestBid() view returns (uint256)",
                "function bid() payable",
                "function end()",
                "function withdraw()"
            ];
        }

        const abiString = JSON.stringify(minimalAbi);
        const shortAddr = `${contractAddress.substring(0, 6)}...${contractAddress.substring(38)}`;

        // 3. Inject Dynamic Data
        htmlContent = htmlContent.replace(/%%PROJECT_NAME%%/g, name);
        htmlContent = htmlContent.replace(/%%CONTRACT_ADDRESS%%/g, contractAddress);
        htmlContent = htmlContent.replace(/%%CONTRACT_ADDRESS_SHORT%%/g, shortAddr);
        htmlContent = htmlContent.replace(/%%NETWORK_NAME%%/g, network);
        htmlContent = htmlContent.replace(/%%SMART_CONTRACT_ABI%%/g, abiString);

        // 4. Return the compiled HTML directly to the browser
        // Overriding Helmet Security policies strictly for this route so MetaMask can inject window.ethereum successfully
        res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';");
        res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent);

    } catch (error) {
        console.error('❌ Mini-Site View Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error during site viewing.' });
    }
});

module.exports = router;

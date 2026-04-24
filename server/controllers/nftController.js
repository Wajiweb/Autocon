'use strict';
const mongoose = require('mongoose');
const NFT      = require('../models/NFT');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { isValidAddress } = require('../services/blockchainService');
const { incrementDeployments } = require('../services/usageService');

/** POST /api/nft/generate */
async function generateNFT(req, res) {
    const { name, symbol, maxSupply, baseURI, mintPrice, ownerAddress } = req.body;

    const safeName      = sanitize(name   || '');
    const safeSymbol    = sanitize(symbol || '').toUpperCase();
    const safeMaxSupply = String(parseInt(maxSupply) || 10000);
    const safeMintPrice = String(parseFloat(mintPrice) || 0);
    const safeBaseURI   = (baseURI || '').trim();

    if (!safeName || !safeSymbol || !ownerAddress) {
        return res.status(400).json({ success: false, error: 'name, symbol, and ownerAddress are required.' });
    }

    try {
        const className  = toClassName(safeName, 'NFTContract');
        let contractCode = readTemplate('ERC721Template.txt');
        const finalCode  = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className)
            .replace(/{{NFT_NAME}}/g,      safeName)
            .replace(/{{NFT_SYMBOL}}/g,    safeSymbol);

        const { abi, bytecode } = compileContract(finalCode, 'NFT.sol', className);

        res.json({ success: true, contractCode: finalCode, abi, bytecode, contractName: className });
    } catch (error) {
        console.error('[NFTController] generateNFT:', error.message);
        res.status(500).json({ success: false, error: error.message || 'NFT generation failed' });
    }
}

/** POST /api/nft/save */
async function saveNFT(req, res) {
    try {
        const { name, symbol, contractAddress, ownerAddress, network, maxSupply, mintPrice, baseURI, abi } = req.body;

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
            return res.status(403).json({ success: false, error: 'You can only save NFTs for your own wallet.' });
        }

        const newNFT = new NFT({
            name, symbol, contractAddress,
            ownerAddress: ownerAddress.toLowerCase(),
            network: network || 'Sepolia',
            maxSupply, mintPrice, baseURI,
            abi: abi || null,
        });
        await newNFT.save();

        // Track deployment usage (atomic, non-fatal)
        incrementDeployments(req.user.userId);

        res.status(201).json({ success: true, message: 'NFT collection saved successfully!' });
    } catch (error) {
        console.error('[NFTController] saveNFT:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save NFT' });
    }
}

/** GET /api/nft/my-nfts/:walletAddress */
async function getMyNFTs(req, res) {
    try {
        const { walletAddress } = req.params;

        if (req.user.walletAddress !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only view your own NFTs.' });
        }

        const nfts = await NFT.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
        res.json({ success: true, nfts });
    } catch (error) {
        console.error('[NFTController] getMyNFTs:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch NFTs' });
    }
}

/** DELETE /api/nft/delete/:id */
async function deleteNFT(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format.' });
        }

        const nft = await NFT.findById(id);
        if (!nft) return res.status(404).json({ success: false, error: 'NFT not found.' });
        if (req.user.walletAddress !== nft.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only delete your own NFTs.' });
        }

        await NFT.findByIdAndDelete(id);
        res.json({ success: true, message: 'NFT removed from registry.' });
    } catch (error) {
        console.error('[NFTController] deleteNFT:', error.message);
        res.status(500).json({ success: false, error: 'Failed to delete NFT.' });
    }
}

module.exports = { generateNFT, saveNFT, getMyNFTs, deleteNFT };

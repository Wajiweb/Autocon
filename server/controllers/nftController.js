'use strict';

/**
 * nftController.js
 *
 * Handles ERC-721 NFT generation, saving, retrieval, and deletion.
 * Uses asyncHandler for robust error management and delegates input
 * validation to Joi middleware.
 */

const mongoose     = require('mongoose');
const Contract     = require('../models/Contract');

const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { incrementDeployments } = require('../services/usageService');

/** POST /api/nft/generate */
const generateNFT = asyncHandler(async (req, res) => {
    const {
        name, symbol, maxSupply = 10000, baseURI = '', mintPrice = '0',
        ownerAddress,
        isBurnable = false, isEnumerable = false, isRevealed = false,
    } = req.body;

    const safeName   = sanitize(name   || '');
    const safeSymbol = sanitize(symbol || '').toUpperCase();
    const className  = toClassName(safeName, 'NFTContract');

    // ── Dynamic imports ────────────────────────────────────────────────────────
    const imports = [
        'import "@openzeppelin/contracts/token/ERC721/ERC721.sol";',
        'import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";',
        'import "@openzeppelin/contracts/access/Ownable.sol";',
        isBurnable    ? 'import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";' : '',
        isEnumerable  ? 'import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";' : '',
    ].filter(Boolean).join('\n');

    // ── Dynamic inheritance ────────────────────────────────────────────────────
    const inherits = [
        'ERC721',
        'ERC721URIStorage',
        isBurnable   ? 'ERC721Burnable'   : '',
        isEnumerable ? 'ERC721Enumerable'  : '',
        'Ownable',
    ].filter(Boolean).join(', ');

    // ── Reveal / baseURI handling ──────────────────────────────────────────────
    const revealState = isRevealed
        ? `    bool public revealed = false;\n    string private _hiddenMetadataUri;\n`
        : '';

    const baseTokenURIFn = isRevealed
        ? `
    function setRevealed(bool _revealed) public onlyOwner {
        revealed = _revealed;
    }

    function setHiddenMetadataUri(string memory _uri) public onlyOwner {
        _hiddenMetadataUri = _uri;
    }

    function _baseURI() internal view override returns (string memory) {
        if (!revealed) return _hiddenMetadataUri;
        return _baseTokenURI;
    }`
        : `
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }`;

    // ── Enumerable overrides ───────────────────────────────────────────────────
    const supportsInterfaceOverrides = isEnumerable
        ? 'ERC721, ERC721URIStorage, ERC721Enumerable'
        : 'ERC721, ERC721URIStorage';

    const updateOverrides = isEnumerable
        ? `
    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }` : '';

    const finalCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

${imports}

contract ${className} is ${inherits} {
    uint256 private _nextTokenId;
    uint256 public maxSupply = ${maxSupply};
    string private _baseTokenURI;
    uint256 public mintPrice = ${mintPrice === '0' ? '0' : `${mintPrice} ether`};
${revealState}
    constructor(
        address initialOwner,
        uint256 _maxSupply,
        string memory baseURI_,
        uint256 _mintPrice
    )
        ERC721("${safeName}", "${safeSymbol}")
        Ownable(initialOwner)
    {
        maxSupply = _maxSupply;
        _baseTokenURI = baseURI_;
        mintPrice = _mintPrice;
    }

    function safeMint(address to, string memory uri) public payable {
        require(_nextTokenId < maxSupply, "Max supply reached");
        if (msg.sender != owner()) {
            require(msg.value >= mintPrice, "Insufficient payment");
        }
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function ownerMint(address to, string memory uri) public onlyOwner {
        require(_nextTokenId < maxSupply, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
${baseTokenURIFn}
${updateOverrides}
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(${supportsInterfaceOverrides})
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
`;

    const { abi, bytecode, compilerVersion } = compileContract(finalCode, 'NFT.sol', className);

    return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, contractName: className, compilerVersion, sourceFile: 'NFT.sol' } });
});

/** POST /api/nft/save */
const saveNFT = asyncHandler(async (req, res) => {
    const { name, symbol, contractAddress, ownerAddress, network, maxSupply, mintPrice, baseURI, abi, sourceCode, compilerVersion, constructorArgs, contractName, sourceFile } = req.body;

    if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
        throw new AppError('You can only save NFTs for your own wallet.', 403, 'FORBIDDEN');
    }

    const NETWORK_MAP = { sepolia: 'Sepolia', mainnet: 'Mainnet', amoy: 'Amoy', 'polygon amoy': 'Amoy', 'bnb testnet': 'BNBTestnet', bnbtestnet: 'BNBTestnet', 'bsc testnet': 'BNBTestnet' };
    const safeNetwork = NETWORK_MAP[(network || 'sepolia').toLowerCase()] || 'Sepolia';

    const newNFT = new Contract({
        userId: req.user.userId,
        contractType: 'ERC721',
        name, symbol, contractAddress,
        ownerAddress: ownerAddress.toLowerCase(),
        network:      safeNetwork,
        abi: abi || null,
        sourceCode: sourceCode || '',
        contractName: contractName || toClassName(sanitize(name || ''), 'NFTContract'),
        sourceFile: sourceFile || 'NFT.sol',
        compilerVersion: compilerVersion || 'v0.8.20+commit.a1b79de6',
        constructorArgs: constructorArgs || '',
        metadata: { maxSupply, mintPrice, baseURI }
    });
    await newNFT.save();


    incrementDeployments(req.user.userId); // Fire and forget

    return res.status(201).json({ success: true, message: 'NFT collection saved successfully!' });
});

module.exports = { generateNFT, saveNFT };

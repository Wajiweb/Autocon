'use strict';

/**
 * auctionController.js
 *
 * Handles English Auction contract generation, saving, retrieval, and deletion.
 * Uses asyncHandler for robust error management and delegates input
 * validation to Joi middleware.
 */

const mongoose     = require('mongoose');
const Auction      = require('../models/Auction');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { incrementDeployments } = require('../services/usageService');

/** POST /api/auction/generate */
const generateAuction = asyncHandler(async (req, res) => {
    const {
        name, itemName = '', itemDescription = '',
        duration = 3600, minimumBid = '0.01', ownerAddress,
        reservePrice = '', hasExtension = false, hasAntiSnipe = false,
    } = req.body;

    const safeName = sanitize(name || '');
    const className = toClassName(safeName, 'AuctionContract');

    // ── Optional reserve price state + check ──────────────────────────────────
    const reserveState = reservePrice && parseFloat(reservePrice) > 0
        ? `    uint256 public reservePrice;\n`
        : '';
    const reserveConstructor = reservePrice && parseFloat(reservePrice) > 0
        ? `        reservePrice = ${reservePrice} ether;\n`
        : '';
    const reserveCheck = reservePrice && parseFloat(reservePrice) > 0
        ? `        require(highestBid >= reservePrice, "Reserve price not met");\n`
        : '';

    // ── Anti-snipe: extend auction on bids placed in last 5 minutes ───────────
    const antiSnipeBid = hasAntiSnipe
        ? `
        // Anti-snipe: extend auction if bid placed in last 5 minutes
        if (auctionEndTime - block.timestamp < 300) {
            auctionEndTime += 300;
            emit AuctionExtended(auctionEndTime);
        }`
        : '';
    const antiSnipeEvent = hasAntiSnipe
        ? `    event AuctionExtended(uint256 newEndTime);\n`
        : '';

    // ── extendAuction: only include if hasExtension or hasAntiSnipe ───────────
    const extendFn = (hasExtension || hasAntiSnipe) ? `
    /// @notice Extend auction time (owner only)
    function extendAuction(uint256 _extraTime) public onlyOwner {
        require(!ended, "Auction already ended");
        auctionEndTime += _extraTime;
    }
` : '';

    const finalCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ${className} is Ownable {
    // Auction Parameters
    address public beneficiary;
    uint256 public auctionEndTime;
    string public itemName;
    string public itemDescription;
${reserveState}
    // Current State
    address public highestBidder;
    uint256 public highestBid;
    uint256 public minimumBid;
    bool public ended;

    // Track pending returns for outbid bidders
    mapping(address => uint256) public pendingReturns;

    // Events
    event HighestBidIncreased(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 amount);
    event BidWithdrawn(address indexed bidder, uint256 amount);
${antiSnipeEvent}
    constructor(
        address initialOwner,
        uint256 _biddingTime,
        uint256 _minimumBid,
        string memory _itemName,
        string memory _itemDescription
    )
        Ownable(initialOwner)
    {
        beneficiary = initialOwner;
        auctionEndTime = block.timestamp + _biddingTime;
        minimumBid = _minimumBid;
        itemName = _itemName;
        itemDescription = _itemDescription;
${reserveConstructor}    }

    /// @notice Place a bid on the auction
    function bid() public payable {
        require(block.timestamp < auctionEndTime, "Auction already ended");
        require(msg.value >= minimumBid, "Bid below minimum");
        require(msg.value > highestBid, "There already is a higher bid");

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);${antiSnipeBid}
    }

    /// @notice Withdraw a bid that was outbid
    function withdraw() public returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit BidWithdrawn(msg.sender, amount);
        return true;
    }

    /// @notice End the auction and send the highest bid to the beneficiary
    function endAuction() public {
        require(block.timestamp >= auctionEndTime, "Auction not yet ended");
        require(!ended, "endAuction already called");
${reserveCheck}
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        (bool success, ) = payable(beneficiary).call{value: highestBid}("");
        require(success, "Transfer to beneficiary failed");
    }

    /// @notice Get the remaining time in seconds
    function timeLeft() public view returns (uint256) {
        if (block.timestamp >= auctionEndTime) return 0;
        return auctionEndTime - block.timestamp;
    }
${extendFn}
    /// @notice Get auction info
    function getAuctionInfo() public view returns (
        string memory _itemName,
        string memory _itemDescription,
        address _highestBidder,
        uint256 _highestBid,
        uint256 _timeLeft,
        bool _ended
    ) {
        return (itemName, itemDescription, highestBidder, highestBid, timeLeft(), ended);
    }
}
`;

    const { abi, bytecode } = compileContract(finalCode, 'Auction.sol', className);

    return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, contractName: className } });
});

/** POST /api/auction/save */
const saveAuction = asyncHandler(async (req, res) => {
    const { name, itemName, itemDescription, contractAddress, ownerAddress, network, duration, minimumBid, sourceCode, compilerVersion, constructorArgs } = req.body;

    if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
        throw new AppError('You can only save your own auctions.', 403, 'FORBIDDEN');
    }

    const newAuction = new Auction({
        name, itemName, itemDescription, contractAddress,
        ownerAddress: ownerAddress.toLowerCase(),
        network: network || 'Sepolia',
        duration, minimumBid,
        sourceCode: sourceCode || '',
        compilerVersion: compilerVersion || 'v0.8.20+commit.a1b79de6',
        constructorArgs: constructorArgs || '',
    });
    await newAuction.save();

    incrementDeployments(req.user.userId); // Fire and forget

    return res.status(201).json({ success: true, message: 'Auction saved successfully!' });
});

/** GET /api/auction/my-auctions/:walletAddress */
const getMyAuctions = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (req.user.walletAddress !== walletAddress.toLowerCase()) {
        throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const auctions = await Auction.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
    return res.json({ success: true, data: { auctions } });
});

/** DELETE /api/auction/delete/:id */
const deleteAuction = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format.', 400, 'INVALID_ID');
    }

    const auction = await Auction.findById(id);
    if (!auction) throw new AppError('Not found.', 404, 'NOT_FOUND');
    if (req.user.walletAddress !== auction.ownerAddress.toLowerCase()) {
        throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    await Auction.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Auction removed.' });
});

module.exports = { generateAuction, saveAuction, getMyAuctions, deleteAuction };

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const Token = require('./models/Token');
const { authMiddleware } = require('./middleware/auth');
const { generalLimiter, strictLimiter, authLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const gasRoutes = require('./routes/gasRoutes');
const auditRoutes = require('./routes/auditRoutes');
const nftRoutes = require('./routes/nftRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ipfsRoutes = require('./routes/ipfsRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const siteRoutes = require('./routes/siteRoutes');

const app = express();

// ─── SECURITY: Helmet (HTTP security headers) ───
app.use(helmet());

// ─── SECURITY: Strict CORS Configuration ───
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc in dev)
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight for 24h
}));

// ─── Body Parser ───
app.use(express.json({ limit: '1mb' }));

// ─── SECURITY: Rate Limiting (global) ───
app.use(generalLimiter);

// ─── MongoDB Connection ───
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(' Connected to MongoDB Atlas!'))
    .catch((err) => console.error(' MongoDB Connection Error:', err));

// ─── PUBLIC ROUTES ───
app.get('/api/health', (req, res) => {
    res.json({ message: "AutoCon Backend is Alive and Running!" });
});

// ─── AUTH ROUTES (with brute-force protection) ───
app.use('/api/auth', authLimiter, authRoutes);

// ─── TOKEN ROUTES ───
app.use('/api/token', tokenRoutes);

// ─── GET SINGLE DEPLOYMENT (Token, NFT, or Auction) by ID for Contract X-Ray ───
const NFT = require('./models/NFT');
const Auction = require('./models/Auction');

app.get('/api/deployments/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format.' });
    }
    try {
        // Search across all three models
        let doc = await Token.findById(id);
        let docType = 'ERC-20';
        if (!doc) { doc = await NFT.findById(id); docType = 'ERC-721'; }
        if (!doc) { doc = await Auction.findById(id); docType = 'Auction'; }

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Deployment not found.' });
        }

        // Ownership check
        if (req.user.walletAddress !== doc.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Unauthorized.' });
        }

        res.json({
            success: true,
            deployment: {
                _id: doc._id,
                name: doc.name,
                contractAddress: doc.contractAddress,
                type: docType,
                abi: doc.abi || null
            }
        });
    } catch (err) {
        console.error('Deployment fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch deployment.' });
    }
});

// ─── GAS & AUDIT ROUTES ───
app.use('/api', gasRoutes);
app.use('/api', auditRoutes);

// ─── NFT ROUTES ───
app.use('/api/nft', nftRoutes);

// ─── AUCTION ROUTES ───
app.use('/api/auction', auctionRoutes);

// ─── CHAT ROUTES ───
app.use('/api/chat', chatRoutes);

// ─── IPFS/UPLOAD ROUTES ───
app.use('/api/ipfs', ipfsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── VERIFY ROUTES ───
app.use('/api/verify', verifyRoutes); // Etherscan verification

// ─── SITE GENERATION ───
app.use('/api/site', siteRoutes); // Mini-Site generator

// ─── Global error handler ───
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, error: 'CORS: Origin not allowed.' });
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
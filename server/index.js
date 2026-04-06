const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const solc = require('solc');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const Token = require('./models/Token');
const { authMiddleware } = require('./middleware/auth');
const { generalLimiter, strictLimiter, authLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
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

// ─── TOKEN GENERATION (strict rate limit, auth required) ───
app.post('/api/generate-token', strictLimiter, authMiddleware, (req, res) => {
    console.log("--- Compiling Contract ---");
    const { name, symbol, supply, ownerAddress } = req.body;

    // Input sanitization
    const sanitize = (str) => str.replace(/[^a-zA-Z0-9\s]/g, '');
    const safeName = sanitize(name || '');
    const safeSymbol = sanitize(symbol || '').toUpperCase();
    const safeSupply = String(parseInt(supply) || 1000000);

    if (!safeName || !safeSymbol || !ownerAddress) {
        return res.status(400).json({ success: false, error: 'name, symbol, supply, and ownerAddress are required.' });
    }

    try {
        const templatePath = path.join(__dirname, 'templates', 'ERC20Template.txt');
        let contractCode = fs.readFileSync(templatePath, 'utf8');
        const className = safeName.replace(/\s+/g, '');

        let finalCode = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className)
            .replace(/{{TOKEN_NAME}}/g, safeName)
            .replace(/{{TOKEN_SYMBOL}}/g, safeSymbol)
            .replace(/{{SUPPLY}}/g, safeSupply)
            .replace(/{{IMPORT_BURNABLE}}/g, "").replace(/{{IMPORT_PAUSABLE}}/g, "")
            .replace(/{{INHERIT_BURNABLE}}/g, "").replace(/{{INHERIT_PAUSABLE}}/g, "")
            .replace(/{{FUNCTION_MINT}}/g, "").replace(/{{FUNCTION_PAUSE}}/g, "");

        const input = {
            language: 'Solidity',
            sources: { 'Token.sol': { content: finalCode } },
            settings: {
                outputSelection: {
                    '*': { '*': ['abi', 'evm.bytecode.object'] },
                    '':  { '': ['ast'] }
                }
            }
        };

        function findImports(importPath) {
            try {
                if (importPath.startsWith('@openzeppelin/')) {
                    const actualPath = path.resolve(__dirname, 'node_modules', importPath);
                    return { contents: fs.readFileSync(actualPath, 'utf8') };
                }
                return { error: 'File not found' };
            } catch (e) {
                return { error: 'File not found: ' + e.message };
            }
        }

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

        if (output.errors) {
            const errors = output.errors.filter(error => error.severity === 'error');
            if (errors.length > 0) {
                console.error("COMPILATION ERRORS:", errors);
                return res.status(500).json({ success: false, error: "Solidity Compilation Failed" });
            }
        }

        const contractData = output.contracts['Token.sol'][className];
        const fileName     = Object.keys(output.sources ?? {})[0];
        const ast          = output.sources?.[fileName]?.ast ?? null;

        res.json({
            success: true,
            contractCode: finalCode,
            abi: contractData.abi,
            bytecode: contractData.evm.bytecode.object,
            ast
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ success: false, error: "Generation failed" });
    }
});

// ─── SAVE TOKEN (auth required) ───
app.post('/api/save-token', authMiddleware, async (req, res) => {
    try {
        const { name, symbol, contractAddress, ownerAddress, network, abi } = req.body;

        // Validate required fields
        if (!name || !symbol || !contractAddress || !ownerAddress) {
            return res.status(400).json({ success: false, error: 'name, symbol, contractAddress, and ownerAddress are required.' });
        }

        // Validate Ethereum address formats
        if (!ethers.isAddress(contractAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid contract address format.' });
        }
        if (!ethers.isAddress(ownerAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid owner address format.' });
        }

        // Authorization: user can only save tokens for their own wallet
        if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only save tokens for your own wallet.' });
        }

        const newToken = new Token({ name, symbol, contractAddress, ownerAddress: ownerAddress.toLowerCase(), network: network || 'Sepolia', abi: abi || null });
        await newToken.save();

        console.log(`💾 Saved ${name} to database!`);
        res.status(201).json({ success: true, message: 'Token saved successfully!' });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, error: "Failed to save token" });
    }
});

// ─── FETCH USER TOKENS (auth required) ───
app.get('/api/my-tokens/:walletAddress', authMiddleware, async (req, res) => {
    try {
        const { walletAddress } = req.params;

        // Authorization: user can only view their own tokens
        if (req.user.walletAddress !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only view your own tokens.' });
        }

        // SECURITY FIX: Use direct lowercase match instead of $regex to prevent injection
        const userTokens = await Token.find({
            ownerAddress: walletAddress.toLowerCase()
        }).sort({ createdAt: -1 });

        res.json({ success: true, tokens: userTokens });

    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch tokens" });
    }
});

// ─── DELETE TOKEN (auth required + authorization) ───
app.delete('/api/delete-token/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // SECURITY FIX: Validate ObjectId format to prevent CastError crashes
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format.' });
        }

        // Find the token first to check ownership
        const token = await Token.findById(id);
        if (!token) {
            return res.status(404).json({ success: false, error: 'Token not found.' });
        }

        // Authorization: user can only delete their own tokens
        if (req.user.walletAddress !== token.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only delete your own tokens.' });
        }

        await Token.findByIdAndDelete(id);

        console.log(`🗑️ Token ${id} deleted from database.`);
        res.json({ success: true, message: "Deployment removed from registry." });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, error: "Failed to delete token." });
    }
});

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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
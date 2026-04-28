const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const mongoose = require('mongoose');
// Legacy models (kept for backward compatibility during migration)
const Token = require('./models/Token');
// New unified models
const Contract = require('./models/Contract');
const { authMiddleware } = require('./middleware/auth');
const { generalLimiter, strictLimiter, authLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const gasRoutes = require('./routes/gasRoutes');
const auditRoutes = require('./routes/auditRoutes');
const nftRoutes = require('./routes/nftRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ipfsRoutes = require('./routes/ipfsRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const siteRoutes    = require('./routes/siteRoutes');
const compileRoutes = require('./routes/compileRoutes');
const jobRoutes     = require('./routes/jobRoutes');
const userRoutes    = require('./routes/userRoutes');
const aiRoutes      = require('./routes/aiRoutes');
const landingRoutes = require('./routes/landingRoutes');
const Sentry        = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const app = express();

// Initialize Sentry before any routes or middleware
Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    integrations: [
        nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0, 
    profilesSampleRate: 1.0, 
});

// Sentry Request Handler (must be the first middleware)
Sentry.setupExpressErrorHandler(app);
// ─── SECURITY: Helmet (HTTP security headers) ───
app.use(helmet());

// ─── SECURITY: Strict CORS Configuration ───
const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:5173,http://127.0.0.1:5173'
)
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

// ─── LANDING PAGE ROUTES (public — no auth) ───
app.use('/api/landing', landingRoutes);

// ─── AUTH ROUTES (with brute-force protection) ───
app.use('/api/auth', authLimiter, authRoutes);

// ─── TOKEN ROUTES ───
app.use('/api/token', tokenRoutes);

// ─── GET SINGLE DEPLOYMENT by ID for Contract X-Ray ───
// Updated: uses unified Contract model first, falls back to legacy models
const NFT = require('./models/NFT');
const Auction = require('./models/Auction');

app.get('/api/deployments/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format.' });
    }
    try {
        // Primary: check unified Contract collection
        let doc = await Contract.findById(id).lean();
        let docType = doc?.contractType || null;

        // Fallback to legacy collections during migration period
        if (!doc) { doc = await Token.findById(id).lean(); docType = 'ERC-20'; }
        if (!doc) { doc = await NFT.findById(id).lean(); docType = 'ERC-721'; }
        if (!doc) { doc = await Auction.findById(id).lean(); docType = 'Auction'; }

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Deployment not found.' });
        }

        const ownerAddr = doc.ownerAddress;
        if (req.user.walletAddress !== ownerAddr.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Unauthorized.' });
        }

        res.json({
            success: true,
            deployment: {
                _id: doc._id,
                name: doc.name,
                contractAddress: doc.contractAddress,
                type: docType,
                network: doc.network,
                verified: doc.verified || false,
                abi: doc.abi || null,
            }
        });
    } catch (err) {
        console.error('Deployment fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch deployment.' });
    }
});

// ─── GAS & AUDIT ROUTES ───
app.use('/api/nft', nftRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api', auditRoutes);

// ─── CHAT ROUTES ───
app.use('/api/chat', chatRoutes);

// ─── IPFS/UPLOAD ROUTES ───
app.use('/api/ipfs', ipfsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── VERIFY ROUTES ───
app.use('/api/verify', verifyRoutes); // Etherscan verification

// ─── AI ASSISTANT ROUTES ───
app.use('/api/ai', aiRoutes);

// ─── SITE GENERATION ───
app.use('/api/site', siteRoutes); // Mini-Site generator

// ─── COMPILE ROUTE ───
app.use('/api/compile', compileRoutes);

// ─── JOB QUEUE ROUTES ───
app.use('/api/jobs', jobRoutes);

// ─── USER PROFILE + ADMIN ROUTES ───
app.use('/api/user',  userRoutes);
app.use('/api/admin', userRoutes); // Admin sub-routes live inside userRoutes

// ─── Global error handler (centralized — must be last) ───
app.use(errorHandler);

// ─── Unhandled Promise Rejection Handler ───
process.on('unhandledRejection', (reason, promise) => {
    console.error('[UnhandledPromiseRejection]', reason);
    // In production, could alert via Sentry
    if (process.env.NODE_ENV === 'production') {
        const Sentry = require('@sentry/node');
        Sentry.captureException(reason);
    }
});

process.on('uncaughtException', (err) => {
    console.error('[UncaughtException]', err.message);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

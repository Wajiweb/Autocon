const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const mongoose = require('mongoose');
const Contract = require('./models/Contract');
const { authMiddleware } = require('./middleware/auth');
const { generalLimiter, strictLimiter, authLimiter, perWalletAuthLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const timeout = require('./middleware/timeout');
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
const healthRoutes  = require('./routes/healthRoutes');
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
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = new Set(
    (
        process.env.ALLOWED_ORIGINS ||
        'http://localhost:5173,http://127.0.0.1:5173'
    )
        .split(',')
        .map(origin => origin.trim().replace(/\/$/, ''))
        .filter(Boolean)
);

const isPrivateDevOrigin = (origin) => {
    if (isProduction) return false;

    try {
        const { protocol, hostname } = new URL(origin);
        if (!['http:', 'https:'].includes(protocol)) return false;

        return (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
        );
    } catch {
        return false;
    }
};

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc in dev)
        if (!origin && !isProduction) {
            return callback(null, true);
        }
        const normalizedOrigin = origin?.replace(/\/$/, '');
        if (allowedOrigins.has(normalizedOrigin) || isPrivateDevOrigin(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.warn(`CORS rejected origin: ${origin || 'unknown'}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight for 24h
}));

/* Phase 5: raised limit 1mb→5mb — Solidity source+ABI+bytecode can exceed 1MB */
app.use(express.json({ limit: '5mb' }));

// ─── SECURITY: Rate Limiting (global) ───
app.use(generalLimiter);

// ─── PRODUCTION: Request Timeout (prevents hanging requests) ───
app.use(timeout(15000)); // 15 second timeout for all requests

// ─── MongoDB Connection ───
const Job = require('./models/Job');

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds

async function connectWithRetry(retries = MAX_RETRIES) {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ Connected to MongoDB Atlas!');
        
        // Ensure Job collection indexes are created
        await Job.ensureIndexes();
        console.log('✅ Job indexes ensured.');
        
        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully!');
        });
        
        mongoose.connection.on('error', (err) => {
            console.error(' MongoDB connection error:', err.message);
        });
        
    } catch (err) {
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        
        if (retries > 0) {
            console.log(`🔄 Retrying connection in ${RETRY_DELAY/1000}s... (${retries} attempts left)`);
            setTimeout(() => connectWithRetry(retries - 1), RETRY_DELAY);
        } else {
            console.error('❌ Failed to connect to MongoDB after maximum retries. Please check:');
            console.error('   1. Your IP is whitelisted in MongoDB Atlas (0.0.0.0/0)');
            console.error('   2. Your MONGO_URI in .env is correct');
            console.error('   3. Your internet connection is stable');
            process.exit(1);
        }
    }
}

connectWithRetry();

// ─── HEALTH CHECK ROUTES (comprehensive monitoring) ───
app.use('/api', healthRoutes);

// ─── LANDING PAGE ROUTES (public — no auth) ───
app.use('/api/landing', landingRoutes);

// ─── AUTH ROUTES (with brute-force protection) ───
app.use('/api/auth', authLimiter, perWalletAuthLimiter, authRoutes);

// ─── TOKEN ROUTES ───
app.use('/api/token', tokenRoutes);

// ─── GAS ESTIMATION ROUTES ───
app.use('/api', gasRoutes); // Mounts POST /api/estimate-gas

// ─── GET SINGLE DEPLOYMENT by ID for Contract X-Ray ───
// Updated: uses unified Contract model

app.get('/api/deployments/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format.' });
    }
    try {
        // Primary: check unified Contract collection
        let doc = await Contract.findById(id).lean();
        let docType = doc?.contractType || null;

        // Fallback to legacy collections removed during Phase 2 migration

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Deployment not found.' });
        }

        /* Phase 5: normalize ownerAddr to lowercase — MetaMask returns checksummed
           addresses; auth.js stores lowercase. Without this, legitimate owners
           could get a false 403 depending on how address was saved to DB. */
        const ownerAddr = (doc.ownerAddress || '').toLowerCase();
        if (req.user.walletAddress !== ownerAddr) {
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

// ─── CONTRACTS ROUTES ───
app.use('/api/contracts', require('./routes/contractRoutes'));

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

'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { uploadFile, uploadMetadata } = require('../controllers/upload.controller');

// Configure multer for local temp storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, ''));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|svg/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files are allowed.'));
    }
});

/**
 * POST /api/ipfs/upload-file
 * Uploads a physical file to Pinata IPFS and returns the CID/URL.
 */
router.post('/upload-file', authMiddleware, upload.single('file'), uploadFile);

/**
 * POST /api/ipfs/upload-metadata
 * Uploads metadata JSON to Pinata IPFS and returns the tokenURI.
 */
router.post('/upload-metadata', authMiddleware, uploadMetadata);

// Multer error handler
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'File too large. Maximum size is 10 MB.' });
    }
    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
});

module.exports = router;

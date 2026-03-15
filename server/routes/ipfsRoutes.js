const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = crypto.randomBytes(8).toString('hex') + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|svg/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files (jpg, png, gif, webp, svg) are allowed.'));
    }
});

/**
 * POST /api/ipfs/upload
 * Uploads an image to the server.
 * If Pinata API keys are configured, it also pins to IPFS.
 * Otherwise, returns a local URL for development.
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded.' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        let ipfsHash = null;
        let ipfsUrl = null;

        // If Pinata keys are set, pin to IPFS
        const pinataKey = process.env.PINATA_API_KEY;
        const pinataSecret = process.env.PINATA_SECRET_KEY;

        if (pinataKey && pinataSecret) {
            try {
                const FormData = (await import('form-data')).default;
                const formData = new FormData();
                formData.append('file', fs.createReadStream(req.file.path));

                const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                    method: 'POST',
                    headers: {
                        'pinata_api_key': pinataKey,
                        'pinata_secret_api_key': pinataSecret,
                        ...formData.getHeaders()
                    },
                    body: formData
                });

                const pinataData = await pinataRes.json();
                if (pinataData.IpfsHash) {
                    ipfsHash = pinataData.IpfsHash;
                    ipfsUrl = `ipfs://${ipfsHash}`;
                    console.log(`📌 Pinned to IPFS: ${ipfsHash}`);
                }
            } catch (pinataErr) {
                console.error('Pinata upload failed (using local fallback):', pinataErr.message);
            }
        }

        console.log(`📁 File uploaded: ${req.file.filename}`);

        res.json({
            success: true,
            file: {
                filename: req.file.filename,
                localUrl: fileUrl,
                ipfsHash,
                ipfsUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Upload failed.' });
    }
});

// Multer error handler — catches file-too-large, invalid-type, etc.
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

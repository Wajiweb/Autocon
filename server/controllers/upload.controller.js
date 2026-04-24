'use strict';
const fs = require('fs');
const { pinFileToIPFS, pinJSONToIPFS } = require('../services/ipfs.service');

/**
 * PHASE 1: Uploads a physical asset (image) to IPFS.
 * Route: POST /api/ipfs/upload-file
 */
async function uploadFile(req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file provided for upload.' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    try {
        const fileCID = await pinFileToIPFS(filePath, originalName);
        const fileUrl = `ipfs://${fileCID}`;

        // Cleanup local file
        try { fs.unlinkSync(filePath); } catch (e) { }

        res.json({ success: true, fileCID, fileUrl });
    } catch (error) {
        try { fs.unlinkSync(filePath); } catch (e) { }
        console.error('[UploadController] File Upload Error:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Failed to upload file to IPFS.' });
    }
}

/**
 * PHASE 3: Uploads metadata JSON to IPFS.
 * Route: POST /api/ipfs/upload-metadata
 */
async function uploadMetadata(req, res) {
    const { metadata } = req.body;
    if (!metadata) {
        return res.status(400).json({ success: false, error: 'No metadata JSON provided.' });
    }

    try {
        const name = metadata.name || 'metadata';
        const metadataCID = await pinJSONToIPFS(metadata, `${name.replace(/\s+/g, '_')}_metadata.json`);
        const tokenURI = `ipfs://${metadataCID}`;

        res.json({ success: true, metadataCID, tokenURI });
    } catch (error) {
        console.error('[UploadController] Metadata Upload Error:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Failed to upload metadata to IPFS.' });
    }
}

module.exports = { uploadFile, uploadMetadata };

'use strict';
const fs = require('fs');
const { pinFileToIPFS, pinJSONToIPFS } = require('../services/ipfs.service');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const MAX_METADATA_SIZE = 10 * 1024; // 10KB max metadata JSON

/**
 * PHASE 1: Uploads a physical asset (image) to IPFS.
 * Route: POST /api/ipfs/upload-file
 */
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file provided for upload.', 400, 'BAD_REQUEST');
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    try {
        const fileCID = await pinFileToIPFS(filePath, originalName);
        const fileUrl = `ipfs://${fileCID}`;

        // Cleanup local file
        try { fs.unlinkSync(filePath); } catch (e) { }

        return res.json({ success: true, fileCID, fileUrl });
    } catch (error) {
        try { fs.unlinkSync(filePath); } catch (e) { }
        throw new AppError(error.message || 'Failed to upload file to IPFS.', 500, 'IPFS_UPLOAD_FAILED');
    }
});

/**
 * PHASE 3: Uploads metadata JSON to IPFS.
 * Route: POST /api/ipfs/upload-metadata
 */
const uploadMetadata = asyncHandler(async (req, res) => {
    const { metadata } = req.body;
    if (!metadata) {
        throw new AppError('No metadata JSON provided.', 400, 'BAD_REQUEST');
    }

    // Validate metadata structure and size
    if (typeof metadata !== 'object' || metadata === null) {
        throw new AppError('Metadata must be a valid JSON object.', 400, 'INVALID_METADATA');
    }

    const metadataString = JSON.stringify(metadata);
    if (metadataString.length > MAX_METADATA_SIZE) {
        throw new AppError(`Metadata too large. Maximum ${MAX_METADATA_SIZE / 1024}KB allowed.`, 400, 'METADATA_TOO_LARGE');
    }

    // Prevent prototype pollution
    if (Object.prototype.hasOwnProperty.call(metadata, '__proto__') || 
        Object.prototype.hasOwnProperty.call(metadata, 'constructor') ||
        Object.prototype.hasOwnProperty.call(metadata, 'prototype')) {
        throw new AppError('Invalid metadata: reserved properties not allowed.', 400, 'INVALID_METADATA');
    }

    try {
        const name = metadata.name || 'metadata';
        const metadataCID = await pinJSONToIPFS(metadata, `${name.replace(/\s+/g, '_')}_metadata.json`);
        const tokenURI = `ipfs://${metadataCID}`;

        return res.json({ success: true, metadataCID, tokenURI });
    } catch (error) {
        throw new AppError(error.message || 'Failed to upload metadata to IPFS.', 500, 'IPFS_METADATA_UPLOAD_FAILED');
    }
});

module.exports = { uploadFile, uploadMetadata };

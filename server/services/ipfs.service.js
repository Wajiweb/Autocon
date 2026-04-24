'use strict';
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { withRetry } = require('../utils/retry');

const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Uploads a physical file stream to Pinata IPFS.
 * @param {string} filePath - Path to the local file to upload.
 * @param {string} originalName - Original filename for Pinata metadata.
 * @returns {Promise<string>} The IPFS CID (e.g. "Qm...")
 */
async function pinFileToIPFS(filePath, originalName) {
    if (!PINATA_JWT) throw new Error('PINATA_JWT is not configured in the backend.');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const pinataMetadata = JSON.stringify({ name: originalName });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', pinataOptions);

    try {
        const res = await withRetry(async () => {
            return await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${PINATA_JWT}`
                }
            });
        }, 3, 1000);
        return res.data.IpfsHash;
    } catch (error) {
        console.error('[IPFSService] pinFileToIPFS Error:', error.response?.data || error.message);
        throw new Error('Failed to upload file to IPFS.');
    }
}

/**
 * Uploads a JSON metadata object to Pinata IPFS.
 * @param {Object} jsonBody - The metadata object (name, description, image URI, etc.)
 * @param {string} metadataName - Name of the metadata file in Pinata dashboard.
 * @returns {Promise<string>} The IPFS CID (e.g. "Qm...")
 */
async function pinJSONToIPFS(jsonBody, metadataName = 'metadata.json') {
    if (!PINATA_JWT) throw new Error('PINATA_JWT is not configured in the backend.');

    const payload = {
        pinataMetadata: { name: metadataName },
        pinataContent: jsonBody
    };

    try {
        const res = await withRetry(async () => {
            return await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PINATA_JWT}`
                }
            });
        }, 3, 1000);
        return res.data.IpfsHash;
    } catch (error) {
        console.error('[IPFSService] pinJSONToIPFS Error:', error.response?.data || error.message);
        throw new Error('Failed to upload metadata to IPFS.');
    }
}

module.exports = { pinFileToIPFS, pinJSONToIPFS };

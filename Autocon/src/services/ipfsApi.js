import { API_BASE } from '../config';

/**
 * Uploads a physical asset (image) to IPFS via the backend.
 * @param {Function} authFetch - Authenticated fetch client from AuthContext.
 * @param {File} file - The file to upload.
 * @returns {Promise<{ success: boolean, fileCID: string, fileUrl: string }>}
 */
export async function uploadFileToIPFS(authFetch, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authFetch('/api/ipfs/upload-file', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload image file to IPFS.');
  }

  return data;
}

/**
 * Uploads metadata JSON to IPFS via the backend.
 * @param {Function} authFetch - Authenticated fetch client from AuthContext.
 * @param {Object} metadata - The JSON metadata object.
 * @returns {Promise<{ success: boolean, metadataCID: string, tokenURI: string }>}
 */
export async function uploadMetadataToIPFS(authFetch, metadata) {
  const response = await authFetch('/api/ipfs/upload-metadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metadata }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload metadata to IPFS.');
  }

  return data;
}

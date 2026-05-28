import { API_BASE } from '../config';

const COMPILE_ENDPOINTS = {
  ERC20: '/api/token/generate-token',
  ERC721: '/api/nft/generate',
  Auction: '/api/auction/generate'
};

const SAVE_ENDPOINTS = {
  ERC20: '/api/token/save-token',
  ERC721: '/api/nft/save',
  Auction: '/api/auction/save'
};

/**
 * Compiles a contract based on configuration parameters.
 */
export async function compileContract(authFetch, type, params) {
  const endpoint = COMPILE_ENDPOINTS[type];
  if (!endpoint) throw new Error(`Unsupported contract type: ${type}`);

  // Use a dummy address for initial compilation if wallet not connected yet, to preview code
  const bodyParams = {
    ...params,
    ownerAddress: params.ownerAddress || '0x0000000000000000000000000000000000000001'
  };

  const res = await authFetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(bodyParams)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Compilation failed');
  }
  return data.data;
}

/**
 * Persists a deployed contract to the user registry.
 */
export async function saveContract(authFetch, type, payload) {
  const endpoint = SAVE_ENDPOINTS[type];
  if (!endpoint) throw new Error(`Unsupported contract type: ${type}`);

  const res = await authFetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to save contract');
  }
  return data;
}

/**
 * Deletes a contract from the registry by ID.
 */
export async function deleteContract(authFetch, id) {
  const res = await authFetch(`${API_BASE}/api/contracts/delete/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete contract');
  }
  return data;
}

/**
 * Fetches all registry deployments for a specific wallet address.
 */
export async function getMyContracts(authFetch, walletAddress) {
  const res = await authFetch(`${API_BASE}/api/contracts/my-contracts/${walletAddress}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch contracts');
  }
  return data.data || [];
}

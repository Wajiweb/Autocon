import { create } from 'zustand';

/**
 * useTransactionStore
 *
 * Global Zustand store for tracking the active deployment transaction.
 *
 * This is the single source of truth for tx state across all three
 * generator hooks (useWeb3, useNFT, useAuction). Components can
 * subscribe to this store without prop-drilling through pages.
 *
 * States:
 *   idle       — no active transaction
 *   pending    — MetaMask popup open, waiting for user signature
 *   submitted  — tx hash received, tx in mempool
 *   confirmed  — tx mined, at least 1 block confirmation
 *   failed     — user rejected or on-chain error
 *
 * Data flow:
 *   deployContract() → setStatus/setTxHash → DeploymentStatusBar reads store
 */
export const useTransactionStore = create((set) => ({
    // ── State ──────────────────────────────────────────────────────────────────
    status:          'idle',  // 'idle' | 'pending' | 'submitted' | 'confirmed' | 'failed'
    step:            -1,      // -1, 0, 1, 2, 3, 4
    errorStep:       -1,
    errorMessage:    '',
    txHash:          null,    // on-chain transaction hash (0x...)
    contractAddress: null,    // deployed contract address (set on confirmed)
    receipt:         null,    // transaction receipt object
    provider:        null,    // ethers provider instance used for deployment
    network:         null,    // network name string (for building explorer URL)
    error:           null,    // human-readable error string

    // ── Actions ────────────────────────────────────────────────────────────────

    /** Set timeline step */
    setStep: (step) => set({ step }),

    /** Record error step in timeline */
    setErrorStep: (errorStep, errorMessage) => set({ errorStep, errorMessage, status: 'failed' }),

    /** Set the lifecycle status */
    setStatus: (status) => set({ status }),

    /** Record the tx hash when MetaMask approves */
    setTxHash: (txHash) => set({ txHash, status: 'submitted' }),

    /** Record the deployed contract address on confirmation */
    setConfirmed: (contractAddress, receipt = null, provider = null) => 
        set({ status: 'confirmed', contractAddress, receipt, provider, step: 4 }),

    /** Record a failure with a message */
    setError: (error) => set({ status: 'failed', error }),

    /** Store the active network name (for explorer link generation) */
    setNetwork: (network) => set({ network }),

    /**
     * Full reset — always call this BEFORE starting a new deployment
     * to prevent stale state from a previous deploy showing in the UI.
     */
    resetTransaction: () => set({
        status:          'idle',
        step:            -1,
        errorStep:       -1,
        errorMessage:    '',
        txHash:          null,
        contractAddress: null,
        receipt:         null,
        provider:        null,
        error:           null,
        // Keep network — user hasn't changed it
    }),
}));

// ── Selector Helpers (use these in components for perf) ───────────────────────

/** Returns true only when a tx is in-flight (prevents duplicate deploy clicks) */
export const selectIsDeploying = (s) =>
    (s.step >= 0 && s.status !== 'confirmed' && s.status !== 'failed' && s.errorStep === -1) || s.status === 'pending' || s.status === 'submitted';

/** Build the block explorer tx URL for the active transaction */
export const selectExplorerUrl = (s) => {
    if (!s.txHash || !s.network) return null;
    const base = explorerBaseUrl(s.network);
    return base ? `${base}/tx/${s.txHash}` : null;
};

/** Build the block explorer contract URL */
export const selectContractUrl = (s) => {
    if (!s.contractAddress || !s.network) return null;
    const base = explorerBaseUrl(s.network);
    return base ? `${base}/address/${s.contractAddress}` : null;
};

function explorerBaseUrl(network) {
    const n = (network || '').toLowerCase();
    if (n.includes('sepolia'))    return 'https://sepolia.etherscan.io';
    if (n.includes('mainnet'))    return 'https://etherscan.io';
    if (n.includes('amoy'))       return 'https://amoy.polygonscan.com';
    if (n.includes('bnb') || n.includes('bsc')) return 'https://testnet.bscscan.com';
    return null;
}

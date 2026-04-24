import { useState, useCallback } from 'react';

/**
 * useTxTracker
 *
 * Tracks the lifecycle of an on-chain transaction submitted through ethers.js.
 *
 * States:  idle → pending → success | failed
 *
 * Usage:
 *   const { txState, trackTx, resetTx } = useTxTracker();
 *
 *   // After submitting a tx:
 *   const txResponse = await signer.sendTransaction(...);
 *   trackTx(txResponse);
 *
 * Returns:
 *   txState: { status, txHash, receipt, error, blockNumber, gasUsed }
 */
export function useTxTracker() {
    const [txState, setTxState] = useState({
        status:      'idle',    // idle | pending | success | failed
        txHash:      null,
        receipt:     null,
        blockNumber: null,
        gasUsed:     null,
        error:       null,
    });

    /**
     * Start tracking a submitted ethers.js TransactionResponse.
     * Waits for 1 confirmation then resolves state.
     *
     * @param {ethers.TransactionResponse} txResponse
     */
    const trackTx = useCallback(async (txResponse) => {
        if (!txResponse?.hash) return;

        setTxState({
            status:  'pending',
            txHash:  txResponse.hash,
            receipt: null, blockNumber: null, gasUsed: null, error: null,
        });

        try {
            // Wait for 1 on-chain confirmation
            const receipt = await txResponse.wait(1);

            // ethers v6: status 1 = success, 0 = reverted
            if (receipt.status === 1) {
                setTxState({
                    status:      'success',
                    txHash:      txResponse.hash,
                    receipt,
                    blockNumber: Number(receipt.blockNumber),
                    gasUsed:     Number(receipt.gasUsed),
                    error:       null,
                });
            } else {
                setTxState(prev => ({
                    ...prev,
                    status: 'failed',
                    error:  'Transaction was reverted on-chain.',
                }));
            }
        } catch (err) {
            // Detect user rejection vs on-chain failure
            const isRejected = err?.code === 'ACTION_REJECTED' || err?.code === 4001;
            setTxState(prev => ({
                ...prev,
                status: 'failed',
                error:  isRejected ? 'Transaction rejected by wallet.' : (err.reason || err.message || 'Transaction failed.'),
            }));
        }
    }, []);

    const resetTx = useCallback(() => {
        setTxState({ status: 'idle', txHash: null, receipt: null, blockNumber: null, gasUsed: null, error: null });
    }, []);

    return { txState, trackTx, resetTx };
}

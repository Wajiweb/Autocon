/**
 * classifyError — translates raw ethers/wallet errors into human-readable messages.
 * @param {Error|object} err
 * @returns {string}
 */
export function classifyError(err) {
  if (!err) return 'Unknown error.';
  // MetaMask user rejection
  if (err.code === 4001) return 'Transaction rejected in wallet.';
  // Internal JSON-RPC error
  if (err.code === -32603) return 'Network error — check your RPC connection.';
  // Timeout injected by deployWithTimeout
  if (err.message === 'Deployment timed out.') return 'Deployment timed out after 90s. Check MetaMask and your RPC.';
  // Revert reason from contract
  if (err.reason) return err.reason;
  // Generic message
  if (err.message) return err.message;
  return 'Unknown error.';
}

/** Wraps any async deploy function in a 90-second hard timeout. */
export const TIMEOUT_MS = 90_000;

export function deployWithTimeout(deployFn) {
  return Promise.race([
    deployFn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Deployment timed out.')), TIMEOUT_MS)
    )
  ]);
}

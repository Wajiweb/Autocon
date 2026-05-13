/**
 * classifyError — translates raw ethers/wallet errors into human-readable messages.
 * Phase 4: added wallet disconnect (4900), locked wallet (4100), chain mismatch (4902)
 * Skill citations: security-auditor (trace data flow, adversarial analysis), fp-async (clean error recovery)
 * @param {Error|object} err
 * @returns {string}
 */
export function classifyError(err) {
  if (!err) return 'Unknown error.';
  // MetaMask user rejection
  if (err.code === 4001) return 'Transaction rejected in wallet.';
  // Wallet disconnected from all chains (EIP-1193)
  if (err.code === 4900) return 'Wallet disconnected. Please reconnect MetaMask and try again.';
  // Wallet locked or no accounts authorised
  if (err.code === 4100) return 'Wallet is locked. Please unlock MetaMask and try again.';
  // Chain not added / unsupported
  if (err.code === 4902) return 'Network not found in MetaMask. Add the network and try again.';
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

/**
 * walletGuard — Phase 4 security fix.
 * Validates that MetaMask (or any EIP-1193 provider) is available before
 * attempting a deploy. Prevents the opaque BrowserProvider(undefined) crash.
 * security-auditor: "Never trusts user input; validates at multiple layers."
 * @returns {{ ok: boolean, error?: string }}
 */
export function walletGuard() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return { ok: false, error: 'MetaMask not found. Please install MetaMask and try again.' };
  }
  return { ok: true };
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

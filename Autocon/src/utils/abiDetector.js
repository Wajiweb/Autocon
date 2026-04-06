/**
 * abiDetector — auto-detects high-value write functions from a contract ABI.
 * Priority list drives order: mint, burn, pause, etc.
 * Falls back to all nonpayable write functions if no priority matches.
 */

const PRIORITY = ['mint', 'burn', 'pause', 'unpause', 'transferOwnership', 'setBaseURI', 'reveal'];

export function detectQuickActions(abi) {
  if (!abi || !Array.isArray(abi)) return [];

  const isWrite = fn =>
    fn.type === 'function' &&
    ['nonpayable', 'payable'].includes(fn.stateMutability);

  const prioritized = abi
    .filter(fn => isWrite(fn) && PRIORITY.includes(fn.name))
    .sort((a, b) => PRIORITY.indexOf(a.name) - PRIORITY.indexOf(b.name));

  if (prioritized.length > 0) return prioritized;

  // Fallback: all write functions (exclude view/pure)
  return abi.filter(fn => isWrite(fn));
}

export function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

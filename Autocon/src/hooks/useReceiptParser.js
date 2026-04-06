import { ethers } from 'ethers';

/**
 * parseReceipt — decodes a transaction receipt into a plain-English story array.
 * @param {object} receipt  - ethers TransactionReceipt
 * @param {Array}  abi      - contract ABI array
 * @param {object} provider - ethers Provider
 * @returns {Promise<Array>} steps array
 */
export async function parseReceipt(receipt, abi, provider) {
  const iface = new ethers.Interface(abi);

  // Step 1 — broadcast
  const step1 = {
    label: 'Transaction broadcast',
    value: receipt.hash,
    type:  'hash'
  };

  // Step 2 — block confirmed
  let timestamp = null;
  try {
    const block = await provider.getBlock(receipt.blockNumber);
    timestamp   = block?.timestamp
      ? new Date(block.timestamp * 1000).toLocaleString()
      : null;
  } catch { /* non-critical */ }

  const step2 = {
    label: 'Block confirmed',
    value: `Block #${receipt.blockNumber}${timestamp ? ` · ${timestamp}` : ''}`,
    type:  'text'
  };

  // Step 3 — gas
  const gasCostWei = receipt.gasUsed * receipt.effectiveGasPrice;
  const gasCostEth = ethers.formatEther(gasCostWei);

  const step3 = {
    label: 'Gas consumed',
    value: `${Number(receipt.gasUsed).toLocaleString()} gas · ${parseFloat(gasCostEth).toFixed(6)} ETH`,
    type:  'text'
  };

  // Step 4 — events
  const events = receipt.logs.flatMap(log => {
    try {
      const parsed = iface.parseLog(log);
      if (!parsed) return [];
      const argsStr = parsed.fragment.inputs.map((inp, i) => {
        const val = parsed.args[i];
        return `${inp.name}: ${typeof val === 'bigint' ? val.toString() : val}`;
      }).join(', ');
      return [{ name: parsed.name, argsStr }];
    } catch {
      return [];
    }
  });

  const step4 = {
    label: 'Events emitted',
    value: events.length > 0
      ? events.map(e => `${e.name}(${e.argsStr})`).join(' · ')
      : 'No events emitted',
    type: 'text'
  };

  return [step1, step2, step3, step4];
}

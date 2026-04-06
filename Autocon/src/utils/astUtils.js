/**
 * astUtils.js — Consolidated AST pipeline utilities.
 * Merges: astColors.js + astNormalizer.js + abiDetector.js
 */

// ─── Node Color Map ──────────────────────────────────────────────────────────
export const AST_NODE_COLORS = {
  ContractDefinition:        'var(--color-purple, #7c3aed)',
  FunctionDefinition:        'var(--color-blue,   #2563eb)',
  StateVariableDeclaration:  'var(--color-teal,   #0d9488)',
  EventDefinition:           'var(--color-amber,  #d97706)',
  ModifierDefinition:        'var(--color-coral,  #e05252)',
  StructDefinition:          'var(--color-gray,   #6b7280)',
  EnumDefinition:            'var(--color-gray,   #6b7280)',
};

export function nodeColor(type) {
  return AST_NODE_COLORS[type] ?? 'var(--color-gray, #6b7280)';
}

// ─── AST Normalizer ──────────────────────────────────────────────────────────
const KEEP_TYPES = new Set([
  'ContractDefinition',
  'FunctionDefinition',
  'StateVariableDeclaration',
  'EventDefinition',
  'ModifierDefinition',
  'StructDefinition',
  'EnumDefinition'
]);

/**
 * normalizeAST — filters a raw solc AST to only keep useful node types,
 * returning a clean tree of { id, label, type, parentId, children }.
 */
export function normalizeAST(node, parentId = null) {
  if (!node || !KEEP_TYPES.has(node.nodeType)) return null;
  return {
    id:       node.id,
    label:    node.name ?? node.nodeType,
    type:     node.nodeType,
    parentId,
    children: (node.nodes ?? [])
      .map(child => normalizeAST(child, node.id))
      .filter(Boolean)
  };
}

/** Counts total nodes in a normalized tree (for size gating). */
export function countNodes(node) {
  if (!node) return 0;
  return 1 + (node.children ?? []).reduce((sum, c) => sum + countNodes(c), 0);
}

// ─── ABI Detector ────────────────────────────────────────────────────────────
const PRIORITY = ['mint', 'burn', 'pause', 'unpause', 'transferOwnership', 'setBaseURI', 'reveal'];

/**
 * detectQuickActions — auto-detects high-value write functions from a contract ABI.
 * Priority list drives order. Falls back to all nonpayable write functions.
 */
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

/** Formats a full wallet address to a short display form. */
export function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

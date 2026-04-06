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

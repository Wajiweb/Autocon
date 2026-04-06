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

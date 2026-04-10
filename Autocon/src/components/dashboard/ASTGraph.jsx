import ASTNode from './ASTNode';

export default function ASTGraph({ ast }) {
  if (!ast) return (
    <p className="text-sm" style={{ color: 'var(--outline)' }}>
      No AST data available.
    </p>
  );
  return (
    <div className="flex flex-col gap-1 overflow-auto max-h-[60vh] pr-2">
      <ASTNode node={ast} depth={0} />
    </div>
  );
}

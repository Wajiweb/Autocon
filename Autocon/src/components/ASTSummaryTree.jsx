import { nodeColor } from '../utils/astColors';

/**
 * ASTSummaryTree — renders only top 2 levels when contract is too large (>200 nodes).
 */
export default function ASTSummaryTree({ ast }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs" style={{ color: 'var(--outline)' }}>
        Contract is large — showing top-level structure only.
      </p>
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: `${nodeColor(ast.type)}44`,
          background: 'var(--surface)'
        }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>
          {ast.label}
        </span>
        <div className="mt-3 flex flex-wrap gap-2">
          {ast.children.map(child => (
            <span
              key={child.id}
              className="rounded-md px-2 py-1 text-xs font-medium"
              style={{
                background: `${nodeColor(child.type)}22`,
                color:      nodeColor(child.type),
                border:     `1px solid ${nodeColor(child.type)}33`
              }}
            >
              {child.type} · {child.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

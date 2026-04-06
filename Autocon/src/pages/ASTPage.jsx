import { useLocation } from 'react-router-dom';
import { normalizeAST, countNodes, nodeColor } from '../utils/astUtils';
import ASTGraph from '../components/ASTGraph';
import ASTSummaryTree from '../components/ASTSummaryTree';

/**
 * ASTPage — full-page view of the compiled contract's Abstract Syntax Tree.
 * Navigated to with router state: { ast: rawSolcAST }
 */
export default function ASTPage() {
  const { state } = useLocation();
  const rawAST    = state?.ast ?? null;

  if (!rawAST) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center flex-col gap-3">
        <p className="text-sm" style={{ color: 'var(--outline)' }}>
          No AST data. Generate &amp; compile a contract first, then click "View AST".
        </p>
      </div>
    );
  }

  const normalized = normalizeAST(rawAST);
  if (!normalized) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--outline)' }}>
          Could not parse AST structure.
        </p>
      </div>
    );
  }
  const total = countNodes(normalized);

  return (
    <div
      className="flex flex-col gap-6 p-6 max-w-[900px] mx-auto"
      style={{ paddingTop: '24px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--on-surface)' }}>
            AST Graph{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #06b6d4)' }}
            >
              X-Ray
            </span>
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--outline)' }}>
            Visual map of your compiled Solidity contract structure
          </p>
        </div>
        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{ background: 'var(--surface)', color: 'var(--outline)', border: '1px solid var(--outline-variant)' }}
        >
          {total} nodes
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {[
          ['ContractDefinition', 'Contract'],
          ['FunctionDefinition', 'Function'],
          ['StateVariableDeclaration', 'State Var'],
          ['EventDefinition', 'Event'],
          ['ModifierDefinition', 'Modifier'],
        ].map(([type, label]) => {
          const c = nodeColor(type);
          return (
            <span key={type} className="text-xs px-2 py-1 rounded-md font-medium"
                  style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
              {label}
            </span>
          );
        })}
      </div>

      {/* Tree */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--outline-variant)' }}
      >
        {total > 200
          ? <ASTSummaryTree ast={normalized} />
          : <ASTGraph       ast={normalized} />
        }
      </div>
    </div>
  );
}

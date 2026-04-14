import { useLocation } from 'react-router-dom';
import { normalizeAST, countNodes, nodeColor } from '../utils/astUtils';
import ASTGraph from '../components/dashboard/ASTGraph';
import ASTSummaryTree from '../components/dashboard/ASTSummaryTree';
import '../components/dashboard/styles/dashboard.css';

const NODE_TYPES = [
  ['ContractDefinition',      'Contract'],
  ['FunctionDefinition',      'Function'],
  ['StateVariableDeclaration','State Var'],
  ['EventDefinition',         'Event'],
  ['ModifierDefinition',      'Modifier'],
];

export default function ASTPage() {
  const { state } = useLocation();
  const rawAST    = state?.ast ?? null;

  if (!rawAST) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '50vh', fontFamily: 'var(--db-font)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌳</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--db-t1)', marginBottom: 6 }}>No AST Data</div>
          <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>
            Generate &amp; compile a contract first, then click "View AST".
          </div>
        </div>
      </div>
    );
  }

  const normalized = normalizeAST(rawAST);
  if (!normalized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', fontFamily: 'var(--db-font)' }}>
        <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>Could not parse AST structure.</div>
      </div>
    );
  }

  const total = countNodes(normalized);

  return (
    <div className="pg-wrap" style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div className="pg-head db-enter db-enter-1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="pg-title">AST Graph <em>X-Ray</em></div>
          <div className="pg-sub">Visual map of your compiled Solidity contract structure</div>
        </div>
        <span className="pg-badge green" style={{ fontSize: 12, padding: '5px 14px' }}>
          {total} nodes
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }} className="db-enter db-enter-2">
        {NODE_TYPES.map(([type, label]) => {
          const c = nodeColor(type);
          return (
            <span key={type} className="pg-badge"
              style={{ background: `${c}18`, color: c, border: `.5px solid ${c}33`, padding: '4px 11px', fontSize: 11 }}>
              {label}
            </span>
          );
        })}
      </div>

      {/* Tree / Graph */}
      <div className="pg-card db-enter db-enter-3" style={{ padding: 18 }}>
        {total > 200
          ? <ASTSummaryTree ast={normalized} />
          : <ASTGraph       ast={normalized} />
        }
      </div>
    </div>
  );
}

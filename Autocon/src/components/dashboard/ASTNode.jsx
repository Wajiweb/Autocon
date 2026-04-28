import { memo, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { nodeColor } from '../../utils/astUtils';

const ASTNode = memo(function ASTNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const indent = depth * 20;
  const color  = nodeColor(node.type);

  return (
    <div style={{ marginLeft: indent }}>
      <div
        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm"
        style={{
          background: `${color}11`,
          border: `1px solid ${color}33`,
          marginBottom: '4px'
        }}
        onClick={() => hasChildren && setExpanded(e => !e)}
      >
        {hasChildren ? (
          expanded
            ? <ChevronDown className="h-3 w-3 shrink-0" style={{ color }} />
            : <ChevronRight className="h-3 w-3 shrink-0" style={{ color }} />
        ) : (
          <span className="h-3 w-3 shrink-0" />
        )}
        <span
          className="rounded px-1.5 py-0.5 text-xs font-bold"
          style={{ background: `${color}22`, color }}
        >
          {node.type}
        </span>
        <span style={{ color: 'var(--text-primary)' }} className="text-xs">
          {node.label}
        </span>
      </div>

      {expanded && hasChildren && (
        <div
          className="mb-1 flex flex-col overflow-hidden border-l pl-2"
          style={{ borderColor: `${color}44` }}
        >
          {node.children.map(child => (
            <ASTNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
});

export default ASTNode;

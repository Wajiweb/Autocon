import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

import { normalizeAST, countNodes, nodeColor } from '../utils/astUtils';
import ASTReportTemplate from '../components/dashboard/ASTReportTemplate';
import { usePDFExport } from '../hooks/useExport';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { useWizardStore } from '../store/useWizardStore';
import { 
  Download, 
  FileJson, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Braces, 
  Code, 
  Lock, 
  Radio, 
  Database, 
  Box, 
  Copy, 
  Check, 
  Info, 
  FileCode, 
  Sliders, 
  Eye, 
  Terminal,
  Columns,
  ArrowLeft
} from 'lucide-react';
import '../components/dashboard/styles/dashboard.css';

const NODE_TYPES = [
  { type: 'ContractDefinition', label: 'Contract', color: 'var(--color-purple, #7c3aed)', icon: Box },
  { type: 'FunctionDefinition', label: 'Function', color: 'var(--color-blue, #2563eb)', icon: Code },
  { type: 'StateVariableDeclaration', label: 'State Var', color: 'var(--color-teal, #0d9488)', icon: Database },
  { type: 'EventDefinition', label: 'Event', color: 'var(--color-amber, #d97706)', icon: Radio },
  { type: 'ModifierDefinition', label: 'Modifier', color: 'var(--color-coral, #e05252)', icon: Lock },
];

// Helper to count nodes of a specific type recursively
function countNodesOfType(node, type) {
  if (!node) return 0;
  let count = node.type === type ? 1 : 0;
  if (node.children) {
    count += node.children.reduce((sum, child) => sum + countNodesOfType(child, type), 0);
  }
  return count;
}

// Helper to collect all node IDs recursively
function collectAllNodeIds(node, ids = new Set()) {
  if (!node) return ids;
  ids.add(node.id);
  if (node.children) {
    node.children.forEach(child => collectAllNodeIds(child, ids));
  }
  return ids;
}

// Helper to check if a node or its children matches the search query
function nodeHasMatch(node, query) {
  if (!query) return false;
  const q = query.toLowerCase();
  if (node.label.toLowerCase().includes(q) || node.type.toLowerCase().includes(q)) return true;
  if (node.children) {
    return node.children.some(child => nodeHasMatch(child, query));
  }
  return false;
}

export default function ASTPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { generatePDF, isGenerating: isExportingPDF } = usePDFExport();
  const { session } = useWizardStore();
  const rawAST = state?.ast ?? session.contractData?.ast ?? null;

  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTypes, setFilterTypes] = useState(new Set(NODE_TYPES.map(n => n.type)));
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [isJsonView, setIsJsonView] = useState(false);

  // Parse and normalize AST
  const normalized = useMemo(() => {
    return rawAST ? normalizeAST(rawAST) : null;
  }, [rawAST]);

  const totalNodes = useMemo(() => {
    return normalized ? countNodes(normalized) : 0;
  }, [normalized]);

  // Statistics counts
  const stats = useMemo(() => {
    if (!normalized) return { contracts: 0, functions: 0, vars: 0, events: 0, modifiers: 0 };
    return {
      contracts: countNodesOfType(normalized, 'ContractDefinition'),
      functions: countNodesOfType(normalized, 'FunctionDefinition'),
      vars: countNodesOfType(normalized, 'StateVariableDeclaration'),
      events: countNodesOfType(normalized, 'EventDefinition'),
      modifiers: countNodesOfType(normalized, 'ModifierDefinition'),
    };
  }, [normalized]);

  // Auto-expand top level nodes on load
  useEffect(() => {
    if (normalized) {
      const initialExpanded = new Set();
      initialExpanded.add(normalized.id);
      if (normalized.children) {
        normalized.children.forEach(child => {
          initialExpanded.add(child.id);
        });
      }
      setExpandedNodes(initialExpanded);
      setSelectedNode(normalized);
    }
  }, [normalized]);

  if (!rawAST || !normalized) {
    return (
      <motion.div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'var(--db-font)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
      >
        <motion.div 
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
        >
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3, display: 'flex', justifyContent: 'center' }}><FileJson size={56} className="text-primary animate-pulse" /></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--db-t1)', marginBottom: 8 }}>No AST Data Found</div>
          <div style={{ fontSize: 13, color: 'var(--db-t3)', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
            Generate and deploy your smart contract in the Wizard first, then select "View AST" to explore its compiler blueprint.
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Expand / collapse handlers
  const toggleExpand = (id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = collectAllNodeIds(normalized);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set([normalized.id]));
  };

  // Filter handlers
  const toggleFilter = (type) => {
    setFilterTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Copy handler
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Node Icon Resolver
  const getNodeIcon = (type, color) => {
    const iconStyle = { color, minWidth: 14 };
    switch (type) {
      case 'SourceUnit':
        return <FileCode size={14} style={iconStyle} />;
      case 'ContractDefinition':
        return <Box size={14} style={iconStyle} />;
      case 'FunctionDefinition':
        return <Code size={14} style={iconStyle} />;
      case 'StateVariableDeclaration':
        return <Database size={14} style={iconStyle} />;
      case 'EventDefinition':
        return <Radio size={14} style={iconStyle} />;
      case 'ModifierDefinition':
        return <Lock size={14} style={iconStyle} />;
      default:
        return <Braces size={14} style={iconStyle} />;
    }
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const matchesSearch = searchQuery ? (
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      node.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) : false;

    // Filter node type (SourceUnit is always shown as the root wrapper)
    const isFiltered = !filterTypes.has(node.type) && node.type !== 'SourceUnit' && node.type !== 'ContractDefinition';
    if (isFiltered) return null;

    // Search query behavior: only render matches, or parents that have matching children
    const shouldRender = !searchQuery || matchesSearch || nodeHasMatch(node, searchQuery);
    if (!shouldRender) return null;

    const color = nodeColor(node.type);

    return (
      <div key={node.id} className="relative flex flex-col" style={{ marginLeft: depth > 0 ? 14 : 0 }}>
        {/* Connection node guideline indicator (left horizontal notch) */}
        {depth > 0 && (
          <div 
            className="absolute left-[-11px] top-[18px] w-2.5 h-[1px]" 
            style={{ borderTop: '1px dashed rgba(255,255,255,0.08)' }} 
          />
        )}

        {/* Node Row */}
        <div 
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-all duration-150 mb-1 cursor-pointer select-none group
            ${isSelected 
              ? 'bg-[hsla(25,100%,50%,0.10)] border border-[hsla(25,100%,50%,0.40)] shadow-[0_0_12px_rgba(255,107,0,0.06)]' 
              : 'hover:bg-white/5 border border-transparent'
            }
            ${matchesSearch ? 'bg-amber-500/10 border border-amber-500/25' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNode(node);
          }}
        >
          {/* Collapse/Expand Arrow toggle */}
          {hasChildren ? (
            <button 
              className="p-1 hover:bg-white/10 rounded flex items-center justify-center transition-colors text-on-surface-variant group-hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <span className="w-5 h-5 shrink-0" />
          )}

          {/* Icon */}
          <span 
            className="p-1.5 rounded flex items-center justify-center shrink-0"
            style={{ background: `${color}14`, border: `1px solid ${color}20` }}
          >
            {getNodeIcon(node.type, color)}
          </span>

          {/* Type Badge */}
          <span 
            className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase shrink-0"
            style={{ background: `${color}18`, color }}
          >
            {node.type.replace('Definition', '').replace('Declaration', '')}
          </span>

          {/* Label */}
          <span className={`truncate text-xs ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
            {node.label}
          </span>
        </div>

        {/* Children node list */}
        {hasChildren && isExpanded && (
          <div 
            className="relative ml-2.5 pl-2.5 flex flex-col"
            style={{ borderLeft: '1px dashed rgba(255,255,255,0.08)' }}
          >
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatedCard className="pg-wrap" delay={0.10} style={{ maxWidth: 1200 }}>
      {/* ─── Header Block ─── */}
      <motion.div 
        className="pg-head" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div>
          <button
            onClick={() => {
              if (session.contractType) {
                navigate(`/create?type=${session.contractType}`);
              } else {
                navigate('/create');
              }
            }}
            className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary mb-2 transition-all font-semibold"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <ArrowLeft size={14} /> Back to Wizard
          </button>
          <div className="pg-title">AST Explorer <em>X-Ray</em></div>
          <div className="pg-sub">Visual blueprint &amp; syntax map of your compiled Solidity contract structure</div>
        </div>
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="pg-badge green" style={{ fontSize: 11, padding: '5px 12px', border: '1px solid rgba(52,211,153,0.25)' }}>
            Complexity: {totalNodes} nodes
          </span>
          <ASTReportTemplate 
            ast={normalized} 
            dateStr={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 
          />
          <button
            onClick={() => generatePDF('AutoCon_AST_Report.pdf', 'pdf-ast-report')}
            disabled={isExportingPDF}
            className="pg-btn pg-btn-outline"
            aria-label={isExportingPDF ? 'Generating PDF report...' : 'Export AST report as PDF'}
            style={{ gap: 6, padding: '8px 14px', fontSize: 11, height: 36, borderRadius: 10 }}
          >
            {isExportingPDF ? (
              <div className="animate-spin" style={{ width: 12, height: 12, border: '1.5px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', flexShrink: 0 }} />
            ) : (
              <Download size={12} />
            )}
            {isExportingPDF ? 'Generating...' : 'Export PDF'}
          </button>
        </motion.div>
      </motion.div>

      {/* ─── Metrics Dashboard Stats Grid ─── */}
      <motion.div 
        className="pg-mini-stats cols-4"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="pg-stat-card" style={{ border: '1px solid var(--outline)' }}>
          <div className="pg-stat-val text-primary" style={{ color: 'var(--color-purple, #7c3aed)' }}>{stats.contracts}</div>
          <div className="pg-stat-lbl">Contracts</div>
        </div>
        <div className="pg-stat-card" style={{ border: '1px solid var(--outline)' }}>
          <div className="pg-stat-val" style={{ color: 'var(--color-blue, #2563eb)' }}>{stats.functions}</div>
          <div className="pg-stat-lbl">Functions</div>
        </div>
        <div className="pg-stat-card" style={{ border: '1px solid var(--outline)' }}>
          <div className="pg-stat-val" style={{ color: 'var(--color-teal, #0d9488)' }}>{stats.vars}</div>
          <div className="pg-stat-lbl">State Variables</div>
        </div>
        <div className="pg-stat-card" style={{ border: '1px solid var(--outline)' }}>
          <div className="pg-stat-val" style={{ color: 'var(--color-amber, #d97706)' }}>{stats.events + stats.modifiers}</div>
          <div className="pg-stat-lbl">Modifiers &amp; Events</div>
        </div>
      </motion.div>

      {/* ─── Control Bar ─── */}
      <motion.div 
        className="surface-panel" 
        style={{ 
          padding: '12px 18px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: 16, 
          flexWrap: 'wrap', 
          marginBottom: 16,
          border: '1px solid var(--outline-subtle)',
          borderRadius: 14
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: 220, maxWidth: 380 }}>
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-muted" />
          <input 
            type="text" 
            placeholder="Search smart contract nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full"
            style={{ 
              paddingLeft: '36px', 
              height: 38, 
              fontSize: '12px', 
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--outline)'
            }}
          />
        </div>

        {/* Tree controls & Mode selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="flex gap-1.5">
            <button 
              onClick={expandAll} 
              className="pg-btn pg-btn-outline" 
              style={{ height: 32, padding: '0 12px', fontSize: 11, borderRadius: 8 }}
            >
              Expand All
            </button>
            <button 
              onClick={collapseAll} 
              className="pg-btn pg-btn-outline" 
              style={{ height: 32, padding: '0 12px', fontSize: 11, borderRadius: 8 }}
            >
              Collapse All
            </button>
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--outline)' }} />

          {/* Toggle Code / Graph */}
          <div 
            style={{ 
              display: 'flex', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--outline)', 
              borderRadius: 8, 
              padding: 2 
            }}
          >
            <button
              onClick={() => setIsJsonView(false)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded ${!isJsonView ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'}`}
              style={{ height: 26, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <Columns size={11} /> Tree
            </button>
            <button
              onClick={() => setIsJsonView(true)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded ${isJsonView ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'}`}
              style={{ height: 26, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <Terminal size={11} /> Raw AST
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── Type Filter Chips ─── */}
      <motion.div 
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18, alignItems: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="flex items-center gap-1.5 text-xs text-on-surface-muted mr-1">
          <Sliders size={12} /> Filter:
        </span>
        {NODE_TYPES.map(({ type, label, color }) => {
          const isActive = filterTypes.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className="pg-badge transition-all"
              style={{ 
                background: isActive ? `${color}20` : 'transparent', 
                color: isActive ? color : 'var(--on-surface-muted)', 
                border: `1px solid ${isActive ? `${color}45` : 'var(--outline)'}`,
                padding: "5px 12px", 
                fontSize: 10,
                borderRadius: 20,
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500
              }}
            >
              {label}
            </button>
          );
        })}
      </motion.div>

      {/* ─── Main Content Workspace (Split Layout) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* LEFT COLUMN: Visual tree layout */}
        <motion.div 
          className="lg:col-span-2 pg-card"
          style={{ padding: 20, minHeight: 460, maxHeight: 680, overflowY: 'auto', border: '1px solid var(--outline)' }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
        >
          {isJsonView ? (
            <div className="relative">
              <button 
                onClick={() => handleCopy(JSON.stringify(normalized, null, 2))}
                className="absolute right-2 top-2 p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
                title="Copy Full AST JSON"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <pre className="pg-code-block text-[11px]" style={{ maxHeight: 600 }}>
                {JSON.stringify(normalized, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col gap-1 pr-2">
              {renderTreeNode(normalized)}
            </div>
          )}
        </motion.div>

        {/* RIGHT COLUMN: Node metadata & code inspector panel */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div 
                key={selectedNode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="surface-card p-5 flex flex-col gap-4 relative overflow-hidden"
                style={{ border: '1px solid var(--outline)', minHeight: 460, maxHeight: 680 }}
              >
                {/* Visual glow matching node type color in background */}
                <div 
                  className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-10 pointer-events-none"
                  style={{ background: nodeColor(selectedNode.type) }}
                />

                {/* Node Inspector Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase"
                      style={{ 
                        background: `${nodeColor(selectedNode.type)}16`, 
                        color: nodeColor(selectedNode.type),
                        border: `1px solid ${nodeColor(selectedNode.type)}25`
                      }}
                    >
                      {selectedNode.type}
                    </span>
                    <span className="text-[10px] text-on-surface-muted font-mono ml-auto">ID: #{selectedNode.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface tracking-tight truncate" title={selectedNode.label}>
                    {selectedNode.label}
                  </h3>
                </div>

                <div style={{ width: '100%', height: 1, background: 'var(--outline-subtle)' }} />

                {/* Node Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.015] border border-white/5">
                    <div className="text-[10px] text-on-surface-muted uppercase tracking-wider font-semibold mb-1">Children</div>
                    <div className="font-mono text-sm text-on-surface font-bold">{selectedNode.children?.length ?? 0} elements</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.015] border border-white/5">
                    <div className="text-[10px] text-on-surface-muted uppercase tracking-wider font-semibold mb-1">Color Code</div>
                    <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-on-surface">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: nodeColor(selectedNode.type) }} />
                      {nodeColor(selectedNode.type).substring(0, 16)}...
                    </div>
                  </div>
                </div>

                {/* Selected Node Subtree JSON */}
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-on-surface-muted uppercase font-bold tracking-wider flex items-center gap-1">
                      <Terminal size={11} /> Node Blueprint (JSON)
                    </span>
                    <button 
                      onClick={() => handleCopy(JSON.stringify(selectedNode, null, 2))}
                      className="p-1 rounded hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center gap-1 text-[10px] text-on-surface-variant hover:text-white transition-all cursor-pointer"
                    >
                      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="pg-code-block text-[10px] flex-1 overflow-y-auto" style={{ maxHeight: 380 }}>
                    {JSON.stringify({
                      id: selectedNode.id,
                      type: selectedNode.type,
                      label: selectedNode.label,
                      childrenCount: selectedNode.children?.length ?? 0
                    }, null, 2)}
                  </pre>
                </div>
              </motion.div>
            ) : (
              <div 
                className="surface-card p-5 flex flex-col items-center justify-center text-center gap-4"
                style={{ border: '1px solid var(--outline)', minHeight: 460 }}
              >
                <div className="p-3 rounded-full bg-white/[0.02] border border-white/5 text-primary-muted animate-pulse">
                  <Info size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface mb-1">Blueprint Inspector</h3>
                  <p className="text-xs text-on-surface-variant max-w-[200px] margin-0-auto leading-relaxed">
                    Click any node in the compiler outline tree to inspect its structural blueprint, child nodes, and attributes.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </AnimatedCard>
  );
}

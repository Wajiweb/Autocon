import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { normalizeAST, countNodes, nodeColor } from '../utils/astUtils';
import ASTGraph from '../components/dashboard/ASTGraph';
import ASTSummaryTree from '../components/dashboard/ASTSummaryTree';
import ASTReportTemplate from '../components/dashboard/ASTReportTemplate';
import { usePDFExport } from '../hooks/useExport';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { useWizardStore } from '../store/useWizardStore';
import { Download, FileJson } from 'lucide-react';
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
  const { generatePDF, isGenerating: isExportingPDF } = usePDFExport();
  const { session } = useWizardStore();
  const rawAST    = state?.ast ?? session.contractData?.ast ?? null;

  if (!rawAST) {
    return (
      <motion.div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', fontFamily: 'var(--db-font)' }}
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
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3, display: 'flex', justifyContent: 'center' }}><FileJson size={48} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--db-t1)', marginBottom: 6 }}>No AST Data</div>
          <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>
            Generate &amp; compile a contract first, then click "View AST".
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const normalized = normalizeAST(rawAST);
  if (!normalized) {
    return (
      <motion.div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', fontFamily: 'var(--db-font)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>Could not parse AST structure.</div>
      </motion.div>
    );
  }

  const total = countNodes(normalized);

  return (
    <AnimatedCard className="pg-wrap" delay={0.15} style={{ maxWidth: 1100 }}>

      <motion.div 
        className="pg-head" 
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      >
        <div>
          <div className="pg-title">AST Graph <em>X-Ray</em></div>
          <div className="pg-sub">Visual map of your compiled Solidity contract structure</div>
        </div>
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="pg-badge green" style={{ fontSize: 12, padding: '5px 14px' }}>
            {total} nodes
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
            style={{ gap: 7, padding: '5px 14px', fontSize: 12 }}
          >
            {isExportingPDF ? <div className="animate-spin" style={{ width: 12, height: 12, border: '1.5px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', flexShrink: 0 }} /> : <Download size={12} />}
            {isExportingPDF ? 'Generating...' : 'Export PDF'}
          </button>
        </motion.div>
      </motion.div>

      <motion.div 
        style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {NODE_TYPES.map(([type, label]) => {
          const c = nodeColor(type);
          return (
            <span key={type} className="pg-badge"
              style={{ background: `${c}18`, color: c, border: `.5px solid ${c}33`, padding: "4px 11px", fontSize: 11 }}>
              {label}
            </span>
          );
        })}
      </motion.div>

      <motion.div 
        className="pg-card" 
        style={{ padding: 18 }}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.3 }}
      >
        {total > 200
          ? <ASTSummaryTree ast={normalized} />
          : <ASTGraph       ast={normalized} />
        }
      </motion.div>
    </AnimatedCard>
  );
}



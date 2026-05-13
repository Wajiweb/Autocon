import React from 'react';
import ASTNode from './ASTNode';
import ASTSummaryTree from './ASTSummaryTree';
import { countNodes } from '../../utils/astUtils';

export default function ASTReportTemplate({ ast, dateStr }) {
  if (!ast) return null;
  const total = countNodes(ast);

  return (
    <div 
      id="pdf-ast-report"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: '800px',
        minHeight: '1131px',
        backgroundColor: '#080c14',
        color: '#e2e8f0',
        fontFamily: '"Inter", sans-serif',
        padding: '40px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #161d2b', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '28px', margin: '0 0 8px 0', color: '#10b981' }}>
            AutoCon AST X-Ray
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Generated: {dateStr}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Total Nodes: {total}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#161d2b', padding: '20px', borderRadius: '12px' }}>
        {total > 200 
          ? <ASTSummaryTree ast={ast} />
          : <ASTNode node={ast} depth={0} />
        }
      </div>
      
      <div style={{ marginTop: '40px', borderTop: '1px solid #161d2b', paddingTop: '20px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
        Disclaimer: This AST map represents the structure of your Solidity contract. 
      </div>
    </div>
  );
}

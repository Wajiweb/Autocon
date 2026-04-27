import React from 'react';
import { useLocation } from 'react-router-dom';
import AIChatPanel from '../components/dashboard/AIChatPanel';

export default function AIChatPage() {
  const location = useLocation();
  const contractCode = location.state?.contractCode || null;

  return (
    <div className="db-scroll-wrap">
      <div className="db-header">
        <div className="db-ht-group">
          <h1 className="db-h1">AI Contract Assistant</h1>
          <p className="db-p">Ask questions about your smart contract or get guidance</p>
        </div>
      </div>
      
      <div className="db-content" style={{ paddingBottom: 40 }}>
        {/* Main Chat Area */}
        <div style={{ 
          height: 'calc(100vh - 200px)', 
          minHeight: 500, 
          display: 'flex',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <AIChatPanel 
            isOpen={true} 
            inline={true} 
            contractCode={contractCode} 
            onClose={() => {}} 
          />
        </div>
      </div>
    </div>
  );
}

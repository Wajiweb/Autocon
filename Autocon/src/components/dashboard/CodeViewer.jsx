import { useState } from 'react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { useContractStore } from '../../store/useContractStore';

export default function CodeViewer({ style = {} }) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { generatedCode, isEditingEnabled, updateManualCode, snapshots, saveSnapshot, restoreSnapshot, resetCode } = useContractStore();

  const timeAgo = (timestamp) => {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return `Just now`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hr ago`;
      return new Date(timestamp).toLocaleDateString();
  };

  if (!generatedCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorChange = (value) => {
    if (isEditingEnabled) {
      updateManualCode(value);
    }
  };

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this version? Current unsaved changes will be lost.")) {
        restoreSnapshot(id);
        setShowHistory(false);
        toast.success("Snapshot restored.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset back to the original generated template? All manual edits will be lost.")) {
        resetCode();
        toast.success("Code reset to template.");
    }
  };

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--db-r-sm)', overflow: 'hidden', ...style }}>
      
      {/* Top right actions */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: '8px' }}>
          {isEditingEnabled && (
              <>
                  <button onClick={handleReset} style={btnStyle}>↺ Reset</button>
                  <div style={{ position: 'relative' }}>
                      <button onClick={() => setShowHistory(!showHistory)} style={btnStyle}>
                          🕒 History ({snapshots.length})
                      </button>
                      {showHistory && (
                          <div style={{
                              position: 'absolute', top: '110%', right: 0, width: '200px',
                              background: '#0a0a0f', border: '1px solid var(--border-color)',
                              borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                          }}>
                              <button onClick={() => { saveSnapshot(); toast.success("Snapshot saved ✅"); setShowHistory(false); }} style={{...menuBtnStyle, color: '#10b981'}}>
                                  + Save Snapshot
                              </button>
                              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }}/>
                              {snapshots.length === 0 && <span style={{ fontSize: '11px', color: 'gray', padding: '4px 8px' }}>No snapshots saved</span>}
                              {snapshots.map((s, i) => (
                                  <button key={s.id} onClick={() => handleRestore(s.id)} style={{...menuBtnStyle, display: 'flex', justifyContent: 'space-between', background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'}}>
                                      <span>Restore {i === 0 && <span style={{fontSize:'9px', color:'#10b981', marginLeft: '4px'}}>(Latest)</span>}</span>
                                      <span style={{ color: 'var(--outline)', fontSize: '10px' }}>{timeAgo(s.timestamp)}</span>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              </>
          )}
          <button onClick={handleCopy} style={btnStyle}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
      </div>

      {isEditingEnabled && (
        <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 10, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          ⚠️ Manual Edit Mode Active
        </div>
      )}

      <Editor
        height="400px"
        language="solidity"
        theme="vs-dark"
        value={generatedCode}
        onChange={handleEditorChange}
        options={{
          readOnly: !isEditingEnabled,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'var(--db-mono)',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 40 } // Increased padding to avoid top right buttons
        }}
      />
    </div>
  );
}

const btnStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#e2e8f0',
  padding: '4px 10px',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: 'var(--db-font)',
  transition: 'background 0.2s'
};

const menuBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '11px',
    padding: '6px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '4px',
    width: '100%',
    fontFamily: 'var(--db-font)',
    fontWeight: 600,
    transition: 'background 0.2s ease'
};

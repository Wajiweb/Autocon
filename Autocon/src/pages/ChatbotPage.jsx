import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../components/dashboard/styles/dashboard.css';

const SUGGESTIONS = [
  'What does this contract do?',
  'Is it secure?',
  'List all functions',
  'Who has permissions?',
  'Gas costs?',
];

export default function ChatbotPage() {
  const { authFetch } = useAuth();
  const [contractCode, setContractCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeLoaded, setCodeLoaded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContract = () => {
    if (!contractCode.trim()) return toast.error('Paste your Solidity code first.');
    setCodeLoaded(true);
    setMessages([{
      role: 'assistant',
      content: 'Contract loaded! 🎉 I\'ve analyzed the code. Try asking:\n\n- "What does this contract do?"\n- "Is this contract secure?"\n- "Explain the mint function"\n- "Who has owner permissions?"\n- "What are the gas costs?"'
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !codeLoaded) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await authFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ contractCode, question: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.success ? data.answer : '❌ ' + (data.error || 'Something went wrong.')
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Failed to reach the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const renderContent = (text) => text
    .replace(/### (.*)/g, '<strong style="display:block;font-size:13px;color:var(--db-t1);margin:12px 0 6px;">$1</strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--db-t1)">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--db-acc-d);padding:2px 6px;border-radius:5px;font-size:11px;color:var(--db-acc);font-family:var(--db-mono)">$1</code>')
    .replace(/^- (.*)/gm, '<div style="padding:2px 0 2px 12px">• $1</div>')
    .replace(/\n/g, '<br/>');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)', width: '100%', background: 'var(--bg)', position: 'relative' }}>
      
      {/* ───────────────────────────────────────────────────────── */}
      {/* 1. INITIAL STATE (No Code Loaded)                         */}
      {/* ───────────────────────────────────────────────────────── */}
      {!codeLoaded && (
        <div className="db-enter db-enter-1" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{
            width: 56, height: 56, background: 'var(--db-acc-d)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: '0 0 40px rgba(143,185,0,0.15)', marginBottom: 20
          }}>🤖</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--db-t1)', marginBottom: 8 }}>How can I help you read this code?</h1>
          <p style={{ color: 'var(--db-t2)', marginBottom: 32, textAlign: 'center', maxWidth: 400 }}>
            Paste your complete Solidity contract below. I will analyze it instantly for vulnerabilities, logic, and gas costs.
          </p>

          <div className="card glass" style={{ width: '100%', maxWidth: '800px', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract MyToken {\n    // Paste your contract code here\n}`}
              className="pg-textarea"
              style={{
                width: '100%', minHeight: 220, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--db-br)',
                borderRadius: '12px', padding: '16px', color: 'var(--db-t1)',
                fontFamily: 'var(--db-mono)', fontSize: '13px', resize: 'vertical'
              }}
            />
            <button onClick={loadContract} className="pg-btn pg-btn-primary" style={{ padding: '14px 0', fontSize: '15px', borderRadius: '8px', alignSelf: 'flex-end', paddingLeft: 32, paddingRight: 32 }}>
              Code Looks Good — Analyze
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 2. CHAT STATE (Code Loaded)                               */}
      {/* ───────────────────────────────────────────────────────── */}
      {codeLoaded && (
        <>
          {/* Top Status Bar (Subtle) */}
          <div style={{ width: '100%', background: 'var(--db-s1)', borderBottom: '1px solid var(--db-br)', padding: '10px 0', position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: 'var(--db-t2)' }}>
                <span style={{ color: 'var(--db-acc)' }}>●</span> Smart Contract Loaded ({contractCode.split('\n').length} lines)
              </div>
              <button
                onClick={() => { setCodeLoaded(false); setMessages([]); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--db-t2)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear Context
              </button>
            </div>
          </div>

          {/* Messages Scroll View */}
          <div style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', padding: '24px 0 40px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, padding: '0 24px' }}>
              
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'user' ? 'var(--db-s2)' : 'var(--db-acc-d)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--db-br)', fontSize: 16
                  }}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>

                  {/* Message Bubble */}
                  <div style={{ maxWidth: '85%' }}>
                    {msg.role === 'user' && (
                       <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--db-t2)', marginBottom: 4, textAlign: 'right' }}>You</div>
                    )}
                    {msg.role === 'assistant' && (
                       <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--db-acc)', marginBottom: 4 }}>AutoCon Assistant</div>
                    )}
                    
                    <div style={{
                      color: 'var(--db-t1)',
                      fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap',
                      background: msg.role === 'user' ? 'var(--db-s2)' : 'transparent',
                      padding: msg.role === 'user' ? '12px 18px' : '0',
                      borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '0'
                    }}>
                      {msg.role === 'assistant'
                        ? <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                        : msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--db-br)' }}>🤖</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {[0, 0.2, 0.4].map((delay, idx) => (
                      <div key={idx} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--db-acc)', animation: `net-pulse 1.4s ease ${delay}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Floating Input Area (ChatGPT Style) */}
          <div style={{ padding: '0 24px 32px', flexShrink: 0, background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* Quick Suggestions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s} onClick={() => setInput(s)}
                    style={{
                      background: 'var(--db-s1)', border: '1px solid var(--db-br)', color: 'var(--db-t2)',
                      padding: '6px 14px', fontSize: '12px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--db-acc)'; e.currentTarget.style.borderColor = 'var(--db-acc-d)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--db-t2)'; e.currentTarget.style.borderColor = 'var(--db-br)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Glass Pill Input */}
              <div className="card glass" style={{
                display: 'flex', alignItems: 'flex-end', gap: 12, padding: '10px 14px', borderRadius: '24px',
                background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}>
                <textarea
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask a question about the contract..."
                  disabled={!codeLoaded || isLoading}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '15px',
                    padding: '8px', outline: 'none', resize: 'none', minHeight: '24px', maxHeight: '120px'
                  }}
                  rows={1}
                />
                
                <button onClick={sendMessage} disabled={!input.trim() || !codeLoaded || isLoading}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', padding: 0, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: input.trim() && !isLoading ? 'var(--db-acc)' : 'var(--db-s2)',
                    color: input.trim() && !isLoading ? '#000' : 'var(--db-t3)',
                    border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default', transition: 'all 0.2s'
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-1px)' }}>
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--db-t3)' }}>
                AutoCon AI can make mistakes. Always verify critical smart contract details.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

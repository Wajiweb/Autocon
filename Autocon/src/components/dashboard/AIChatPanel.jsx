import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './styles/dashboard.css';

const INITIAL_SUGGESTIONS = [
  'What does this contract do?',
  'Is it secure?',
  'List all functions',
  'Who has permissions?',
  'Gas costs?',
];

export default function AIChatPanel({ isOpen, onClose, contractCode }) {
  const { authFetch } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState(INITIAL_SUGGESTIONS);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && contractCode && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Contract context loaded! 🎉 I am analyzing your generated code in real-time. Try asking:\n\n- "What does this contract do?"\n- "Is this contract secure?"\n- "Explain the mint function"'
      }]);
    }
  }, [isOpen, contractCode, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || !contractCode) return;
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
      if (data.success && data.suggestedQuestions && data.suggestedQuestions.length > 0) {
          setSuggestedQuestions(data.suggestedQuestions);
      }
    } catch {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: '400px', maxWidth: '100%',
        background: 'var(--bg)', borderLeft: '1px solid var(--db-br)', zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--db-br)', background: 'var(--db-s1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ fontWeight: 600, color: 'var(--db-t1)' }}>AI Contract Assistant</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--db-t2)', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {/* Content */}
        {!contractCode ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', color: 'var(--db-t2)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <h3>No Contract Generated</h3>
            <p style={{ fontSize: 13, marginTop: 8 }}>Please fill out the form and generate a smart contract first. I will be able to analyze it once it is generated.</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: msg.role === 'user' ? 'var(--db-s2)' : 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={{ maxWidth: '85%' }}>
                    {msg.role === 'user' && <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--db-t2)', marginBottom: 4, textAlign: 'right' }}>You</div>}
                    {msg.role === 'assistant' && <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--db-acc)', marginBottom: 4 }}>AutoCon AI</div>}
                    <div style={{
                      color: 'var(--db-t1)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap',
                      background: msg.role === 'user' ? 'var(--db-s2)' : 'transparent',
                      padding: msg.role === 'user' ? '10px 14px' : '0',
                      borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '0'
                    }}>
                      {msg.role === 'assistant' ? <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} /> : msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[0, 0.2, 0.4].map((delay, idx) => <div key={idx} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--db-acc)', animation: `net-pulse 1.4s ease ${delay}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px', background: 'var(--db-s1)', borderTop: '1px solid var(--db-br)' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {suggestedQuestions.map(s => (
                  <button key={s} onClick={() => setInput(s)} style={{ background: 'var(--bg)', border: '1px solid var(--db-br)', color: 'var(--db-t2)', padding: '4px 10px', fontSize: '11px', borderRadius: '50px', cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your code..."
                  disabled={!contractCode || isLoading}
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--db-br)', color: '#fff', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', outline: 'none', resize: 'none', minHeight: '40px' }}
                  rows={1}
                />
                <button onClick={sendMessage} disabled={!input.trim() || !contractCode || isLoading} style={{ width: 40, height: 40, borderRadius: '8px', background: input.trim() && !isLoading ? 'var(--db-acc)' : 'var(--db-s2)', color: input.trim() && !isLoading ? '#000' : 'var(--db-t3)', border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default' }}>
                  ➤
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

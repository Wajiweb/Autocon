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
    <div className="pg-wrap" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>

      {/* Header */}
      <div className="pg-head db-enter db-enter-1" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, background: 'var(--db-acc-d)', borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            border: '.5px solid rgba(34,197,94,.25)' }}>🤖</div>
          <div className="pg-title">AI <em>Assistant</em></div>
        </div>
        <div className="pg-sub">Talk to your smart contracts. Ask what functions do, check security, and learn.</div>
      </div>

      {/* Code Input (initial) */}
      {!codeLoaded && (
        <div className="pg-card accent-top db-enter db-enter-2" style={{ flexShrink: 0 }}>
          <label className="pg-label">Paste Your Solidity Contract</label>
          <textarea
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
            placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n...\nPaste your contract code here`}
            className="pg-textarea"
            style={{ minHeight: 160 }}
          />
          <button onClick={loadContract} className="pg-btn pg-btn-primary"
            style={{ width: '100%', padding: '12px 0', marginTop: 12 }}>
            🔍 Analyze Contract
          </button>
        </div>
      )}

      {/* Chat Area */}
      {codeLoaded && (
        <div className="pg-card db-enter db-enter-2" style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          padding: 0, borderTop: '2px solid var(--db-acc)'
        }}>
          {/* Contract banner */}
          <div style={{ padding: '14px 20px', borderBottom: '.5px solid var(--db-br)',
            display: 'flex', gap: 10, background: 'var(--db-s2)', flexShrink: 0 }}>
            <textarea value={contractCode} onChange={e => setContractCode(e.target.value)}
              disabled={codeLoaded} className="pg-textarea"
              style={{ flex: 1, minHeight: 60, maxHeight: 120, opacity: 0.6, padding: '8px 12px' }} />
            <button onClick={() => { setCodeLoaded(false); setMessages([]); }}
              className="pg-btn pg-btn-outline" style={{ alignSelf: 'flex-start', whiteSpace: 'nowrap', fontSize: 11, padding: '6px 12px' }}>
              Change
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={msg.role === 'user' ? 'pg-chat-user' : 'pg-chat-bot'}>
                  {msg.role === 'assistant'
                    ? <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                    : msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--db-acc)',
                    animation: `net-pulse 1.4s ease ${delay}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          <div style={{ padding: '10px 20px', borderTop: '.5px solid var(--db-br)',
            display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0, background: 'var(--db-s2)' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setInput(s)}
                className="pg-btn pg-btn-outline" style={{ padding: '4px 11px', fontSize: 11 }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '14px 20px', borderTop: '.5px solid var(--db-br)',
            display: 'flex', gap: 10, flexShrink: 0 }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={codeLoaded ? 'Ask a question about the contract…' : 'Paste code above first…'}
              disabled={!codeLoaded || isLoading}
              className="pg-input" style={{ flex: 1, borderRadius: 99, paddingLeft: 18 }} />
            <button onClick={sendMessage} disabled={!input.trim() || !codeLoaded || isLoading}
              className="pg-btn pg-btn-primary"
              style={{ width: 42, height: 42, borderRadius: '50%', padding: 0, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './styles/dashboard.css';

const INITIAL_SUGGESTIONS = [
  'Explain this contract',
  'What are common vulnerabilities?',
  'Suggest improvements',
];

// ─── Lightweight Analytics ────────────────────────────────────────────────────
const Analytics = {
  _data: JSON.parse(localStorage.getItem('autocon-ai-analytics') || '{}'),
  track(event) {
    this._data[event] = (this._data[event] || 0) + 1;
    localStorage.setItem('autocon-ai-analytics', JSON.stringify(this._data));
  },
};

export default function AIChatPanel({
  isOpen,
  onClose,
  contractCode,
  contractName = null,
  inline = false,
}) {
  const { authFetch } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState(INITIAL_SUGGESTIONS);
  const [activeContext, setActiveContext] = useState(contractCode);
  const [activeContextName, setActiveContextName] = useState(contractName);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [rateLimitMsg, setRateLimitMsg] = useState(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [streamingText, setStreamingText] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef(null);
  const isStreamingRef = useRef(false);

  // ── Sync Context Props ──────────────────────────────────────────────────────
  useEffect(() => {
    setActiveContext(contractCode);
    setActiveContextName(contractName);
  }, [contractCode, contractName]);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      const cappedMessages = messages.slice(-50);
      localStorage.setItem('autocon-ai-chat', JSON.stringify(cappedMessages));
    } else {
      localStorage.removeItem('autocon-ai-chat');
    }
  }, [messages]);

  // ── Restore persisted chat ──────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('autocon-ai-chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (_) {}
    }
  }, []);

  // ── Initial greeting ────────────────────────────────────────────────────────
  useEffect(() => {
    if ((isOpen || inline) && messages.length === 0) {
      if (activeContext) {
        setMessages([{
          role: 'assistant',
          content: 'Contract context loaded! 🎉 I am analyzing your code in real-time.\n\n- "What does this contract do?"\n- "Is this contract secure?"\n- "Explain the mint function"',
          timestamp: Date.now()
        }]);
      } else if (inline) {
        setMessages([{
          role: 'assistant',
          content: 'Hello! I am your AI Contract Assistant. Ask me general Web3 questions or paste a contract to analyze.',
          timestamp: Date.now()
        }]);
      }
    }
  }, [isOpen, inline, activeContext, messages.length]);

  // ── Rate Limit Countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => setRateLimitCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (rateLimitCountdown === 0 && rateLimitMsg) {
      setRateLimitMsg(null);
    }
  }, [rateLimitCountdown, rateLimitMsg]);

  // ── Simulated streaming reveal ──────────────────────────────────────────────
  const simulateStream = useCallback((fullText, onDone) => {
    if (isStreamingRef.current) {
      clearInterval(streamRef.current);
    }
    
    // Fallback to full render if message is too short to avoid flicker
    if (!fullText || fullText.length < 30) {
       onDone(fullText);
       return;
    }

    isStreamingRef.current = true;
    let i = 0;
    setStreamingText('');
    clearInterval(streamRef.current);
    const CHUNK = 6; // characters per tick
    streamRef.current = setInterval(() => {
      i += CHUNK;
      setStreamingText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(streamRef.current);
        setStreamingText('');
        isStreamingRef.current = false;
        onDone(fullText);
      }
    }, 16);
  }, []);

  useEffect(() => () => {
    clearInterval(streamRef.current);
    isStreamingRef.current = false;
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async (overrideInput) => {
    const question = (overrideInput ?? input).trim();
    if (!question || (!activeContext && !inline) || isLoading || rateLimitCountdown > 0) return;

    if (isStreamingRef.current) {
        clearInterval(streamRef.current);
        isStreamingRef.current = false;
        setStreamingText('');
    }

    const isFirstPrompt = messages.filter(m => m.role === 'user').length === 0;
    if (isFirstPrompt) Analytics.track('first_prompt');
    Analytics.track('total_messages');

    const userMsg = { role: 'user', content: question, timestamp: Date.now() };
    setMessages(prev => {
        const newMsgs = [...prev, userMsg];
        return newMsgs.length > 50 ? newMsgs.slice(-50) : newMsgs;
    });
    setInput('');
    setIsLoading(true);
    setRateLimitMsg(null);

    try {
      const res = await authFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ contractCode: activeContext || '', question }),
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '30', 10);
        setRateLimitCountdown(retryAfter);
        setRateLimitMsg(`You've reached the request limit. Try again in ${retryAfter}s.`);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const answer = data.success && data.data
        ? data.data.answer
        : '❌ ' + (data.message || data.error || 'Something went wrong.');

      if (data.success && data.data?.suggestedQuestions?.length > 0) {
        setSuggestedQuestions(data.data.suggestedQuestions);
      }

      // Simulated streaming reveal
      simulateStream(answer, (full) => {
        setMessages(prev => {
            const newMsgs = [...prev, { role: 'assistant', content: full, timestamp: Date.now() }];
            return newMsgs.length > 50 ? newMsgs.slice(-50) : newMsgs;
        });
        setIsLoading(false);
      });
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ AI service is temporarily unavailable.',
        timestamp: Date.now()
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  const copyMessage = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
      } catch (e) {}
      document.body.removeChild(textArea);
    }
  };

  // ── Clear chat ──────────────────────────────────────────────────────────────
  const clearChat = () => {
    Analytics.track('clear_chat');
    setMessages([]);
    setSuggestedQuestions(INITIAL_SUGGESTIONS);
    setRateLimitMsg(null);
    clearInterval(streamRef.current);
    setStreamingText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Markdown & Security renderer ────────────────────────────────────────────
  const renderContent = (text) => text
    .replace(/</g, '&lt;').replace(/>/g, '&gt;') // Basic sanitize
    .replace(/### (.*)/g, '<strong style="display:block;font-size:13px;color:var(--db-t1);margin:12px 0 6px;">$1</strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--db-t1)">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--db-acc-d);padding:2px 6px;border-radius:5px;font-size:11px;color:var(--db-acc);font-family:var(--db-mono)">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--db-acc);text-decoration:underline">$1</a>')
    .replace(/^- (.*)/gm, '<div style="padding:2px 0 2px 12px">• $1</div>')
    .replace(/\n/g, '<br/>');

  if (!isOpen && !inline) return null;

  // ── Context label ───────────────────────────────────────────────────────────
  const contextLabel = activeContextName
    ? activeContextName.length > 20 ? activeContextName.substring(0, 20) + '...' : activeContextName
    : activeContext
    ? `Contract (${activeContext.length} chars)`
    : null;

  const containerStyle = inline ? {
    flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
    background: 'var(--bg)', border: '1px solid var(--db-br)', borderRadius: 'var(--db-r)',
    overflow: 'hidden',
  } : {
    position: 'fixed', right: 0, top: 0, bottom: 0, width: '400px', maxWidth: '100%',
    background: 'var(--bg)', borderLeft: '1px solid var(--db-br)', zIndex: 1000,
    display: 'flex', flexDirection: 'column',
    boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <>
      {/* Backdrop (modal only) */}
      {!inline && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={onClose}
        />
      )}

      {/* Main Panel */}
      <div style={containerStyle} role="dialog" aria-label="AI Contract Assistant">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--db-br)', background: 'var(--db-s1)', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ fontWeight: 600, color: 'var(--db-t1)', fontSize: 14 }}>AI Contract Assistant</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                aria-label="Clear chat history"
                style={{ background: 'transparent', border: 'none', color: 'var(--db-t3)', cursor: 'pointer', fontSize: 11 }}
              >
                Clear Chat
              </button>
            )}
            {!inline && (
              <button onClick={onClose} aria-label="Close AI panel" style={{ background: 'transparent', border: 'none', color: 'var(--db-t2)', cursor: 'pointer', fontSize: 20 }}>×</button>
            )}
          </div>
        </div>

        {/* Context Chip */}
        {contextLabel && (
          <div title={activeContextName || `Contract (${activeContext.length} chars)`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 16px', background: 'rgba(var(--db-acc-rgb, 52, 211, 153), 0.08)',
            borderBottom: '1px solid var(--db-br)', gap: 8,
          }}>
            <span style={{ fontSize: 11, color: 'var(--db-acc)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>📎</span> Context: {contextLabel}
            </span>
            <button
              onClick={() => { setActiveContext(null); setActiveContextName(null); }}
              aria-label="Remove contract context"
              style={{ background: 'transparent', border: 'none', color: 'var(--db-t3)', cursor: 'pointer', fontSize: 11, padding: 0 }}
            >
              Remove
            </button>
          </div>
        )}

        {/* Content area */}
        {!activeContext && !inline ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', color: 'var(--db-t2)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <h3 style={{ color: 'var(--db-t1)', margin: 0 }}>No Contract Generated</h3>
            <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>Generate a smart contract first — I can then analyze and explain it.</p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: msg.role === 'user' ? 'var(--db-s2)' : 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.role === 'user' && <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--db-t2)' }}>You</div>}
                        {msg.role === 'assistant' && <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--db-acc)' }}>AutoCon AI</div>}
                        {msg.timestamp && (
                           <span style={{ fontSize: '9px', color: 'var(--db-t3)' }}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        )}
                    </div>
                    <div style={{
                      color: 'var(--db-t1)', fontSize: '13px', lineHeight: '1.6',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      background: msg.role === 'user' ? 'var(--db-s2)' : 'transparent',
                      padding: msg.role === 'user' ? '10px 14px' : '0',
                      borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '0',
                    }}>
                      {msg.role === 'assistant'
                        ? <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                        : msg.content}
                    </div>

                    {/* Confidence footer + Copy — assistant only */}
                    {msg.role === 'assistant' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <span style={{ fontSize: '10px', color: 'var(--db-t3)', fontStyle: 'italic' }}>
                          Generated by AI · Verify critical details
                        </span>
                        <button
                          onClick={() => copyMessage(msg.content, i)}
                          aria-label="Copy AI response"
                          style={{
                            background: 'transparent', border: '1px solid var(--db-br)',
                            color: copiedIdx === i ? 'var(--db-acc)' : 'var(--db-t3)',
                            cursor: 'pointer', fontSize: 10, padding: '2px 8px', borderRadius: 50,
                            transition: 'color 0.2s',
                          }}
                        >
                          {copiedIdx === i ? '✓ Copied' : '⎘ Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming preview */}
              {streamingText && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                  <div style={{ flex: 1, maxWidth: '85%' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--db-acc)', marginBottom: 4 }}>AutoCon AI</div>
                    <div
                      style={{ color: 'var(--db-t1)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      dangerouslySetInnerHTML={{ __html: renderContent(streamingText) }}
                    />
                  </div>
                </div>
              )}

              {/* Typing dots (while fetching, before streaming starts) */}
              {isLoading && !streamingText && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--db-acc-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 10, color: 'var(--db-t3)', marginBottom: 4 }}>AI is thinking…</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[0, 0.2, 0.4].map((delay, idx) => (
                        <div key={idx} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--db-acc)', animation: `net-pulse 1.4s ease ${delay}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Rate limit banner */}
            {rateLimitMsg && (
              <div style={{ padding: '8px 16px', background: 'rgba(251,191,36,0.1)', borderTop: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 12 }}>
                ⏳ {rateLimitMsg}
              </div>
            )}

            {/* Input area */}
            <div style={{ padding: '14px 16px', background: 'var(--db-s1)', borderTop: '1px solid var(--db-br)' }}>
              {/* Suggestions */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {suggestedQuestions.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={isLoading}
                    aria-label={`Quick prompt: ${s}`}
                    style={{ background: 'var(--bg)', border: '1px solid var(--db-br)', color: 'var(--db-t2)', padding: '4px 10px', fontSize: '11px', borderRadius: '50px', cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Text + Send */}
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? 'AI is responding…' : rateLimitCountdown > 0 ? `Wait ${rateLimitCountdown}s...` : 'Ask about your contract… (Enter to send, Shift+Enter for new line)'}
                  disabled={(!activeContext && !inline) || isLoading || rateLimitCountdown > 0}
                  aria-label="Chat input"
                  style={{
                    flex: 1, background: 'var(--bg)', border: '1px solid var(--db-br)', color: 'var(--db-t1)',
                    fontSize: '13px', padding: '10px 14px', borderRadius: '8px', outline: 'none',
                    resize: 'none', minHeight: '40px',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  rows={1}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || (!activeContext && !inline) || isLoading || rateLimitCountdown > 0}
                  aria-label="Send message"
                  style={{
                    width: 40, height: 40, borderRadius: '8px',
                    background: input.trim() && !isLoading && rateLimitCountdown <= 0 ? 'var(--db-acc)' : 'var(--db-s2)',
                    color: input.trim() && !isLoading && rateLimitCountdown <= 0 ? 'var(--text-primary)' : 'var(--db-t3)',
                    border: 'none',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                    fontSize: 16,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  ➤
                </button>
              </div>
              <p style={{ fontSize: 10, color: 'var(--db-t3)', marginTop: 8, marginBottom: 0 }}>
                Shift+Enter for new line · Enter to send
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }
      `}</style>
    </>
  );
}

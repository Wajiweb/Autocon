import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlatformStore } from '../store/usePlatformStore';
import { sendChatRequest } from '../services/chatApi';
import { RequestThrottler } from '../utils/throttling';
import { API_BASE } from '../config';
import { RateLimitBanner } from '../components/ui/RateLimitBanner';
import {
  Bot, Send, Loader2, Copy, Check,
  Trash2, Sparkles, AlertCircle, Cpu, MessageSquare,
  TerminalSquare,
} from 'lucide-react';

// Amber accent tokens
const ACC       = '#f59e0b';
const ACC_DARK  = '#d97706';
const ACC_RGB   = '245,158,11';

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_SUGGESTIONS = [
  'Explain this contract',
  'What are common vulnerabilities?',
  'Suggest improvements',
  'Gas optimization tips',
];

const PLACEHOLDERS = [
  'Ask about smart contracts, blockchain, or Web3…',
  'How do I create an ERC-20 token?',
  'What are common security vulnerabilities?',
  'Explain reentrancy attacks…',
  'How do I deploy a smart contract?',
];

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = {
  _data: JSON.parse(localStorage.getItem('autocon-ai-analytics') || '{}'),
  track(event) {
    this._data[event] = (this._data[event] || 0) + 1;
    localStorage.setItem('autocon-ai-analytics', JSON.stringify(this._data));
  },
};

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMarkdown(text) {
  return text
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*)/gm, '<span style="display:block;font-size:13px;font-weight:700;color:var(--db-t1);margin:14px 0 6px;letter-spacing:.01em;">$1</span>')
    .replace(/^## (.*)/gm, '<span style="display:block;font-size:14px;font-weight:700;color:var(--db-t1);margin:16px 0 8px;">$1</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--db-t1);font-weight:600;">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="color:var(--db-t2);">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(245,158,11,.12);padding:2px 7px;border-radius:5px;font-size:11.5px;color:#f59e0b;font-family:var(--db-mono);border:1px solid rgba(245,158,11,.22);">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#fbbf24;text-decoration:underline;text-underline-offset:2px;">$1</a>')
    .replace(/^[-*] (.*)/gm, '<div style="padding:3px 0 3px 16px;position:relative;"><span style="position:absolute;left:4px;color:#f59e0b;">•</span>$1</div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 0' }}>
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.div
          key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: ACC }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, index, onCopy, copiedIdx }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{ display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
    >
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, #374151, #1f2937)'
          : `linear-gradient(135deg, rgba(${ACC_RGB},.22), rgba(${ACC_RGB},.07))`,
        border: isUser ? '1px solid rgba(255,255,255,.08)' : `1px solid rgba(${ACC_RGB},.3)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isUser ? 'none' : `0 0 12px rgba(${ACC_RGB},.18)`,
      }}>
        {isUser
          ? <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', fontFamily: 'var(--db-mono)' }}>you</span>
          : <Bot size={15} color={ACC} />
        }
      </div>

      {/* Content */}
      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: isUser ? 'var(--db-t3)' : ACC }}>
            {isUser ? 'You' : 'AutoCon AI'}
          </span>
          {msg.timestamp && (
            <span style={{ fontSize: 10, color: 'var(--db-t3)' }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div style={{
          color: 'var(--db-t1)', fontSize: 13.5, lineHeight: 1.7,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          background: isUser
            ? 'linear-gradient(135deg, rgba(31,41,55,1), rgba(17,24,39,1))'
            : `linear-gradient(180deg, rgba(${ACC_RGB},.04) 0%, transparent 100%)`,
          padding: isUser ? '11px 15px' : '10px 14px',
          borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          border: isUser ? '1px solid rgba(255,255,255,.06)' : `1px solid rgba(${ACC_RGB},.1)`,
        }}>
          {msg.role === 'assistant'
            ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
            : msg.content
          }
        </div>

        {!isUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--db-t3)', fontStyle: 'italic' }}>
              AI-generated · verify critical info
            </span>
            <button
              onClick={() => onCopy(msg.content, index)}
              aria-label="Copy response"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'transparent', border: '1px solid var(--db-br)',
                color: copiedIdx === index ? ACC : 'var(--db-t3)',
                cursor: 'pointer', fontSize: 10, padding: '2px 8px', borderRadius: 50,
                transition: 'color .2s, border-color .2s',
              }}
            >
              {copiedIdx === index ? <Check size={9} /> : <Copy size={9} />}
              {copiedIdx === index ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AIChatPage() {
  const { authFetch } = useAuth();
  const location = useLocation();
  const deployments = usePlatformStore(s => s.deployments) || [];
  const jobs        = usePlatformStore(s => s.jobs)       || [];

  const [messages, setMessages]                   = useState([]);
  const [input, setInput]                         = useState('');
  const [isLoading, setIsLoading]                 = useState(false);
  const [suggestions, setSuggestions]             = useState(INITIAL_SUGGESTIONS);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [formError, setFormError]                 = useState('');
  const [streamingText, setStreamingText]         = useState('');
  const [copiedIdx, setCopiedIdx]                 = useState(null);
  const [placeholderIdx, setPlaceholderIdx]       = useState(0);
  const [inputFocused, setInputFocused]           = useState(false);
  const [tokenCount, setTokenCount]               = useState(0);
  const [limits, setLimits]                       = useState(null);

  const chatEndRef    = useRef(null);
  const inputRef      = useRef(null);
  const streamRef     = useRef(null);
  const isStreamingRef = useRef(false);
  const throttlerRef  = useRef(new RequestThrottler({ delay: 1500, maxQueueSize: 3 }));

  const buildContext = useCallback(() => {
    const recentDeps = deployments.slice(0, 3).map(d => `${d.name} (${d._type})`).join(', ');
    const recentJobs = jobs.slice(0, 2).map(j => `${j.type} - ${j.status}`).join(', ');
    return `[PLATFORM CONTEXT]\nPage: ${location.pathname}\nDeployments: ${deployments.length}\nRecent: ${recentDeps || 'None'}\nJobs: ${recentJobs || 'None'}`.trim();
  }, [deployments, jobs, location.pathname]);

  const fetchLimits = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/chat/limits`);
      if (res && res.success) {
        setLimits(res.limits);
      }
    } catch (err) {
      console.error('Error fetching AI limits:', err);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Placeholder rotation
  useEffect(() => {
    if (inputFocused || isLoading) return;
    const id = setInterval(() => setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(id);
  }, [inputFocused, isLoading]);

  // Scroll to bottom + token count
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      const capped = messages.slice(-50);
      localStorage.setItem('autocon-ai-chat', JSON.stringify(capped));
      setTokenCount(Math.round(capped.reduce((a, m) => a + m.content.length, 0) / 4));
    }
  }, [messages]);

  // Restore / greet
  useEffect(() => {
    const saved = localStorage.getItem('autocon-ai-chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.length > 0) { setMessages(parsed); return; }
      } catch (_) {}
    }
    setMessages([{
      role: 'assistant',
      content: `👋 **Welcome to AutoCon AI Assistant!**\n\nI'm your specialized **Web3 & Smart Contract expert**, powered by Google Gemini. I can help you with:\n\n- Smart contract development & auditing\n- Token generation (ERC-20, ERC-721, NFTs)\n- Security best practices & vulnerability analysis\n- Deployment guidance & gas optimization\n- AutoCon platform features\n\n💡 **Tip:** Use the quick prompts below to get started instantly!`,
      timestamp: Date.now(),
    }]);
  }, []);

  // Rate limit countdown
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const id = setTimeout(() => {
      setRateLimitCountdown(c => {
        if (c - 1 <= 0) { localStorage.removeItem('autocon-rate-limit'); throttlerRef.current.clearQueue(); }
        return c - 1;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [rateLimitCountdown]);

  // Streaming simulation
  const simulateStream = useCallback((fullText, onDone) => {
    if (isStreamingRef.current) clearInterval(streamRef.current);
    if (!fullText || fullText.length < 30) { onDone(fullText); return; }
    isStreamingRef.current = true;
    let i = 0;
    setStreamingText('');
    clearInterval(streamRef.current);
    streamRef.current = setInterval(() => {
      i += 7;
      setStreamingText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(streamRef.current);
        setStreamingText('');
        isStreamingRef.current = false;
        onDone(fullText);
      }
    }, 14);
  }, []);

  useEffect(() => () => { clearInterval(streamRef.current); isStreamingRef.current = false; }, []);

  // Send message
  const sendMessage = async (override) => {
    const question = (override ?? input).trim();
    if (!question) { setFormError('Message cannot be empty.'); return; }
    if (isLoading || rateLimitCountdown > 0) return;
    setFormError('');

    if (isStreamingRef.current) { clearInterval(streamRef.current); isStreamingRef.current = false; setStreamingText(''); }
    Analytics.track('total_messages');

    setMessages(prev => {
      const msgs = [...prev, { role: 'user', content: question, timestamp: Date.now() }];
      return msgs.length > 50 ? msgs.slice(-50) : msgs;
    });
    setInput('');
    setIsLoading(true);

    try {
      const data = await throttlerRef.current.throttle(async () =>
        await sendChatRequest(authFetch, { mode: 'chat', message: question, contract: buildContext() })
      );

      if (data.limits) {
        setLimits(data.limits);
      }

      if (!data.success) {
        if (data.retryAfter) setRateLimitCountdown(data.retryAfter);
        const valText = (data.details || []).map(d => `${d.field}: ${d.message}`).join(' | ');
        setFormError(valText || data.error || 'Something went wrong.');
        setIsLoading(false);
        return;
      }

      const answer = data.data?.reply || 'No answer generated.';
      if (data.data?.suggestedQuestions?.length > 0) setSuggestions(data.data.suggestedQuestions);

      simulateStream(answer, full => {
        setMessages(prev => {
          const msgs = [...prev, { role: 'assistant', content: full, timestamp: Date.now() }];
          return msgs.length > 50 ? msgs.slice(-50) : msgs;
        });
        setIsLoading(false);
      });
    } catch (err) {
      const msg = err?.message || 'AI service temporarily unavailable.';
      setFormError(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: msg, timestamp: Date.now() }]);
      setIsLoading(false);
    }
  };

  const handleCopy = async (text, idx) => {
    try { await navigator.clipboard.writeText(text); }
    catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_e) {}
      document.body.removeChild(ta);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    Analytics.track('clear_chat');
    setMessages([]);
    setSuggestions(INITIAL_SUGGESTIONS);
    setRateLimitCountdown(0); setFormError(''); setStreamingText(''); setTokenCount(0);
    localStorage.removeItem('autocon-ai-chat');
    localStorage.removeItem('autocon-rate-limit');
    clearInterval(streamRef.current);
    throttlerRef.current.clearQueue();
    setTimeout(() => setMessages([{
      role: 'assistant',
      content: `👋 **Chat cleared!** Ready for a fresh conversation.\n\nHow can I help you with smart contracts or Web3 today?`,
      timestamp: Date.now(),
    }]), 200);
    setTimeout(() => inputRef.current?.focus(), 350);
  };

  const handleKeyDown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--db-br)',
          background: 'var(--db-s1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* AI avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `linear-gradient(135deg, rgba(${ACC_RGB},.22), rgba(${ACC_RGB},.06))`,
            border: `1.5px solid rgba(${ACC_RGB},.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 18px rgba(${ACC_RGB},.2)`,
            position: 'relative', flexShrink: 0,
          }}>
            <Bot size={19} color={ACC} />
            <span style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 9, height: 9, borderRadius: '50%',
              background: ACC, border: '2px solid var(--db-s1)',
              boxShadow: `0 0 6px ${ACC}`,
            }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--db-t1)', letterSpacing: '-.02em' }}>
              AI Contract Assistant
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: ACC, fontWeight: 500 }}>
                <Cpu size={10} /> Powered by Gemini
              </span>
              <span style={{ color: 'var(--db-br)', fontSize: 10 }}>•</span>
              <span style={{ fontSize: 11, color: 'var(--db-t3)' }}>Web3 &amp; Solidity Expert</span>
            </div>
          </div>
        </div>

        {/* Header right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {limits && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              fontWeight: 500,
            }}>
              <div style={{
                padding: '4px 10px', borderRadius: 50,
                background: limits.rpm.remaining === 0 ? 'rgba(239,68,68,.08)' : 'rgba(245,158,11,.08)',
                border: limits.rpm.remaining === 0 ? '1px solid rgba(239,68,68,.25)' : '1px solid rgba(245,158,11,.25)',
                color: limits.rpm.remaining === 0 ? '#f87171' : '#fbbf24',
                display: 'flex', alignItems: 'center', gap: 4,
              }} title="Requests Per Minute remaining">
                <Sparkles size={9} />
                <span>{limits.rpm.remaining}/{limits.rpm.total} min</span>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 50,
                background: limits.rpd.remaining === 0 ? 'rgba(239,68,68,.08)' : 'rgba(255,255,255,.04)',
                border: limits.rpd.remaining === 0 ? '1px solid rgba(239,68,68,.25)' : '1px solid var(--db-br)',
                color: limits.rpd.remaining === 0 ? '#f87171' : 'var(--db-t3)',
                display: 'flex', alignItems: 'center', gap: 4,
              }} title="Requests Per Day remaining">
                <span>{limits.rpd.remaining}/{limits.rpd.total} day</span>
              </div>
            </div>
          )}
          {tokenCount > 0 && (
            <div style={{
              padding: '4px 10px', borderRadius: 50,
              background: 'rgba(255,255,255,.04)', border: '1px solid var(--db-br)',
              fontSize: 10, color: 'var(--db-t3)', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <MessageSquare size={9} /> ~{tokenCount.toLocaleString()} tokens
            </div>
          )}
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              title="Clear conversation"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
                color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 500,
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.16)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.08)'; }}
            >
              <Trash2 size={11} /> Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Messages scroll area (fills all remaining space) ──────────── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          minHeight: 0,   /* critical: lets flex child shrink below content size */
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i} onCopy={handleCopy} copiedIdx={copiedIdx} />
          ))}
        </AnimatePresence>

        {/* Streaming preview */}
        {streamingText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, rgba(${ACC_RGB},.22), rgba(${ACC_RGB},.07))`,
              border: `1px solid rgba(${ACC_RGB},.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 12px rgba(${ACC_RGB},.18)`,
            }}>
              <Bot size={15} color={ACC} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ACC, marginBottom: 4 }}>AutoCon AI</div>
              <div
                style={{ color: 'var(--db-t1)', fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingText) }}
              />
              <span style={{ display: 'inline-block', width: 2, height: 14, background: ACC, marginLeft: 2, verticalAlign: 'middle', animation: 'ai-cursor-blink 1s step-end infinite' }} />
            </div>
          </motion.div>
        )}

        {/* Typing dots */}
        {isLoading && !streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 12, alignItems: 'center' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, rgba(${ACC_RGB},.22), rgba(${ACC_RGB},.07))`,
              border: `1px solid rgba(${ACC_RGB},.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 12px rgba(${ACC_RGB},.18)`,
            }}>
              <Bot size={15} color={ACC} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--db-t3)', marginBottom: 2 }}>AI is thinking…</div>
              <TypingDots />
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input area (fixed at bottom, compact) ─────────────────────── */}
      <div style={{
        padding: '10px 24px 16px',
        borderTop: '1px solid var(--db-br)',
        background: 'var(--db-s1)',
        flexShrink: 0,
      }}>
        {/* Rate limit banner */}
        {rateLimitCountdown > 0 && (
          <div style={{ marginBottom: 8 }}>
            <RateLimitBanner
              retryAfter={rateLimitCountdown}
              message="Rate limit reached. Try again in {seconds} seconds"
              onCountdownComplete={() => setRateLimitCountdown(0)}
            />
          </div>
        )}

        {/* Error */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: 8, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
              color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <AlertCircle size={13} />
            {formError}
          </motion.div>
        )}

        {/* Suggestion chips — single scrollable row, no wrapping */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}>
          {suggestions.map((s, idx) => (
            <button
              key={s + idx}
              onClick={() => sendMessage(s)}
              disabled={isLoading || rateLimitCountdown > 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                padding: '4px 11px', borderRadius: 50, flexShrink: 0,
                background: `rgba(${ACC_RGB},.06)`, border: `1px solid rgba(${ACC_RGB},.2)`,
                color: ACC_DARK, cursor: isLoading ? 'default' : 'pointer',
                fontSize: 11, transition: 'all .2s', fontWeight: 500,
                opacity: isLoading || rateLimitCountdown > 0 ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = `rgba(${ACC_RGB},.14)`; e.currentTarget.style.borderColor = `rgba(${ACC_RGB},.5)`; e.currentTarget.style.color = ACC; } }}
              onMouseLeave={e => { e.currentTarget.style.background = `rgba(${ACC_RGB},.06)`; e.currentTarget.style.borderColor = `rgba(${ACC_RGB},.2)`; e.currentTarget.style.color = ACC_DARK; }}
            >
              <Sparkles size={9} />
              {s}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: inputFocused ? `rgba(${ACC_RGB},.05)` : 'rgba(255,255,255,.03)',
          border: `1px solid ${inputFocused ? `rgba(${ACC_RGB},.45)` : 'var(--db-br)'}`,
          borderRadius: 14, padding: '10px 12px',
          transition: 'all .25s',
          boxShadow: inputFocused ? `0 0 0 3px rgba(${ACC_RGB},.09)` : 'none',
        }}>
          <TerminalSquare
            size={15}
            color={inputFocused ? ACC : 'var(--db-t3)'}
            style={{ flexShrink: 0, marginBottom: 2, transition: 'color .2s' }}
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); if (formError) setFormError(''); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={
              isLoading ? 'AI is responding…'
              : rateLimitCountdown > 0 ? `Wait ${rateLimitCountdown}s…`
              : PLACEHOLDERS[placeholderIdx]
            }
            disabled={isLoading || rateLimitCountdown > 0}
            rows={1}
            aria-label="Chat input"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--db-t1)', fontSize: 13.5, lineHeight: 1.6,
              resize: 'none', fontFamily: 'inherit', minHeight: 24, maxHeight: 120,
              overflowY: 'auto',
              opacity: isLoading || rateLimitCountdown > 0 ? 0.6 : 1,
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || rateLimitCountdown > 0}
            aria-label="Send message"
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: input.trim() && !isLoading && rateLimitCountdown <= 0
                ? `linear-gradient(135deg, ${ACC}, ${ACC_DARK})`
                : 'rgba(255,255,255,.06)',
              border: 'none',
              color: input.trim() && !isLoading && rateLimitCountdown <= 0 ? '#000' : 'var(--db-t3)',
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s',
              boxShadow: input.trim() && !isLoading && rateLimitCountdown <= 0
                ? `0 0 14px rgba(${ACC_RGB},.35)` : 'none',
            }}
          >
            {isLoading
              ? <Loader2 size={14} style={{ animation: 'ai-spin 1s linear infinite' }} />
              : <Send size={13} />
            }
          </button>
        </div>

        <p style={{ fontSize: 10.5, color: 'var(--db-t3)', marginTop: 7, marginBottom: 0 }}>
          <kbd style={{ background: 'rgba(255,255,255,.07)', border: '1px solid var(--db-br)', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontFamily: 'var(--db-mono)' }}>Enter</kbd>{' '}
          to send ·{' '}
          <kbd style={{ background: 'rgba(255,255,255,.07)', border: '1px solid var(--db-br)', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontFamily: 'var(--db-mono)' }}>Shift+Enter</kbd>{' '}
          for new line
        </p>
      </div>

      <style>{`
        @keyframes ai-cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ai-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        [role="log"]::-webkit-scrollbar { width: 4px; }
        [role="log"]::-webkit-scrollbar-track { background: transparent; }
        [role="log"]::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 4px; }
      `}</style>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { usePlatformStore } from '../../store/usePlatformStore';
import { AnimatedAIChat } from '../ui/animated-ai-chat';
import { RateLimitBanner } from '../ui/RateLimitBanner';
import { sendChatRequest } from '../../services/chatApi';
import { RequestThrottler } from '../../utils/throttling';
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
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [formError, setFormError] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef(null);
  const isStreamingRef = useRef(false);

  // Request throttler to prevent rapid consecutive requests
  const throttlerRef = useRef(new RequestThrottler({ delay: 1500, maxQueueSize: 3 }));

  const handleInputChange = (value) => {
    setInput(value);
    if (formError) setFormError('');
  };

  const location = useLocation();
  const deployments = usePlatformStore(s => s.deployments) || [];
  const jobs = usePlatformStore(s => s.jobs) || [];

  // ── Sync Context Props ──────────────────────────────────────────────────────
  useEffect(() => {
    if (contractCode) {
      setActiveContext(contractCode);
      setActiveContextName(contractName || 'Smart Contract');
    } else {
      // Build platform context
      const recentDeps = deployments.slice(0, 3).map(d => `${d.name} (${d._type})`).join(', ');
      const recentJobs = jobs.slice(0, 2).map(j => `${j.type} - ${j.status}`).join(', ');
      
      const platformContext = `[SYSTEM PLATFORM CONTEXT]\nUser is currently on page: ${location.pathname}\nTotal Deployments: ${deployments.length}\nRecent Deployments: ${recentDeps || 'None'}\nRecent Jobs: ${recentJobs || 'None'}\nPlease tailor your assistance to this context when appropriate.`.trim();

      setActiveContext(platformContext);
      setActiveContextName('Platform Context');
    }
  }, [contractCode, contractName, location.pathname, deployments, jobs]);

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
      } catch (_) {
        // Ignore invalid saved messages
      }
    }
  }, []);

  // ── Initial greeting ────────────────────────────────────────────────────────
  useEffect(() => {
    if ((isOpen || inline) && messages.length === 0) {
      if (activeContext && activeContextName !== 'Platform Context') {
        setMessages([{
          role: 'assistant',
          content: 'Contract context loaded! 🎉 I am analyzing your code in real-time.\n\n- "What does this contract do?"\n- "Is this contract secure?"\n- "Explain the mint function"',
          timestamp: Date.now()
        }]);
      } else {
        setMessages([{
          role: 'assistant',
          content: 'Hello! I am your Context-Aware AI Assistant. I can see what page you are on and your recent deployments. How can I help?',
          timestamp: Date.now()
        }]);
      }
    }
  }, [isOpen, inline, activeContext, activeContextName, messages.length]);

  // ── Persist and restore rate limit state ────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('autocon-rate-limit');
    if (stored) {
      try {
        const { countdown, timestamp } = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const remaining = Math.max(0, countdown - elapsed);
        if (remaining > 0) {
          setRateLimitCountdown(remaining);
        } else {
          localStorage.removeItem('autocon-rate-limit');
        }
      } catch (_) {
        localStorage.removeItem('autocon-rate-limit');
      }
    }
  }, []);

  // ── Rate Limit Countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      // Persist rate limit state
      localStorage.setItem('autocon-rate-limit', JSON.stringify({
        countdown: rateLimitCountdown,
        timestamp: Date.now(),
      }));

      const timer = setTimeout(() => {
        const newCountdown = rateLimitCountdown - 1;
        setRateLimitCountdown(newCountdown);
        if (newCountdown <= 0) {
          localStorage.removeItem('autocon-rate-limit');
          throttlerRef.current.clearQueue(); // Clear any queued requests
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitCountdown]);

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
    if (!question) {
      setFormError('Message cannot be empty.');
      return;
    }

    if ((!activeContext && !inline) || isLoading || rateLimitCountdown > 0) return;
    setFormError('');

    if (isStreamingRef.current) {
        clearInterval(streamRef.current);
        isStreamingRef.current = false;
        setStreamingText('');
    }

    const isFirstPrompt = messages.filter(m => m.role === 'user').length === 0;
    if (isFirstPrompt) Analytics.track('first_prompt');
    Analytics.track('total_messages');

    setMessages(prev => {
        const timestamp = Date.now();
        const userMsg = { role: 'user', content: question, timestamp };
        const newMsgs = [...prev, userMsg];
        return newMsgs.length > 50 ? newMsgs.slice(-50) : newMsgs;
    });
    setInput('');
    setIsLoading(true);

    try {
      // Use throttler to prevent rapid requests
      const data = await throttlerRef.current.throttle(async () => {
        return await sendChatRequest(authFetch, {
          mode: activeContext ? 'contract' : 'chat',
          message: question,
          contract: activeContext || undefined,
        });
      });

      if (!data.success) {
        if (data.retryAfter) {
          setRateLimitCountdown(data.retryAfter);
        }

        const validationText = (data.details || [])
          .map((item) => `${item.field}: ${item.message}`)
          .join(' | ');

        setFormError(validationText || data.error || 'Something went wrong.');
        setIsLoading(false);
        return;
      }

      const answer = data.data?.reply || 'I could not generate an answer.';

      if (data.data?.suggestedQuestions?.length > 0) {
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
    } catch (err) {
      const errorMessage = err?.message || 'AI service is temporarily unavailable.';
      setFormError(errorMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ ${errorMessage}`,
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
    } catch (_err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (_e) {
        // Silent fail if clipboard not available
      }
      document.body.removeChild(textArea);
    }
  };

  // ── Clear chat ──────────────────────────────────────────────────────────────
  const clearChat = () => {
    Analytics.track('clear_chat');
    setMessages([]);
    setSuggestedQuestions(INITIAL_SUGGESTIONS);
    setRateLimitCountdown(0);
    setFormError('');
    localStorage.removeItem('autocon-rate-limit');
    throttlerRef.current.clearQueue();
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

  const contextLabel = activeContextName
    ? activeContextName.length > 20 ? activeContextName.substring(0, 20) + '...' : activeContextName
    : activeContext
    ? `Contract (${activeContext.length} chars)`
    : null;

  return (
    <AnimatedAIChat
      messages={messages}
      input={input}
      errorMessage={formError}
      isLoading={isLoading}
      suggestedQuestions={suggestedQuestions}
      rateLimitCountdown={rateLimitCountdown}
      activeContext={activeContext}
      activeContextName={activeContextName}
      contextLabel={contextLabel}
      streamingText={streamingText}
      onSendMessage={sendMessage}
      onInputChange={handleInputChange}
      onClearChat={clearChat}
      onRemoveContext={() => {
        setActiveContext(null);
        setActiveContextName(null);
      }}
      onCopyMessage={copyMessage}
      onKeyDown={handleKeyDown}
      onClose={onClose}
      inline={inline}
    >
      {rateLimitCountdown > 0 && (
        <RateLimitBanner
          retryAfter={rateLimitCountdown}
          message="Rate limit reached. Try again in {seconds} seconds"
          onCountdownComplete={() => setRateLimitCountdown(0)}
        />
      )}
    </AnimatedAIChat>
  );
}

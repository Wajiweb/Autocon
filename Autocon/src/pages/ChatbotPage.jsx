import { useState, useRef, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
        if (!contractCode.trim()) {
            return toast.error('Paste your Solidity code first.');
        }
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
                body: JSON.stringify({
                    contractCode,
                    question: input
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: '❌ ' + (data.error || 'Something went wrong.') }]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Failed to reach the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Simple markdown-like rendering
    const renderContent = (text) => {
        return text
            .replace(/### (.*)/g, '<h3 style="font-size:1rem;font-weight:800;color:var(--text-primary);margin:14px 0 8px;">$1</h3>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
            .replace(/`([^`]+)`/g, '<code style="background:rgba(6,182,212,0.1);padding:2px 6px;border-radius:6px;font-size:0.8rem;color:var(--accent)">$1</code>')
            .replace(/^- (.*)/gm, '<div style="padding:2px 0 2px 12px">• $1</div>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '20px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
                    }}>🤖</div>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                        color: 'var(--text-primary)'
                    }}>
                        AI <span style={{
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Assistant</span>
                    </h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Talk to your smart contracts. Ask what functions do, check security, and learn.
                </p>
            </div>

            {/* Code Input (if not loaded) */}
            {!codeLoaded && (
                <div className="card animate-fade-in-up delay-100" style={{ padding: '28px', flexShrink: 0 }}>
                    <label style={{
                        display: 'block', fontSize: '0.8rem', fontWeight: 700,
                        color: 'var(--text-secondary)', textTransform: 'uppercase',
                        letterSpacing: '1px', marginBottom: '12px'
                    }}>
                        Paste Your Solidity Contract
                    </label>
                    <textarea
                        value={contractCode}
                        onChange={(e) => setContractCode(e.target.value)}
                        placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n...\nPaste your contract code here`}
                        className="input"
                        style={{
                            minHeight: '160px',
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            fontSize: '0.8rem',
                            lineHeight: 1.7,
                            resize: 'vertical',
                            borderRadius: '14px'
                        }}
                    />
                    <button onClick={loadContract} className="btn-primary" style={{
                        width: '100%', padding: '14px', marginTop: '14px',
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)'
                    }}>
                        🔍 Analyze Contract
                    </button>
                </div>
            )}

            {/* Chat Area */}
            {codeLoaded && (
                <>
                    {/* Code loaded badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', marginBottom: '12px',
                        borderRadius: '12px', background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.15)', flexShrink: 0
                    }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
                            ✅ Contract loaded
                        </span>
                        <button onClick={() => { setCodeLoaded(false); setMessages([]); }} style={{
                            marginLeft: 'auto', padding: '4px 12px',
                            borderRadius: '8px', border: '1px solid var(--border-color)',
                            background: 'transparent', color: 'var(--text-muted)',
                            fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            Change Contract
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '4px', marginBottom: '12px',
                        display: 'flex', flexDirection: 'column', gap: '12px'
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '16px 20px',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                                        : 'var(--bg-card)',
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.88rem',
                                    lineHeight: 1.7
                                }}>
                                    {msg.role === 'assistant' ? (
                                        <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                                    ) : msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite'
                                }} />
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: '0.2s'
                                }} />
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: '0.4s'
                                }} />
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        display: 'flex', gap: '10px', flexShrink: 0, marginBottom: '8px'
                    }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Ask about your contract... (e.g. "What does the mint function do?")'
                            className="input"
                            style={{ flex: 1, fontSize: '0.9rem' }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            style={{
                                padding: '14px 24px', borderRadius: '14px', border: 'none',
                                background: isLoading || !input.trim()
                                    ? 'var(--bg-input)'
                                    : 'linear-gradient(135deg, #10b981, #06b6d4)',
                                color: isLoading || !input.trim() ? 'var(--text-muted)' : 'white',
                                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Send
                        </button>
                    </div>

                    {/* Quick suggestions */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
                        {['What does this contract do?', 'Is it secure?', 'List all functions', 'Who has permissions?', 'Gas costs?'].map(s => (
                            <button key={s} onClick={() => { setInput(s); }}
                                style={{
                                    padding: '6px 12px', borderRadius: '50px',
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent', color: 'var(--text-muted)',
                                    fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s ease'
                                }}
                            >{s}</button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

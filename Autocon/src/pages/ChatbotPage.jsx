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
            .replace(/### (.*)/g, '<h3 style="font-size:1rem;font-weight:800;color:var(--on-surface);margin:14px 0 8px;">$1</h3>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--on-surface)">$1</strong>')
            .replace(/`([^`]+)`/g, '<code style="background:rgba(6,182,212,0.1);padding:2px 6px;border-radius:6px;font-size:0.8rem;color:var(--tertiary)">$1</code>')
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
                        fontSize: '22px', boxShadow: 'var(--shadow-ambient)'
                    }}>🤖</div>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                        color: 'var(--on-surface)'
                    }}>
                        AI <span style={{
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Assistant</span>
                    </h1>
                </div>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                    Talk to your smart contracts. Ask what functions do, check security, and learn.
                </p>
            </div>

            {/* Code Input (if not loaded) */}
            {!codeLoaded && (
                <div className="card animate-fade-in-up delay-100" style={{ padding: '28px', flexShrink: 0 }}>
                    <label style={{
                        display: 'block', fontSize: '0.8rem', fontWeight: 700,
                        color: 'var(--outline)', textTransform: 'uppercase',
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
                <div className="card glass-strong animate-fade-in-up delay-100" style={{
                    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    borderTop: '2px solid rgba(6,182,212,0.4)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 30px rgba(6,182,212,0.05)'
                }}>
                    {/* Code Input (Collapsible or just a small header) */}
                    <div style={{
                        padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <textarea
                                value={contractCode}
                                onChange={e => setContractCode(e.target.value)}
                                disabled={codeLoaded}
                                placeholder="Paste your Solidity code here..."
                                className="input"
                                style={{
                                    flex: 1, minHeight: '80px', maxHeight: '150px',
                                    fontFamily: 'monospace', fontSize: '0.8rem',
                                    opacity: codeLoaded ? 0.6 : 1,
                                    background: codeLoaded ? 'transparent' : 'rgba(0,0,0,0.2)'
                                }}
                            />
                            <button onClick={() => { setCodeLoaded(false); setMessages([]); }} style={{
                                padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--outline-variant)',
                                background: 'transparent', color: 'var(--outline)',
                                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif', alignSelf: 'flex-start',
                                whiteSpace: 'nowrap'
                            }}>
                                Change Contract
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '4px 20px', marginBottom: '12px',
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
                                        : 'var(--surface)',
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--outline-variant)',
                                    color: msg.role === 'user' ? 'white' : 'var(--on-surface-variant)',
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
                                    background: 'var(--tertiary)', animation: 'pulse 1.5s ease-in-out infinite'
                                }} />
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: 'var(--tertiary)', animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: '0.2s'
                                }} />
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: 'var(--tertiary)', animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: '0.4s'
                                }} />
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '12px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={codeLoaded ? "Ask a question about the contract..." : "Paste code above first..."}
                            disabled={!codeLoaded || isLoading}
                            className="input"
                            style={{ flex: 1, borderRadius: '99px', paddingLeft: '20px', background: 'rgba(255,255,255,0.03)' }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || !codeLoaded || isLoading}
                            className="btn-primary"
                            style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>

                    {/* Quick suggestions */}
                    <div style={{ padding: '0 20px 20px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
                        {['What does this contract do?', 'Is it secure?', 'List all functions', 'Who has permissions?', 'Gas costs?'].map(s => (
                            <button key={s} onClick={() => { setInput(s); }}
                                style={{
                                    padding: '6px 12px', borderRadius: '50px',
                                    border: '1px solid var(--outline-variant)',
                                    background: 'transparent', color: 'var(--outline)',
                                    fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s ease'
                                }}
                            >{s}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import {
    Paperclip,
    Command,
    Send,
    Loader,
    X,
    Copy,
    Check,
    Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-4 py-3 text-sm text-white/90",
          "transition-all duration-200 ease-in-out",
          "placeholder:text-white/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus:outline-none",
          "resize-none",
          "bg-transparent",
          "border-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

function renderContent(text) {
    return text
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/### (.*)/g, '<strong style="display:block;font-size:13px;color:var(--db-t1);margin:12px 0 6px;">$1</strong>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--db-t1)">$1</strong>')
        .replace(/`([^`]+)`/g, '<code style="background:var(--db-acc-d);padding:2px 6px;border-radius:5px;font-size:11px;color:var(--db-acc);font-family:var(--db-mono)">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--db-acc);text-decoration:underline">$1</a>')
        .replace(/^- (.*)/gm, '<div style="padding:2px 0 2px 12px">• $1</div>')
        .replace(/\n/g, '<br/>');
}

export function AnimatedAIChat({
    messages,
    input,
    isLoading,
    suggestedQuestions,
    rateLimitCountdown,
    rateLimitMsg,
    activeContext,
    activeContextName,
    contextLabel,
    streamingText,
    onSendMessage,
    onInputChange,
    onClearChat,
    onRemoveContext,
    onCopyMessage,
    onKeyDown,
    errorMessage,
    onClose,
    inline = false,
    children,
}) {
    const [inputFocused, setInputFocused] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const chatEndRef = useRef(null);
    const [copiedIdx, setCopiedIdx] = useState(null);

    const handleCopy = async (text, idx) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 2000);
        } catch (_err) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand("copy");
                setCopiedIdx(idx);
                setTimeout(() => setCopiedIdx(null), 2000);
            } catch (_e) {}
            document.body.removeChild(textArea);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleSendMessage = () => {
        if (input.trim()) {
            onSendMessage();
        }
    };

    const containerStyle = inline 
        ? {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "var(--bg)",
            border: "1px solid var(--db-br)",
            borderRadius: "var(--db-r)",
            overflow: "hidden",
          }
        : {
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            width: "400px",
            maxWidth: "100%",
            background: "var(--bg)",
            borderLeft: "1px solid var(--db-br)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
            animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          };

    if (!inline) {
        return (
            <>
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }}
                />
                {renderPanel()}
                <style>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to   { transform: translateX(0);    }
                    }
                `}</style>
            </>
        );
    }

    return renderPanel();

    function renderPanel() {
        return (
            <div style={containerStyle} role="dialog" aria-label="AI Contract Assistant">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--db-br)", background: "var(--db-s1)", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--db-acc-d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                        <div style={{ fontWeight: 600, color: "var(--db-t1)", fontSize: 14 }}>AI Contract Assistant</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {messages.length > 0 && (
                            <button
                                onClick={onClearChat}
                                aria-label="Clear chat history"
                                style={{ background: "transparent", border: "none", color: "var(--db-t3)", cursor: "pointer", fontSize: 11 }}
                            >
                                Clear Chat
                            </button>
                        )}
                        {onClose && (
                            <button onClick={onClose} aria-label="Close AI panel" style={{ background: "transparent", border: "none", color: "var(--db-t2)", cursor: "pointer", fontSize: 20 }}>×</button>
                        )}
                    </div>
                </div>

                {/* Context Chip */}
                {contextLabel && (
                    <div title={activeContextName || `Contract (${activeContext?.length || 0} chars)`} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "6px 16px", background: "rgba(var(--db-acc-rgb, 52, 211, 153), 0.08)",
                        borderBottom: "1px solid var(--db-br)", gap: 8,
                    }}>
                        <span style={{ fontSize: 11, color: "var(--db-acc)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                            <span>📎</span> Context: {contextLabel}
                        </span>
                        <button
                            onClick={onRemoveContext}
                            aria-label="Remove contract context"
                            style={{ background: "transparent", border: "none", color: "var(--db-t3)", cursor: "pointer", fontSize: 11, padding: 0 }}
                        >
                            Remove
                        </button>
                    </div>
                )}

                {/* Content area */}
                {!activeContext && !inline ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", color: "var(--db-t2)" }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
                        <h3 style={{ color: "var(--db-t1)", margin: 0 }}>No Contract Generated</h3>
                        <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>Generate a smart contract first — I can then analyze and explain it.</p>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div
                            role="log"
                            aria-live="polite"
                            aria-label="Chat messages"
                            style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}
                        >
                            {messages.map((msg, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: msg.role === "user" ? "var(--db-s2)" : "var(--db-acc-d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                                        {msg.role === "user" ? "👤" : "🤖"}
                                    </div>
                                    <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column", gap: 4 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                            {msg.role === "user" && <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--db-t2)" }}>You</div>}
                                            {msg.role === "assistant" && <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--db-acc)" }}>AutoCon AI</div>}
                                            {msg.timestamp && (
                                                <span style={{ fontSize: "9px", color: "var(--db-t3)" }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            color: "var(--db-t1)", fontSize: "13px", lineHeight: "1.6",
                                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                                            background: msg.role === "user" ? "var(--db-s2)" : "transparent",
                                            padding: msg.role === "user" ? "10px 14px" : "0",
                                            borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "0",
                                        }}>
                                            {msg.role === "assistant" ? (
                                                <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                                            ) : msg.content}
                                        </div>

                                        {msg.role === "assistant" && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                                                <span style={{ fontSize: "10px", color: "var(--db-t3)", fontStyle: "italic" }}>
                                                    Generated by AI · Verify critical details
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(msg.content, i)}
                                                    aria-label="Copy AI response"
                                                    style={{
                                                        background: "transparent", border: "1px solid var(--db-br)",
                                                        color: copiedIdx === i ? "var(--db-acc)" : "var(--db-t3)",
                                                        cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 50,
                                                        transition: "color 0.2s",
                                                    }}
                                                >
                                                    {copiedIdx === i ? "✓ Copied" : "⎘ Copy"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Streaming preview */}
                            {streamingText && (
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--db-acc-d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                                    <div style={{ flex: 1, maxWidth: "85%" }}>
                                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--db-acc)", marginBottom: 4 }}>AutoCon AI</div>
                                        <div
                                            style={{ color: "var(--db-t1)", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                            dangerouslySetInnerHTML={{ __html: renderContent(streamingText) }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Typing dots (while fetching, before streaming starts) */}
                            {isLoading && (
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--db-acc-d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <div style={{ fontSize: 10, color: "var(--db-t3)", marginBottom: 4 }}>AI is thinking…</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            {[0, 0.2, 0.4].map((delay, idx) => (
                                                <div key={idx} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--db-acc)", animation: `net-pulse 1.4s ease ${delay}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Rate limit banner */}
                        {children}

                        {/* Input area */}
                        <div style={{ padding: "14px 16px", background: "var(--db-s1)", borderTop: "1px solid var(--db-br)" }}>
                            {/* Suggestions */}
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                                {suggestedQuestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => onSendMessage(s)}
                                        disabled={isLoading}
                                        aria-label={`Quick prompt: ${s}`}
                                        style={{ background: "var(--bg)", border: "1px solid var(--db-br)", color: "var(--db-t2)", padding: "4px 10px", fontSize: "11px", borderRadius: "50px", cursor: isLoading ? "default" : "pointer", opacity: isLoading ? 0.5 : 1 }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {errorMessage && (
                                <div style={{
                                    marginBottom: 10,
                                    padding: '10px 14px',
                                    background: 'rgba(254, 205, 210, 0.18)',
                                    border: '1px solid rgba(248, 113, 113, 0.35)',
                                    borderRadius: 12,
                                    color: '#b91c1c',
                                    fontSize: 12,
                                }}>
                                    {errorMessage}
                                </div>
                            )}

                            {/* Input + Send */}
                            <div style={{ display: "flex", gap: 8 }}>
                                <div className="relative w-full">
                                    <Textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => {
                                            onInputChange(e.target.value);
                                            adjustHeight();
                                        }}
                                        onKeyDown={onKeyDown}
                                        onFocus={() => setInputFocused(true)}
                                        onBlur={() => setInputFocused(false)}
                                        placeholder={isLoading ? "AI is responding…" : rateLimitCountdown > 0 ? `Wait ${rateLimitCountdown}s...` : "Ask about your contract… (Enter to send, Shift+Enter for new line)"}
                                        disabled={(!activeContext && !inline) || isLoading || rateLimitCountdown > 0}
                                        aria-label="Chat input"
                                        style={{
                                            opacity: isLoading ? 0.6 : 1,
                                        }}
                                    />
                                    {inputFocused && input && (
                                        <motion.div 
                                            className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                                            animate={{
                                                x: mousePosition.x - 400,
                                                y: mousePosition.y - 400,
                                            }}
                                            transition={{
                                                type: "spring",
                                                damping: 25,
                                                stiffness: 150,
                                                mass: 0.5,
                                            }}
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => onSendMessage()}
                                    disabled={!input.trim() || (!activeContext && !inline) || isLoading || rateLimitCountdown > 0}
                                    aria-label="Send message"
                                    style={{
                                        width: 40, height: 40, borderRadius: "8px",
                                        background: input.trim() && !isLoading && rateLimitCountdown <= 0 ? "var(--db-acc)" : "var(--db-s2)",
                                        color: input.trim() && !isLoading && rateLimitCountdown <= 0 ? "var(--text-primary)" : "var(--db-t3)",
                                        border: "none",
                                        cursor: input.trim() && !isLoading ? "pointer" : "default",
                                        fontSize: 16,
                                        transition: "background 0.2s, color 0.2s",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {isLoading ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p style={{ fontSize: 10, color: "var(--db-t3)", marginTop: 8, marginBottom: 0 }}>
                                Shift+Enter for new line · Enter to send
                            </p>
                        </div>
                    </>
                )}
            </div>
        );
    }
}
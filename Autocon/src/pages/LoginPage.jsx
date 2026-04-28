import { useState } from 'react';
import { AlertCircle, ArrowLeft, LogIn, UserPlus, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login, signup } = useAuth();
    const [authMode, setAuthMode] = useState('login');
    const [isConnecting, setIsConnecting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isSignup = authMode === 'signup';

    const switchMode = (mode) => {
        setAuthMode(mode);
        setErrorMessage('');
    };

    const handleAuth = async () => {
        setIsConnecting(true);
        setErrorMessage('');

        try {
            await (isSignup ? signup() : login());
            toast.success(isSignup ? 'Account created successfully!' : 'Signed in successfully!');
        } catch (err) {
            console.error('Authentication Error:', err);
            const message = err.message || (isSignup ? 'Failed to create account.' : 'Failed to sign in.');
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflowX: 'hidden',
        }}>
            <div aria-hidden="true" style={{
                position: 'absolute', top: '-180px', right: '-120px', pointerEvents: 'none',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(14,100%,50%,0.10) 0%, transparent 70%)',
            }} />
            <div aria-hidden="true" style={{
                position: 'absolute', bottom: '-120px', left: '-80px', pointerEvents: 'none',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(230,60%,60%,0.07) 0%, transparent 70%)',
            }} />

            <a
                href="/"
                style={{
                    position: 'absolute', top: '20px', left: '20px', zIndex: 50,
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px',
                    background: 'var(--surface)',
                    border: '1px solid var(--outline)',
                    color: 'var(--on-surface-variant)',
                    fontSize: '0.82rem', fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseOver={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'var(--outline)';
                    e.currentTarget.style.color = 'var(--on-surface-variant)';
                }}
            >
                <ArrowLeft size={15} />
                Back to Home
            </a>

            <div style={{ width: '100%', maxWidth: '440px', padding: '0 20px', position: 'relative', zIndex: 1 }}>
                <div style={{
                    borderRadius: '24px',
                    textAlign: 'center',
                    background: 'var(--surface)',
                    border: '1px solid var(--outline)',
                    borderTop: '1px solid hsla(14,100%,50%,0.20)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.60), 0 0 0 1px var(--outline-subtle)',
                    padding: '44px 40px',
                }}>
                    <div style={{
                        width: '88px', height: '88px',
                        borderRadius: '22px', margin: '0 auto 28px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-glow)',
                        border: '1px solid var(--primary-muted)',
                    }}>
                        <img
                            src="/autocon-logo.png"
                            alt="AutoCon"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>

                    <h1 style={{
                        fontSize: '1.9rem', fontWeight: 900,
                        color: 'var(--on-surface)', marginBottom: '8px', letterSpacing: '-0.04em',
                    }}>
                        AutoCon
                    </h1>
                    <p style={{
                        color: 'var(--on-surface-variant)', fontSize: '0.9rem',
                        marginBottom: '24px', lineHeight: 1.65,
                    }}>
                        No-Code Smart Contract Platform<br />
                        <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-muted)' }}>
                            {isSignup ? 'Create your wallet-secured account' : 'Sign in with your existing wallet'}
                        </span>
                    </p>

                    <div
                        role="tablist"
                        aria-label="Authentication mode"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '6px',
                            padding: '6px',
                            marginBottom: '24px',
                            borderRadius: '14px',
                            background: 'var(--surface-elevated)',
                            border: '1px solid var(--outline-subtle)',
                        }}
                    >
                        {[
                            { mode: 'login', label: 'Sign In' },
                            { mode: 'signup', label: 'Create Account' },
                        ].map(({ mode, label }) => {
                            const active = authMode === mode;

                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => switchMode(mode)}
                                    disabled={isConnecting}
                                    style={{
                                        minHeight: '42px',
                                        borderRadius: '10px',
                                        border: '1px solid',
                                        borderColor: active ? 'var(--primary-muted)' : 'transparent',
                                        background: active ? 'var(--surface)' : 'transparent',
                                        color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                                        fontSize: '0.82rem',
                                        fontWeight: 800,
                                        cursor: isConnecting ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleAuth}
                        disabled={isConnecting}
                        aria-label={isSignup ? 'Create account with MetaMask' : 'Sign in with MetaMask'}
                        style={{
                            width: '100%',
                            padding: '15px 24px',
                            borderRadius: '14px',
                            border: 'none',
                            background: isConnecting ? 'var(--surface-elevated)' : 'var(--primary)',
                            color: 'var(--surface)',
                            fontSize: '0.98rem',
                            fontWeight: 700,
                            cursor: isConnecting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                            boxShadow: isConnecting ? 'none' : 'var(--shadow-glow)',
                            opacity: isConnecting ? 0.75 : 1,
                        }}
                        onMouseOver={e => { if (!isConnecting) e.currentTarget.style.background = 'var(--primary-hover)'; }}
                        onMouseOut={e => { if (!isConnecting) e.currentTarget.style.background = 'var(--primary)'; }}
                    >
                        {isConnecting ? (
                            <>
                                <svg style={{ animation: 'spin-slow 1s linear infinite', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                {isSignup ? 'Creating Account...' : 'Signing In...'}
                            </>
                        ) : (
                            <>
                                <Wallet size={20} />
                                {isSignup ? 'Create Account with MetaMask' : 'Sign In with MetaMask'}
                            </>
                        )}
                    </button>

                    {errorMessage && (
                        <div
                            role="alert"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                marginTop: '16px',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.10)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#fca5a5',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                lineHeight: 1.45,
                                textAlign: 'left',
                            }}
                        >
                            <AlertCircle size={18} style={{ flex: '0 0 auto', marginTop: 1 }} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        margin: '28px 0 20px', color: 'var(--on-surface-muted)', fontSize: '0.72rem',
                        letterSpacing: '0.06em',
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--outline-subtle)' }} />
                        <span>SECURED BY BLOCKCHAIN</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--outline-subtle)' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {['Non-custodial', 'Nonce signed', 'No passwords'].map(badge => (
                            <span key={badge} style={{
                                fontSize: '0.72rem', fontWeight: 600,
                                color: 'var(--on-surface-muted)',
                                padding: '4px 10px', borderRadius: '99px',
                                background: 'var(--surface-elevated)',
                                border: '1px solid var(--outline-subtle)',
                            }}>
                                {badge}
                            </span>
                        ))}
                    </div>

                    <p style={{
                        color: 'var(--on-surface-muted)',
                        fontSize: '0.72rem',
                        lineHeight: 1.5,
                    }}>
                        AutoCon Platform | Sepolia | Polygon | BNB Testnet
                    </p>
                </div>
            </div>
        </div>
    );
}

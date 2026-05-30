import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, LogIn, UserPlus, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatedCard } from '../components/ui/AnimatedCard';
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
            <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                    position: 'absolute', top: '-180px', right: '-120px', pointerEvents: 'none',
                    width: '500px', height: '500px', borderRadius: '50%',
                    background: 'radial-gradient(circle, hsla(14,100%,50%,0.10) 0%, transparent 70%)',
                }}
            />
            <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                style={{
                    position: 'absolute', bottom: '-120px', left: '-80px', pointerEvents: 'none',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, hsla(230,60%,60%,0.07) 0%, transparent 70%)',
                }}
            />

            <motion.a
                href="/"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
                style={{
                    position: 'absolute', top: '20px', left: '20px', zIndex: 50,
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.09)',
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
            </motion.a>

            <div style={{ width: '100%', maxWidth: '440px', padding: '0 20px', position: 'relative', zIndex: 1 }}>
                <AnimatedCard delay={0.15} variant="primary" style={{ padding: '44px 40px', borderRadius: '24px', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            width: '100%',
                            maxWidth: '220px',
                            margin: '0 auto 28px',
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src="/autocon-logo-new.png"
                            alt="AutoCon"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            color: 'var(--on-surface-variant)', fontSize: '0.9rem',
                            marginBottom: '24px', lineHeight: 1.65,
                        }}
                    >
                        No-Code Smart Contract Platform<br />
                        <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-muted)' }}>
                            {isSignup ? 'Create your wallet-secured account' : 'Sign in with your existing wallet'}
                        </span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.45 }}
                        role="tablist"
                        aria-label="Authentication mode"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '6px',
                            padding: '6px',
                            marginBottom: '24px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(14px)',
                            WebkitBackdropFilter: 'blur(14px)',
                            border: '1px solid rgba(255,255,255,0.08)',
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
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.55 }}
                        onClick={handleAuth}
                        disabled={isConnecting}
                        aria-label={isSignup ? 'Create account with MetaMask' : 'Sign in with MetaMask'}
                        style={{
                            width: '100%',
                            padding: '15px 24px',
                            borderRadius: '14px',
                            border: 'none',
                            background: isConnecting ? 'var(--surface-elevated)' : 'var(--primary)',
                            color: '#000000',
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
                                <svg className="animate-spin" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
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
                    </motion.button>

                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
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
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            margin: '28px 0 20px', color: 'var(--on-surface-muted)', fontSize: '0.72rem',
                            letterSpacing: '0.06em',
                        }}
                    >
                        <div style={{ flex: 1, height: 1, background: 'var(--outline-subtle)' }} />
                        <span>SECURED BY BLOCKCHAIN</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--outline-subtle)' }} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}
                    >
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
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75 }}
                        style={{
                            color: 'var(--on-surface-muted)',
                            fontSize: '0.72rem',
                            lineHeight: 1.5,
                        }}
                    >
                        AutoCon Platform | Sepolia | BNB Testnet
                    </motion.p>
                </AnimatedCard>
            </div>
        </div>
    );
}

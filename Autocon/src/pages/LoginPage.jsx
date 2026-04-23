import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleLogin = async () => {
        setIsConnecting(true);
        try {
            await login();
            toast.success('Signed in successfully!');
        } catch (err) {
            console.error('Login Error:', err);
            toast.error(err.message || 'Failed to sign in.');
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
            overflowX: 'hidden'
        }}>

            {/* Back to Home Button */}
            <a href="/" style={{
                position: 'absolute', top: '16px', left: '16px', zIndex: 50,
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', borderRadius: '10px',
                background: 'rgba(143,185,0,0.06)',
                border: '1px solid rgba(143,185,0,0.18)',
                backdropFilter: 'blur(10px)',
                color: 'var(--on-surface-variant)', fontSize: '0.85rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.background = 'rgba(143,185,0,0.12)'; e.currentTarget.style.borderColor = 'rgba(143,185,0,0.35)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.background = 'rgba(143,185,0,0.06)'; e.currentTarget.style.borderColor = 'rgba(143,185,0,0.18)'; }}
            >
                <ArrowLeft size={16} />
                Back to Home
            </a>

            {/* Background decorative glow orbs — green scheme */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-10%',
                width: '150vw', maxWidth: '600px', height: '150vw', maxHeight: '600px',
                background: 'radial-gradient(circle, rgba(143,185,0,0.12) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', left: '-10%',
                width: '120vw', maxWidth: '500px', height: '120vw', maxHeight: '500px',
                background: 'radial-gradient(circle, rgba(34,197,94,0.09) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none'
            }} />

            {/* Subtle grid overlay */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: 'linear-gradient(rgba(143,185,0,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(143,185,0,.15) 1px, transparent 1px)',
                backgroundSize: '60px 60px', pointerEvents: 'none'
            }} />

            {/* Login Card */}
            <div className="animate-fade-in-up" style={{
                width: '100%', maxWidth: '440px', padding: '0 16px', position: 'relative', zIndex: 1
            }}>
                <div style={{
                    borderRadius: '28px',
                    textAlign: 'center',
                    background: 'var(--surface)',
                    border: '1px solid rgba(143,185,0,0.18)',
                    borderTop: '1px solid rgba(143,185,0,0.30)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(143,185,0,0.06)',
                    backdropFilter: 'blur(40px)',
                    padding: '40px 40px',
                }}>
                    {/* Logo */}
                    <div className="animate-float" style={{
                        width: '90px', height: '90px',
                        borderRadius: '22px', margin: '0 auto 28px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 40px rgba(143,185,0,0.30)',
                        border: '2px solid rgba(143,185,0,0.25)',
                    }}>
                        <img
                            src="/autocon-logo.png"
                            alt="AutoCon"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>

                    <h1 style={{
                        fontSize: '2rem', fontWeight: 900,
                        color: 'var(--on-surface)', marginBottom: '8px', letterSpacing: '-0.5px'
                    }}>
                        AutoCon
                    </h1>
                    <p style={{
                        color: 'var(--on-surface-variant)', fontSize: '0.95rem',
                        marginBottom: '36px', lineHeight: 1.6
                    }}>
                        No-Code Smart Contract Platform<br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>Connect your wallet to get started</span>
                    </p>

                    {/* MetaMask Button */}
                    <button
                        onClick={handleLogin}
                        disabled={isConnecting}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            border: 'none',
                            background: isConnecting
                                ? 'rgba(143,185,0,0.10)'
                                : 'linear-gradient(135deg, #8FB900 0%, #A5C900 100%)',
                            color: '#0c1a0f',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: isConnecting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            boxShadow: isConnecting ? 'none' : '0 8px 30px rgba(143,185,0,0.35)',
                            opacity: isConnecting ? 0.7 : 1
                        }}
                        onMouseOver={(e) => { if (!isConnecting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {isConnecting ? (
                            <>
                                <svg style={{ animation: 'spin-slow 1s linear infinite', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Signing In...
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '1.4rem' }}>🦊</span>
                                Sign In with MetaMask
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        margin: '28px 0 20px', color: 'var(--outline)', fontSize: '0.75rem'
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(143,185,0,0.12)' }} />
                        <span>SECURED BY BLOCKCHAIN</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(143,185,0,0.12)' }} />
                    </div>

                    {/* Security badges */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="badge badge-accent">🔒 JWT Auth</span>
                        <span className="badge badge-success">🛡️ CORS Protected</span>
                        <span className="badge badge-warning">⚡ Rate Limited</span>
                    </div>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    color: 'var(--outline)',
                    fontSize: '0.75rem'
                }}>
                    No-code smart contract platform • Sepolia Testnet
                </p>
            </div>
        </div>
    );
}

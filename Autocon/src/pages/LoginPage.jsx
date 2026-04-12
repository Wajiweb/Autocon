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
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
                <ArrowLeft size={16} />
                Back to Home
            </a>

            {/* Background decorative elements */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-10%',
                width: '150vw', maxWidth: '600px', height: '150vw', maxHeight: '600px',
                background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', left: '-10%',
                width: '120vw', maxWidth: '500px', height: '120vw', maxHeight: '500px',
                background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none'
            }} />

            {/* Grid pattern overlay */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.03,
                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px', pointerEvents: 'none'
            }} />

            {/* Login Card */}
            <div className="animate-fade-in-up" style={{
                width: '100%', maxWidth: '440px', padding: '0 16px', position: 'relative', zIndex: 1
            }}>
                <div className="glass px-6 py-10 sm:px-10" style={{
                    borderRadius: '28px',
                    textAlign: 'center'
                }}>
                    {/* Logo */}
                    <div className="animate-float" style={{
                        width: '90px', height: '90px',
                        borderRadius: '22px', margin: '0 auto 28px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 40px rgba(6,182,212,0.3)'
                    }}>
                        <img
                            src="/autocon-logo.png"
                            alt="AutoCon"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>

                    <h1 style={{
                        fontSize: '2rem', fontWeight: 900,
                        color: '#f1f5f9', marginBottom: '8px', letterSpacing: '-0.5px'
                    }}>
                        AutoCon
                    </h1>
                    <p style={{
                        color: '#94a3b8', fontSize: '0.95rem',
                        marginBottom: '36px', lineHeight: 1.6
                    }}>
                        No-Code ERC-20 Token Generator<br />
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Connect your wallet to get started</span>
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
                                ? 'rgba(255,255,255,0.05)'
                                : 'linear-gradient(135deg, #f6851b, #e2761b)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: isConnecting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            boxShadow: isConnecting ? 'none' : '0 8px 30px rgba(246,133,27,0.3)',
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
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                        <span>SECURED BY BLOCKCHAIN</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
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

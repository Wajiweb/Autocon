import { useState, useEffect } from 'react';

/**
 * OnboardingTour — Welcome modal for first-time users.
 * Shows a multi-step guided walkthrough of the platform.
 * Stores completion state in localStorage.
 */
export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('autocon_tour_done');
    if (!hasSeenTour) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('autocon_tour_done', 'true');
  };

  const steps = [
    {
      icon: '🚀',
      title: 'Welcome to AutoCon!',
      desc: 'The no-code Web3 platform for generating, auditing, and deploying smart contracts — all without writing a single line of Solidity.',
      color: '#06b6d4'
    },
    {
      icon: '⚙️',
      title: 'Generate Contracts',
      desc: 'Choose from Token (ERC-20), NFT (ERC-721), or Auction generators. Fill out a simple form and get production-ready Solidity code instantly.',
      color: '#8b5cf6'
    },
    {
      icon: '🛡️',
      title: 'Security Audit',
      desc: 'Run automated security analysis on any Solidity code. Get severity-ranked findings with actionable fix suggestions.',
      color: '#10b981'
    },
    {
      icon: '🔗',
      title: 'Deploy & Track',
      desc: 'Deploy to multiple testnets with one click. Your Dashboard tracks all deployments with export, analytics, and contract links.',
      color: '#f59e0b'
    },
    {
      icon: '🤖',
      title: 'AI Assistant',
      desc: 'Need help? Ask the AI chatbot about Solidity, gas optimization, or smart contract best practices. It\'s always ready.',
      color: '#ec4899'
    }
  ];

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        width: '480px', maxWidth: '92vw',
        padding: '36px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
        animation: 'fadeInUp 0.4s ease-out',
        position: 'relative'
      }}>
        {/* Skip button */}
        <button onClick={dismiss} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600,
          fontFamily: 'Inter, sans-serif'
        }}>Skip Tour</button>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: '3px', flex: 1, borderRadius: '3px',
              background: i <= step ? steps[step].color : 'var(--border-color)',
              transition: 'background 0.3s ease'
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }} key={step}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: `${steps[step].color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '2.2rem'
          }}>
            {steps[step].icon}
          </div>
          <h2 style={{
            fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)',
            marginBottom: '10px', letterSpacing: '-0.3px'
          }}>
            {steps[step].title}
          </h2>
          <p style={{
            fontSize: '0.88rem', color: 'var(--text-secondary)',
            lineHeight: 1.6, maxWidth: '380px', margin: '0 auto'
          }}>
            {steps[step].desc}
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            style={{
              padding: '10px 24px', borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: step === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: step === 0 ? 'default' : 'pointer',
              fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
              opacity: step === 0 ? 0.4 : 1, transition: 'all 0.2s ease'
            }}
          >← Back</button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                padding: '10px 28px', borderRadius: '12px',
                border: 'none',
                background: `linear-gradient(135deg, ${steps[step].color}, ${steps[Math.min(step+1, steps.length-1)].color})`,
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease'
              }}
            >Next →</button>
          ) : (
            <button
              onClick={dismiss}
              className="btn-primary"
              style={{ padding: '10px 28px', borderRadius: '12px', fontSize: '0.82rem' }}
            >Get Started 🚀</button>
          )}
        </div>
      </div>
    </div>
  );
}

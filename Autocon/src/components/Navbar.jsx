import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import GasWidget from './GasWidget';

export default function Navbar({ activeTab }) {
  const { user, logout } = useAuth();
  const { network } = useNetwork();

  const titles = {
    dashboard: 'Dashboard',
    templates: 'Template Library',
    token: 'Token Generator',
    nft: 'NFT Generator',
    auction: 'Auction Generator',
    interact: 'Contract Explorer',
    audit: 'Security Audit',
    chatbot: 'AI Assistant',
    profile: 'My Profile'
  };

  const shortAddr = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';

  const titleWords = (titles[activeTab] || '').split(' ');
  const firstWord = titleWords[0];
  const rest = titleWords.slice(1).join(' ');

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 var(--space-4)', height: '64px',
      background: 'rgba(8,12,20,0.8)',
      backdropFilter: 'blur(24px) saturate(200%)',
      WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.02), 0 4px 24px rgba(0,0,0,0.3)',
      position: 'sticky', top: 0, zIndex: 50,
      marginBottom: '24px',
    }}>
      {/* Page Title */}
      <div>
        <h2 style={{
          fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--on-surface)'
        }}>
          {firstWord}{rest ? <> <span className="gradient-text">{rest}</span></> : ''}
        </h2>
        <p style={{ fontSize: '0.72rem', color: 'var(--outline)', marginTop: '1px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gas Widget */}
        <GasWidget />

        {/* Network Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '99px',
          background: `${network.color}12`,
          border: `1px solid ${network.color}28`,
          fontSize: '0.7rem', fontWeight: 700, color: network.color,
          letterSpacing: '0.04em'
        }}>
          <div style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: network.color, boxShadow: `0 0 6px ${network.color}`,
            animation: 'pulse-glow 2.5s ease-in-out infinite'
          }} />
          {network.name}
        </div>

        {/* Wallet Address */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '99px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)',
          fontFamily: 'monospace', letterSpacing: '0.02em'
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', boxShadow: '0 2px 8px rgba(245,158,11,0.3)'
          }}>🦊</div>
          {shortAddr}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '99px',
            border: '1px solid rgba(239,68,68,0.18)',
            background: 'rgba(239,68,68,0.06)',
            color: '#f87171', cursor: 'pointer',
            transition: 'all 0.2s ease', fontSize: '0.75rem', fontWeight: 600
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.18)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </header>
  );
}

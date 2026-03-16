import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import GasWidget from './GasWidget';

export default function Navbar({ activeTab }) {
  const { user } = useAuth();
  const { network } = useNetwork();

  // Map tab IDs to display names
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

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px', marginBottom: '24px',
      background: 'rgba(16, 20, 35, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-neon)',
      boxShadow: '0 4px 30px rgba(0, 240, 255, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      margin: '0 -32px 24px -32px'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px',
          color: 'var(--text-primary)', marginBottom: '2px'
        }}>
          {titles[activeTab]?.split(' ')[0] || ''}{' '}
          <span className="gradient-text">{titles[activeTab]?.split(' ').slice(1).join(' ') || ''}</span>
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live Gas Tracker */}
        <GasWidget />

        {/* Network Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '50px',
          background: `${network.color}10`,
          border: `1px solid ${network.color}25`,
          fontSize: '0.72rem', fontWeight: 600, color: network.color
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: network.color,
            boxShadow: `0 0 8px ${network.color}`,
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          {network.name}
        </div>

        {/* Wallet Chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '50px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
          fontFamily: 'monospace'
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px'
          }}>🦊</div>
          {shortAddr}
        </div>
      </div>
    </header>
  );
}

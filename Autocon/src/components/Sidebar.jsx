import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNetwork } from '../context/NetworkContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedNetwork, setSelectedNetwork, networks, allNetworkKeys } = useNetwork();

  const navSections = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'templates', label: 'Templates', icon: '📚' },
      ]
    },
    {
      label: 'Generators',
      items: [
        { id: 'token', label: 'Token (ERC-20)', icon: '⚙️' },
        { id: 'nft', label: 'NFT (ERC-721)', icon: '🎨' },
        { id: 'auction', label: 'Auction', icon: '🔨' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { id: 'interact', label: 'Contract Explorer', icon: '🔗' },
        { id: 'audit', label: 'Security Audit', icon: '🛡️' },
        { id: 'chatbot', label: 'AI Assistant', icon: '🤖' },
      ]
    },
    {
      label: 'Account',
      items: [
        { id: 'profile', label: 'My Profile', icon: '👤' },
      ]
    }
  ];

  const shortAddr = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';

  return (
    <aside style={{
      width: isExpanded ? '252px' : '72px',
      minWidth: isExpanded ? '252px' : '72px',
      height: '100vh',
      background: 'rgba(8,12,20,0.95)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      transition: 'width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 50
    }}>
      {/* Brand */}
      <div style={{
        padding: isExpanded ? '20px 16px' : '20px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center',
        gap: '12px', transition: 'padding 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <img src="/autocon-logo.png" alt="AutoCon" style={{
            width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover',
            flexShrink: 0, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(6,182,212,0.3)'
          }} onClick={() => setIsExpanded(!isExpanded)} title="Toggle Sidebar" />

          {isExpanded && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9' }}>AutoCon</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Web3 Platform</div>
            </div>
          )}
        </div>

        {isExpanded && (
          <button onClick={() => setIsExpanded(false)} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#374151', cursor: 'pointer', padding: '5px 7px', borderRadius: '6px',
            fontSize: '0.7rem', transition: 'all 0.2s ease'
          }}
            onMouseOver={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            ◀
          </button>
        )}
      </div>

      {/* Nav Sections */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navSections.map(section => (
          <div key={section.label} style={{ marginBottom: isExpanded ? '6px' : '16px' }}>
            {isExpanded ? (
              <div style={{
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                padding: '12px 14px 6px', transition: 'color 0.3s ease'
              }}>{section.label}</div>
            ) : (
              <div style={{
                height: '1px', background: 'var(--outline-variant)',
                margin: '12px 14px 6px'
              }} />
            )}
            {section.items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  title={item.label}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: isExpanded ? '9px 12px' : '11px 0',
                    borderRadius: '10px', border: 'none', marginBottom: '2px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    gap: isExpanded ? '10px' : '0',
                    fontSize: '0.84rem', fontWeight: isActive ? 700 : 500,
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'rgba(103,232,249,0.07)' : 'transparent',
                    color: isActive ? '#67e8f9' : '#64748b',
                    borderLeft: isActive ? '2px solid #67e8f9' : '2px solid transparent',
                    boxShadow: isActive ? 'inset 8px 0 20px rgba(103,232,249,0.04)' : 'none',
                    position: 'relative', overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = '#94a3b8';
                      if (isExpanded) e.currentTarget.style.transform = 'translateX(3px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                      if (isExpanded) e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                  {isExpanded && <span style={{ animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }}>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}

        {/* Network Selector */}
        {isExpanded && (
          <div style={{ marginTop: '12px', padding: '0 4px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)',
              textTransform: 'uppercase', letterSpacing: '1.5px',
              padding: '12px 10px 6px', transition: 'color 0.3s ease'
            }}>Network</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '0 8px' }}>
              {allNetworkKeys.map(key => {
                const net = networks[key];
                const isActive = key === selectedNetwork;
                return (
                  <button
                    key={key} title={net.name}
                    onClick={() => setSelectedNetwork(key)}
                    style={{
                      padding: '8px', borderRadius: '8px',
                      border: isActive ? `1.5px solid ${net.color}` : '1px solid var(--outline-variant)',
                      cursor: 'pointer', fontSize: '0.65rem', fontWeight: isActive ? 700 : 500,
                      fontFamily: 'Inter, sans-serif', background: isActive ? `${net.color}15` : 'transparent',
                      color: isActive ? net.color : 'var(--on-surface-variant)', transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center',
                      whiteSpace: 'nowrap', overflow: 'hidden'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem' }}>{net.icon}</span>
                    {net.name.replace('Polygon ', '')}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '14px 10px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', gap: '6px'
      }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} title="Toggle Theme" style={{
          width: '100%', textAlign: isExpanded ? 'left' : 'center',
          padding: isExpanded ? '10px 12px' : '10px 0', borderRadius: '10px',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center', gap: isExpanded ? '10px' : '0',
          fontSize: '0.8rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
          background: 'var(--surface)', color: 'var(--on-surface-variant)', transition: 'all 0.2s ease'
        }}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {isExpanded && <span style={{ animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Wallet */}
        {isExpanded && (
          <div style={{
            padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-highest)',
            border: '1px solid var(--outline-variant)', animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
              WALLET DIRECT
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--tertiary)' }}>
              {shortAddr}
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={logout} title="Sign Out" style={{
          width: '100%', textAlign: isExpanded ? 'left' : 'center',
          padding: isExpanded ? '10px 12px' : '10px 0', borderRadius: '10px',
          border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: isExpanded ? '10px' : '0', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
          background: 'rgba(239,68,68,0.05)', color: 'var(--error)', transition: 'all 0.2s ease'
        }}>
          <span>🚪</span>
          {isExpanded && <span style={{ animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }}>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
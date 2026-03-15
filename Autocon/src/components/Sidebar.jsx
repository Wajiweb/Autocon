import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNetwork } from '../context/NetworkContext';

export default function Sidebar({ activeTab, setActiveTab }) {
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
      width: '240px',
      minWidth: '240px',
      height: '100vh',
      background: 'var(--bg-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--sidebar-border)',
      transition: 'background 0.3s ease, border-color 0.3s ease',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Brand */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid var(--sidebar-border)',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <img src="/autocon-logo.png" alt="AutoCon" style={{
          width: '34px', height: '34px', borderRadius: '10px',
          objectFit: 'cover'
        }} />
        <div>
          <div style={{
            fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px',
            color: 'var(--sidebar-brand)',
            transition: 'color 0.3s ease'
          }}>AutoCon</div>
          <div style={{
            fontSize: '0.6rem', fontWeight: 500,
            color: 'var(--sidebar-muted)',
            transition: 'color 0.3s ease'
          }}>Web3 Contract Platform</div>
        </div>
      </div>

      {/* Nav Sections */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {navSections.map(section => (
          <div key={section.label} style={{ marginBottom: '6px' }}>
            <div style={{
              fontSize: '0.58rem', fontWeight: 700,
              color: 'var(--sidebar-section)',
              textTransform: 'uppercase', letterSpacing: '1.5px',
              padding: '8px 10px 4px',
              transition: 'color 0.3s ease'
            }}>{section.label}</div>
            {section.items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '9px 10px', borderRadius: '10px',
                    border: 'none', marginBottom: '2px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '9px',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent'
                  }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '1rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}

        {/* Network Selector - Compact Dropdown Style */}
        <div style={{ marginTop: '4px', padding: '0 4px' }}>
          <div style={{
            fontSize: '0.58rem', fontWeight: 700,
            color: 'var(--sidebar-section)',
            textTransform: 'uppercase', letterSpacing: '1.5px',
            padding: '8px 10px 6px',
            transition: 'color 0.3s ease'
          }}>Network</div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '0 4px'
          }}>
            {allNetworkKeys.map(key => {
              const net = networks[key];
              const isActive = key === selectedNetwork;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedNetwork(key)}
                  style={{
                    padding: '6px 8px', borderRadius: '8px',
                    border: isActive ? `1.5px solid ${net.color}` : '1px solid var(--sidebar-border)',
                    cursor: 'pointer',
                    fontSize: '0.62rem', fontWeight: isActive ? 700 : 500,
                    fontFamily: 'Inter, sans-serif',
                    background: isActive ? `${net.color}15` : 'transparent',
                    color: isActive ? net.color : 'var(--sidebar-muted)',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    whiteSpace: 'nowrap', overflow: 'hidden'
                  }}
                >
                  <span style={{ fontSize: '0.7rem' }}>{net.icon}</span>
                  {net.name.replace('Polygon ', '')}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '10px',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex', flexDirection: 'column', gap: '6px'
      }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          width: '100%', textAlign: 'left',
          padding: '8px 10px', borderRadius: '8px',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '0.78rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
          background: 'var(--sidebar-hover)',
          color: 'var(--sidebar-text)', transition: 'all 0.2s ease'
        }}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Wallet */}
        <div style={{
          padding: '8px 10px', borderRadius: '8px',
          background: 'var(--accent-glow)',
          border: '1px solid rgba(6,182,212,0.15)'
        }}>
          <div style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--sidebar-muted)', marginBottom: '2px' }}>
            WALLET
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>
            {shortAddr}
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          width: '100%', textAlign: 'left',
          padding: '8px 10px', borderRadius: '8px',
          border: '1px solid rgba(239,68,68,0.15)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
          background: 'rgba(239,68,68,0.05)',
          color: '#ef4444', transition: 'all 0.2s ease'
        }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
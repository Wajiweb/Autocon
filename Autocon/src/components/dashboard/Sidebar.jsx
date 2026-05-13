import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../context/NetworkContext';
import toast from 'react-hot-toast';
import './styles/dashboard.css';

const NAV_GROUPS = [
  {
    label: 'Contracts',
    items: [
      { label: 'Dashboard',        path: '/dashboard', icon: '◈' },
      { label: 'Create Contract',  path: '/create',    icon: '✦', badge: 'NEW' },
      { label: 'Token Generator',  path: '/tokens',    icon: '⬡' },
      { label: 'NFT Generator',    path: '/nfts',      icon: '⬢' },
      { label: 'Auction Generator',path: '/auctions',  icon: '◉' },
      { label: 'Security Audit',   path: '/audit',     icon: '⚑' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'AI Assistant',     path: '/ai-chat',   icon: '🤖' },
      { label: 'Activity Monitor', path: '/jobs',      icon: '◎' },
      { label: 'Analytics',        path: '/analytics', icon: '◑' },
      /* Fix 2: /templates + /ast existed as routes but had no sidebar entry.
         (architect-review: orphaned routes — unreachable without direct URL) */
      { label: 'Templates',        path: '/templates', icon: '⊞' },
      { label: 'AST Explorer',     path: '/ast',       icon: '⋮⋮' },
      { label: 'Profile',          path: '/profile',   icon: '⊙' },
    ],
  },
];


export default function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) {
  const { walletAddress } = useWallet();
  const { network } = useNetwork();
  const [blockNum, setBlockNum] = useState(8241036);

  useEffect(() => {
    const id = setInterval(() => {
      setBlockNum((n) => n + Math.floor(Math.random() * 2 + 1));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '0x0000...0000';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99, backdropFilter: 'blur(3px)' }}
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <aside className={`db-sidebar${isMobileOpen ? ' mobile-open' : ''}${isCollapsed ? ' collapsed' : ''}`}>
        {/* Logo */}
        <div className="db-sb-logo">
          <div className="db-logo-mark">AC</div>
          {!isCollapsed && (
            <div>
              <div className="db-logo-name">AutoCon</div>
              <div className="db-logo-tag">v2.4 · Blockchain Studio</div>
            </div>
          )}
          <button 
            className="db-sidebar-toggle" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? '»' : '«'}
          </button>
        </div>

        {/* Nav */}
        <nav className="db-sb-nav">
          {NAV_GROUPS.map((group) => (
            <React.Fragment key={group.label}>
              <div className="db-nav-group-label">
                {isCollapsed ? '•••' : group.label}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `db-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setIsMobileOpen?.(false)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="db-nav-icon">{item.icon}</span>
                  {!isCollapsed && item.label}
                  {!isCollapsed && item.badge != null && (
                    <span className="db-nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Bottom */}
        <div className="db-sb-bottom">
          {/* Wallet chip */}
          <div className="db-wallet-chip" style={{ padding: isCollapsed ? '10px 5px' : '11px 13px', textAlign: isCollapsed ? 'center' : 'left' }}>
            {!isCollapsed && <div className="db-wc-label">Connected Wallet</div>}
            <div className="db-wc-addr" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
              {!isCollapsed ? shortAddr : <span style={{ fontSize: '18px' }}>👛</span>}
              {!isCollapsed && (
                <button
                  className="db-wc-copy"
                  onClick={() => {
                    if (walletAddress) navigator.clipboard.writeText(walletAddress);
                    toast.success('Address copied');
                  }}
                  title="Copy address"
                >
                  ⎘
                </button>
              )}
            </div>
            {!isCollapsed && (
              <div className="db-net-row">
                <div className="db-net-dot" style={{ background: network?.color || '#22c55e', boxShadow: `0 0 6px ${network?.color || '#22c55e'}` }} />
                <span className="db-net-name">{network?.name || 'Sepolia Testnet'}</span>
                <span className="db-net-block">#{blockNum.toLocaleString()}</span>
              </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}

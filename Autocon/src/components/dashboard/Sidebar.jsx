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
      { label: 'Token Generator',  path: '/tokens',    icon: '⬡', badge: null },
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
      { label: 'Profile',          path: '/profile',   icon: '⊙' },
    ],
  },
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
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

      <aside className={`db-sidebar${isMobileOpen ? ' mobile-open' : ''}`}>
        {/* Logo */}
        <div className="db-sb-logo">
          <div className="db-logo-mark">AC</div>
          <div>
            <div className="db-logo-name">AutoCon</div>
            <div className="db-logo-tag">v2.4 · Blockchain Studio</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="db-sb-nav">
          {NAV_GROUPS.map((group) => (
            <React.Fragment key={group.label}>
              <div className="db-nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `db-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setIsMobileOpen?.(false)}
                >
                  <span className="db-nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge != null && (
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
          <div className="db-wallet-chip">
            <div className="db-wc-label">Connected Wallet</div>
            <div className="db-wc-addr">
              {shortAddr}
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
            </div>
            <div className="db-net-row">
              <div className="db-net-dot" style={{ background: network?.color || '#22c55e', boxShadow: `0 0 6px ${network?.color || '#22c55e'}` }} />
              <span className="db-net-name">{network?.name || 'Sepolia Testnet'}</span>
              <span className="db-net-block">#{blockNum.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}

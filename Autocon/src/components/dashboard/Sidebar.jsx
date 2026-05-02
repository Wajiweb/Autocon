import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Coins,
  Image as ImageIcon,
  Gavel,
  ShieldCheck,
  MessageSquare,
  Activity,
  BarChart3,
  User,
  Copy,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../context/NetworkContext';
import toast from 'react-hot-toast';
import './styles/dashboard.css';

const NAV_GROUPS = [
  {
    label: 'Contracts',
    items: [
      { label: 'Dashboard',        path: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'Token Generator',  path: '/tokens',    icon: <Coins size={18} />, badge: null },
      { label: 'NFT Generator',    path: '/nfts',      icon: <ImageIcon size={18} /> },
      { label: 'Auction Generator',path: '/auctions',  icon: <Gavel size={18} /> },
      { label: 'Security Audit',   path: '/audit',     icon: <ShieldCheck size={18} /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'AI Assistant',     path: '/ai-chat',   icon: <MessageSquare size={18} /> },
      { label: 'Activity Monitor', path: '/jobs',      icon: <Activity size={18} /> },
      { label: 'Analytics',        path: '/analytics', icon: <BarChart3 size={18} /> },
      { label: 'Profile',          path: '/profile',   icon: <User size={18} /> },
    ],
  },
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { theme, toggleTheme } = useTheme();
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
              <Copy size={12} />
              </button>
            </div>
            <div className="db-net-row">
              <div className="db-net-dot" style={{ background: network?.color || '#22c55e', boxShadow: `0 0 6px ${network?.color || '#22c55e'}` }} />
              <span className="db-net-name">{network?.name || 'Sepolia Testnet'}</span>
              <span className="db-net-block">#{blockNum.toLocaleString()}</span>
            </div>
          </div>

          {/* Theme toggle */}
          <button className="db-theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

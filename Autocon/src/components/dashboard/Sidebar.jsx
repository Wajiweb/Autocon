import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../context/NetworkContext';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, Wand2, Coins, Image as ImageIcon, Gavel, 
  ShieldCheck, Bot, Activity, BarChart3, LayoutTemplate, 
  Network, User, Copy, ChevronLeft, ChevronRight, Wallet, MoreHorizontal
} from 'lucide-react';
import './styles/dashboard.css';

const NAV_GROUPS = [
  {
    label: 'Contracts',
    items: [
      { label: 'Dashboard',        path: '/dashboard', icon: LayoutDashboard },
      { label: 'Create Contract',  path: '/create',    icon: Wand2, badge: 'NEW' },
      { label: 'Token Generator',  path: '/create?type=ERC20',    icon: Coins },
      { label: 'NFT Generator',    path: '/create?type=ERC721',      icon: ImageIcon },
      { label: 'Auction Generator',path: '/create?type=Auction',  icon: Gavel },
      { label: 'Security Audit',   path: '/audit',     icon: ShieldCheck },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'AI Assistant',     path: '/ai-chat',   icon: Bot },
      { label: 'Activity Monitor', path: '/jobs',      icon: Activity },
      { label: 'Analytics',        path: '/analytics', icon: BarChart3 },
      /* Fix 2: /templates + /ast existed as routes but had no sidebar entry.
         (architect-review: orphaned routes — unreachable without direct URL) */
      { label: 'Templates',        path: '/templates', icon: LayoutTemplate },
      { label: 'AST Explorer',     path: '/ast',       icon: Network },
      { label: 'Profile',          path: '/profile',   icon: User },
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
      {/* Mobile backdrop — locks body scroll while open */}
      {isMobileOpen && (
        <div
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99, backdropFilter: 'blur(3px)' }}
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <aside className={`db-sidebar${isMobileOpen ? ' mobile-open' : ''}${isCollapsed ? ' collapsed' : ''}`}>
        {/* Logo */}
        <div className="db-sb-logo" style={{ padding: isCollapsed ? '20px 0' : '20px 16px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <img 
            src="/autocon-logo-new.png" 
            alt="AutoCon" 
            style={{ 
              height: isCollapsed ? '28px' : '32px', 
              width: 'auto', 
              display: 'block',
              transition: 'all 0.3s ease'
            }} 
          />
          {!isCollapsed && (
            <div style={{ marginLeft: '12px' }}>
              <div className="db-logo-tag" style={{ marginTop: '2px' }}>v2.4 · Blockchain Studio</div>
            </div>
          )}
          <button 
            className="db-sidebar-toggle" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} strokeWidth={2} aria-hidden="true" /> : <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="db-sb-nav">
          {NAV_GROUPS.map((group) => (
            <React.Fragment key={group.label}>
              <div className="db-nav-group-label" style={{ display: 'flex', justifyContent: 'center' }}>
                {isCollapsed ? <MoreHorizontal size={14} style={{ opacity: 0.4 }} /> : group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `db-nav-link${isActive ? ' active' : ''}`}
                    onClick={() => setIsMobileOpen?.(false)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="db-nav-icon">
                      <Icon size={18} strokeWidth={2} aria-hidden="true" />
                    </span>
                    {!isCollapsed && item.label}
                    {!isCollapsed && item.badge != null && (
                      <span className="db-nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Bottom */}
        <div className="db-sb-bottom">
          {/* Wallet chip */}
          <div className="db-wallet-chip" style={{ padding: isCollapsed ? '10px 5px' : '11px 13px', textAlign: isCollapsed ? 'center' : 'left' }}>
            {!isCollapsed && <div className="db-wc-label">Connected Wallet</div>}
            <div className="db-wc-addr" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
              {!isCollapsed ? shortAddr : <Wallet size={18} strokeWidth={2} aria-hidden="true" />}
              {!isCollapsed && (
                <button
                  className="db-wc-copy"
                  onClick={() => {
                    if (walletAddress) navigator.clipboard.writeText(walletAddress);
                    toast.success('Address copied');
                  }}
                  title="Copy address"
                >
                  <Copy size={16} strokeWidth={2} aria-hidden="true" />
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

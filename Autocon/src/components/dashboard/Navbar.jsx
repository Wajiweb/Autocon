import { useAuth } from '../../context/AuthContext';
import { useContractStore } from '../../store/useContractStore';
import { Menu, Wallet, LogOut } from 'lucide-react';
import NetworkSwitcher from './NetworkSwitcher';
import GasWidget from './GasWidget';
import './styles/dashboard.css';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isEditingEnabled, generatedCode } = useContractStore();

  const shortAddr = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <header className="db-topbar">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        style={{ display: 'none', background: 'none', border: 'none', color: 'var(--db-t2)', cursor: 'pointer', padding: '4px 8px' }}
        className="db-mobile-menu-btn"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <span className="db-topbar-date">{dateStr}</span>
      <div className="db-tb-gap" />

      {/* Live Gas Widget */}
      <GasWidget />

      {/* Network switcher */}
      <NetworkSwitcher />

      {generatedCode && isEditingEnabled && (
        <div className="db-dev-mode-indicator">
          Developer Mode Active
        </div>
      )}

      {/* Wallet */}
      {shortAddr && (
        <div className="db-tb-chip muted" style={{ fontFamily: 'var(--db-mono)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wallet size={12} /> {shortAddr}
        </div>
      )}

      {/* Sign out */}
      <button className="db-tb-signout" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </header>
  );
}

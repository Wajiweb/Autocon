import { useAuth } from '../../context/AuthContext';
import { useContractStore } from '../../store/useContractStore';
import { usePlatformStore } from '../../store/usePlatformStore';
import NetworkSwitcher from './NetworkSwitcher';
import GasWidget from './GasWidget';
import './styles/dashboard.css';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isEditingEnabled, generatedCode } = useContractStore();
  const { isSyncing, lastSynced } = usePlatformStore();

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
        style={{ display: 'none', background: 'none', border: 'none', color: 'var(--db-t2)', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}
        className="db-mobile-menu-btn"
        aria-label="Open menu"
      >
        ☰
      </button>

      <span className="db-topbar-date">{dateStr}</span>
      
      {/* Sync Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginLeft: 16 }}>
        <div style={{ 
          width: 8, height: 8, borderRadius: '50%', 
          backgroundColor: isSyncing ? '#fbbf24' : '#34d399',
          animation: isSyncing ? 'pulse 1s infinite' : 'none' 
        }} />
        <span style={{ color: 'var(--db-t3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {isSyncing ? 'Syncing...' : 'Live'}
        </span>
      </div>

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
        <div className="db-tb-chip muted" style={{ fontFamily: 'var(--db-mono)', fontSize: 11 }}>
          ⬡ {shortAddr}
        </div>
      )}

      {/* Sign out */}
      <button className="db-tb-signout" onClick={logout}>
        ↪ Sign Out
      </button>
    </header>
  );
}

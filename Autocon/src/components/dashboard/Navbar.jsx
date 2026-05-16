import { useAuth } from '../../context/AuthContext';
import { useContractStore } from '../../store/useContractStore';
import { usePlatformStore } from '../../store/usePlatformStore';
import { Wallet, LogOut, Menu, Zap, LogOut as LogOutIcon, Calendar } from 'lucide-react';
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
        className="db-mobile-menu-btn"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--db-t3)' }}>
        <Calendar size={14} />
        <span className="db-topbar-date">{dateStr}</span>
      </div>
      
      {/* Sync Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginLeft: 16 }}>
        <div style={{ 
          width: 8, height: 8, borderRadius: '50%', 
          backgroundColor: isSyncing ? '#ff6b00' : '#22c55e',
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
        <div className="db-dev-mode-indicator flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[var(--accent-border)]">
          <Zap size={10} fill="currentColor" /> Developer Mode
        </div>
      )}

      {/* Wallet */}
      {shortAddr && (
        <div className="db-tb-chip muted flex items-center gap-2" style={{ fontFamily: 'var(--db-mono)', fontSize: 11 }}>
          <Wallet size={12} style={{ color: 'var(--db-acc)' }} /> {shortAddr}
        </div>
      )}

      {/* Sign out */}
      <button className="db-tb-signout flex items-center gap-1.5" onClick={logout}>
        <LogOutIcon size={14} /> Sign Out
      </button>
    </header>
  );
}

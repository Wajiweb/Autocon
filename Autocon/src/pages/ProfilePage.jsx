import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../components/dashboard/styles/dashboard.css';

const BADGES = [
  { cond: (d) => d >= 1,  icon: '🏅', label: 'First Deploy',    color: 'var(--db-acc)' },
  { cond: (d) => d >= 5,  icon: '🌟', label: 'Power User',      color: '#a78bfa' },
  { cond: (d) => d >= 10, icon: '🏆', label: 'Blockchain Pro',  color: 'var(--db-amber)' },
];
const NFT_BADGE    = { icon: '🎨', label: 'NFT Creator',  color: '#ec4899' };
const AUC_BADGE    = { icon: '🔨', label: 'Auctioneer',   color: 'var(--db-amber)' };
const TOKEN_BADGE  = { icon: '💎', label: 'Token Master', color: 'var(--db-blue)' };

export default function ProfilePage() {
  const { user, authFetch } = useAuth();
  const [deployments, setDeployments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user?.walletAddress) return;
      const all = [];
      try {
        const r = await authFetch(`/api/token/my-tokens/${user.walletAddress}`);
        const d = await r.json();
        const tokens = d.success ? (d.data?.tokens ?? d.tokens) : null;
        if (tokens) tokens.forEach(t => all.push({ ...t, _type: 'ERC-20' }));
      } catch (_) {}
      try {
        const r = await authFetch(`/api/nft/my-nfts/${user.walletAddress}`);
        const d = await r.json();
        const nfts = d.success ? (d.data?.nfts ?? d.nfts) : null;
        if (nfts) nfts.forEach(t => all.push({ ...t, _type: 'ERC-721' }));
      } catch (_) {}
      try {
        const r = await authFetch(`/api/auction/my-auctions/${user.walletAddress}`);
        const d = await r.json();
        const auctions = d.success ? (d.data?.auctions ?? d.auctions) : null;
        if (auctions) auctions.forEach(t => all.push({ ...t, _type: 'Auction' }));
      } catch (_) {}
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDeployments(all);
      setIsLoading(false);
    };
    fetchAll();
  }, [user, authFetch]);

  const tokenCount   = deployments.filter(d => d._type === 'ERC-20').length;
  const nftCount     = deployments.filter(d => d._type === 'ERC-721').length;
  const auctionCount = deployments.filter(d => d._type === 'Auction').length;

  const badges = [
    ...BADGES.filter(b => b.cond(deployments.length)),
    ...(nftCount >= 1 ? [NFT_BADGE] : []),
    ...(auctionCount >= 1 ? [AUC_BADGE] : []),
    ...(tokenCount >= 3 ? [TOKEN_BADGE] : []),
  ];

  const firstDeploy = deployments.length > 0
    ? new Date(deployments[deployments.length - 1].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';
  const uniqueNetworks = [...new Set(deployments.map(d => d.network).filter(Boolean))];
  const shortAddr = user?.walletAddress
    ? `${user.walletAddress.slice(0, 8)}…${user.walletAddress.slice(-6)}`
    : '';

  const typeInfo = (type) => ({
    'Auction': { color: 'var(--db-amber)', label: 'Auction', icon: '🔨' },
    'ERC-721': { color: '#ec4899',         label: 'NFT Collection', icon: '🎨' },
  }[type] ?? { color: 'var(--db-acc)', label: 'ERC-20 Token', icon: '🪙' });

  return (
    <div className="pg-wrap" style={{ maxWidth: 860 }}>

      {/* Profile Banner Card */}
      <div className="pg-card db-enter db-enter-1" style={{ padding: 0, overflow: 'hidden',
        borderTop: '2px solid var(--db-acc)', marginBottom: 16 }}>
        {/* Gradient banner */}
        <div style={{ height: 110,
          background: 'linear-gradient(135deg, #1a4226, #2c6540, #1e4a2b)',
          borderBottom: '.5px solid var(--db-br)', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'absolute', bottom: -28, left: 28,
            width: 64, height: 64, borderRadius: 16, background: 'var(--db-s1)',
            border: '3px solid var(--db-s1)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 20px rgba(0,0,0,.5)' }}>
            🦊
          </div>
        </div>

        <div style={{ padding: '44px 28px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)', marginBottom: 6 }}>
              Web3 Builder
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--db-mono)', fontSize: 12, color: 'var(--db-t2)',
                background: 'var(--db-acc-d)', padding: '4px 12px', borderRadius: 8,
                border: '.5px solid rgba(143,185,0,.25)' }}>{shortAddr || 'Not connected'}</span>
              <button onClick={() => { navigator.clipboard.writeText(user?.walletAddress || ''); toast.success('Address copied!'); }}
                className="pg-btn pg-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}>
                📋 Copy
              </button>
            </div>
          </div>
          <a href={`https://sepolia.etherscan.io/address/${user?.walletAddress}`}
            target="_blank" rel="noreferrer" className="pg-btn pg-btn-outline"
            style={{ textDecoration: 'none', fontSize: 12 }}>
            Etherscan ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="pg-mini-stats cols-4 db-enter db-enter-2">
        {[
          { label: 'Total Deploys', value: deployments.length, icon: '🚀', color: 'var(--db-acc)' },
          { label: 'ERC-20 Tokens', value: tokenCount,         icon: '🪙', color: 'var(--db-blue)' },
          { label: 'NFT Collections', value: nftCount,         icon: '🎨', color: '#ec4899' },
          { label: 'Auctions',       value: auctionCount,      icon: '🔨', color: 'var(--db-amber)' },
        ].map(s => (
          <div key={s.label} className="pg-stat-card">
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div className="pg-stat-val" style={{ color: s.color }}>{s.value}</div>
            <div className="pg-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges + Account Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }} className="db-enter db-enter-3">
        <div className="pg-card">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)', marginBottom: 14 }}>
            🏆 Earned Badges
          </div>
          {badges.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>Deploy your first contract to earn badges!</div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {badges.map(b => (
                <div key={b.label} style={{ padding: '8px 14px', borderRadius: 10,
                  background: `${b.color}18`, border: `.5px solid ${b.color}40`,
                  display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 18 }}>{b.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: b.color }}>{b.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pg-card">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)', marginBottom: 14 }}>
            📋 Account Details
          </div>
          {[
            { label: 'First Deploy',  value: firstDeploy },
            { label: 'Networks Used', value: uniqueNetworks.join(', ') || 'None' },
            { label: 'Badges Earned', value: `${badges.length} / 6` },
            { label: 'Member Since',  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '.5px solid var(--db-br)' }}>
              <span style={{ fontSize: 12, color: 'var(--db-t3)' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--db-t1)', fontFamily: 'var(--db-font)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="pg-card db-enter db-enter-4">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--db-t1)', fontFamily: 'var(--db-font)', marginBottom: 14 }}>
          📜 Recent Activity
        </div>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--db-t3)', fontSize: 13 }}>
            <div className="pg-spinner" /> Loading…
          </div>
        ) : deployments.slice(0, 5).length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--db-t3)' }}>No deployments yet. Create your first contract!</div>
        ) : (
          deployments.slice(0, 5).map((item, idx) => {
            const ti = typeInfo(item._type);
            return (
              <div key={item._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 0', borderBottom: idx < 4 ? '.5px solid var(--db-br)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: `${ti.color}18`, border: `.5px solid ${ti.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {ti.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--db-t1)', fontFamily: 'var(--db-font)', marginBottom: 3 }}>
                    Deployed {ti.label}: <span style={{ color: ti.color }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--db-t3)', fontFamily: 'var(--db-mono)' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {item.contractAddress && (
                      <a href={`https://sepolia.etherscan.io/address/${item.contractAddress}`}
                        target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: 'var(--db-acc)', textDecoration: 'none', fontFamily: 'var(--db-mono)' }}>
                        {item.contractAddress.slice(0, 10)}…{item.contractAddress.slice(-6)} ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

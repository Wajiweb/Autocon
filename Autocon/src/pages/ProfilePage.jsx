import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GlassCard, Button } from '../components/ui';
import { 
  Rocket, Layers, ImageIcon, Gavel, Shield, Star, 
  Trophy, Gem, Copy, ExternalLink, Activity, User, Lock, CheckCircle2 
} from 'lucide-react';
import CryptoIcon from '../components/ui/CryptoIcon';
import '../components/dashboard/styles/dashboard.css';

export default function ProfilePage() {
  const { user, authFetch } = useAuth();
  const [deployments, setDeployments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user?.walletAddress) return;
      try {
        const r = await authFetch(`/api/contracts/my-contracts/${user.walletAddress}`);
        if (!r.ok) {
          setIsLoading(false);
          return;
        }
        const d = await r.json();
        const contracts = d.success && d.data ? d.data : [];
        const all = contracts.map(item => ({
          ...item,
          _type: item.contractType === 'ERC20' ? 'ERC-20' : item.contractType === 'ERC721' ? 'ERC-721' : 'Auction',
          symbol: item.symbol || (item.contractType === 'AUCTION' ? item.name?.substring(0, 4)?.toUpperCase() || 'AUC' : '')
        }));
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDeployments(all);
      } catch (err) {
        console.error('Failed to fetch user profile deployments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [user, authFetch]);

  const tokenCount   = deployments.filter(d => d._type === 'ERC-20').length;
  const nftCount     = deployments.filter(d => d._type === 'ERC-721').length;
  const auctionCount = deployments.filter(d => d._type === 'Auction').length;

  // Fully-defined badge inventory with conditional unlock checking
  const badgesList = [
    { cond: deployments.length >= 1,  Icon: Shield, label: 'First Deploy',    color: '#ff6b00', desc: 'Deploy 1 contract' },
    { cond: deployments.length >= 5,  Icon: Star,   label: 'Power User',      color: '#a78bfa', desc: 'Deploy 5 contracts' },
    { cond: deployments.length >= 10, Icon: Trophy, label: 'Blockchain Pro',  color: '#fbbf24', desc: 'Deploy 10 contracts' },
    { cond: tokenCount >= 3,          Icon: Gem,    label: 'Token Master',    color: '#3b82f6', desc: 'Deploy 3 ERC-20 tokens' },
    { cond: nftCount >= 1,            Icon: ImageIcon, label: 'NFT Creator',  color: '#ec4899', desc: 'Deploy 1 NFT collection' },
    { cond: auctionCount >= 1,        Icon: Gavel,  label: 'Auctioneer',      color: '#10b981', desc: 'Deploy 1 Auction contract' },
  ];

  const earnedCount = badgesList.filter(b => b.cond).length;

  const firstDeploy = deployments.length > 0
    ? new Date(deployments[deployments.length - 1].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';
  const uniqueNetworks = [...new Set(deployments.map(d => d.network).filter(Boolean))];
  const shortAddr = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';

  const typeInfo = (type) => ({
    'Auction': { color: '#fbbf24', label: 'Auction',      Icon: Gavel },
    'ERC-721': { color: '#ec4899', label: 'NFT Collection', Icon: ImageIcon },
  }[type] ?? { color: '#ff6b00', label: 'ERC-20 Token', Icon: Layers });

  const handleCopyAddress = () => {
    if (!user?.walletAddress) return;
    navigator.clipboard.writeText(user.walletAddress);
    toast.success('Wallet address copied!');
  };

  return (
    <div className="pg-wrap" style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ─── Profile Header Banner ─── */}
      <GlassCard padding="none" hoverable={false} className="overflow-hidden relative border border-white/5 bg-black/40">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[150px] rounded-full blur-[90px] pointer-events-none" 
          style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 80%)' }} />

        {/* Diagonal Tech-Pattern Banner */}
        <div style={{ 
          height: 120, 
          background: 'linear-gradient(135deg, rgba(13, 14, 18, 0.95) 0%, rgba(20, 21, 26, 0.9) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative'
        }}>
          {/* Avatar frame */}
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            style={{ 
              position: 'absolute', bottom: -30, left: 32,
              width: 72, height: 72, borderRadius: 20,
              background: 'rgba(10, 11, 15, 0.85)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', 
              overflow: 'hidden', cursor: 'pointer' 
            }}
          >
            <CryptoIcon id="metamask" size={54} />
          </motion.div>
        </div>

        {/* User Info & Quick Actions */}
        <div style={{ padding: '48px 32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'var(--db-font)', tracking: '-0.02em', margin: 0 }}>
                Web3 Builder
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399' }} /> Active
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ 
                fontFamily: 'var(--db-mono)', fontSize: 12, color: 'var(--on-surface-variant)',
                background: 'rgba(255, 255, 255, 0.03)', padding: '5px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)' 
              }}>
                {shortAddr || 'Not Connected'}
              </span>
              {user?.walletAddress && (
                <Button variant="ghost" size="sm" onClick={handleCopyAddress} style={{ gap: 6, padding: '6px 12px' }}>
                  <Copy size={12} /> Copy
                </Button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {user?.walletAddress && (
              <a 
                href={`https://sepolia.etherscan.io/address/${user.walletAddress}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ textDecoration: 'none' }}
              >
                <Button variant="secondary" size="md" style={{ gap: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                  Etherscan <ExternalLink size={13} />
                </Button>
              </a>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ─── Stats Dashboard Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Deploys',   value: deployments.length, Icon: Rocket,    color: '#ff6b00', bg: 'rgba(249, 115, 22, 0.08)' },
          { label: 'ERC-20 Tokens',   value: tokenCount,         Icon: Layers,    color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
          { label: 'NFT Collections', value: nftCount,           Icon: ImageIcon, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)' },
          { label: 'Auctions',        value: auctionCount,       Icon: Gavel,     color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.08)' },
        ].map(s => (
          <GlassCard key={s.label} padding="md" className="border border-white/5 text-center flex flex-col justify-between items-center relative overflow-hidden bg-black/40">
            {/* Ambient inner glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[35px] pointer-events-none" style={{ backgroundColor: s.color, opacity: 0.15 }} />
            
            <div className="p-3 rounded-xl mb-3 flex items-center justify-center border border-white/5" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <s.Icon size={20} style={{ color: s.color }} strokeWidth={2} />
            </div>
            <div style={{ fontFamily: 'var(--db-mono)', fontSize: 32, fontWeight: 800, color: '#fff', tracking: '-0.03em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', tracking: '0.08em', marginTop: 8 }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* ─── Double Column: Badges & Account Metrics ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Left Side: Badge Shelf */}
        <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--db-font)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} className="text-amber-400" /> Earned Badges
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white/5 text-on-surface-muted ml-auto">
              {earnedCount} / 6 Unlocked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {badgesList.map(b => {
              const BadgeIcon = b.Icon;
              return (
                <div 
                  key={b.label} 
                  style={{ 
                    padding: '16px 14px', 
                    borderRadius: 14,
                    background: b.cond ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0,0,0,0.2)', 
                    border: b.cond ? `1px solid ${b.color}25` : '1px dashed rgba(255,255,255,0.04)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 6,
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: b.cond ? 1 : 0.4
                  }}
                >
                  {/* Highlight Glow behind unlocked badge */}
                  {b.cond && (
                    <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full blur-[30px] pointer-events-none" 
                      style={{ backgroundColor: b.color, opacity: 0.15 }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: '50%', 
                      background: b.cond ? `${b.color}15` : 'rgba(255,255,255,0.02)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: b.cond ? `0.5px solid ${b.color}40` : '0.5px solid rgba(255,255,255,0.05)'
                    }}>
                      <BadgeIcon size={16} style={{ color: b.cond ? b.color : 'var(--on-surface-muted)' }} />
                    </div>
                    {b.cond ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <Lock size={12} className="text-on-surface-muted" />
                    )}
                  </div>

                  <span style={{ fontSize: 12, fontWeight: 700, color: b.cond ? '#fff' : 'var(--on-surface-muted)', marginTop: 4 }}>
                    {b.label}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--on-surface-muted)', leading: 'normal' }}>
                    {b.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Right Side: Account Details */}
        <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--db-font)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} className="text-blue-400" /> Account Metrics
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'First Deployment',  value: firstDeploy },
              { label: 'Networks Utilized', value: uniqueNetworks.join(', ') || 'None' },
              { label: 'Badges Earned', value: `${earnedCount} / 6 Achievements` },
              { label: 'Contract Architect',  value: deployments.length > 0 ? 'Verified' : 'Pending' },
              { label: 'Member Since',  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A' },
            ].map(row => (
              <div 
                key={row.label} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)' 
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'var(--db-font)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ─── Recent Activity Timeline ─── */}
      <GlassCard padding="md" hoverable={false} className="border border-white/5 bg-black/40">
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--db-font)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} style={{ color: '#ff6b00' }} /> Recent Deployments Activity
        </div>

        {isLoading ? (
          <div role="status" aria-label="Loading activity" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--on-surface-variant)', fontSize: 13, padding: '20px 0' }}>
            <div className="spinner spinner-sm" />
            <span>Syncing activity logs...</span>
          </div>
        ) : deployments.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--on-surface-muted)', textAlign: 'center', padding: '32px 0' }}>
            No recent deployments found. Start a contract from the template library to build activity!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {deployments.slice(0, 5).map((item, idx) => {
              const ti = typeInfo(item._type);
              return (
                <div 
                  key={item._id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                    padding: '14px 12px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    transition: 'all 0.25s ease'
                  }}
                  className="hover:border-white/10 hover:bg-white/[0.02]"
                >
                  <div style={{ 
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${ti.color}12`, border: `1px solid ${ti.color}25`,
                    display: 'flex', alignItems: 'center', justify: 'center',
                    justifyContent: 'center' 
                  }}>
                    <ti.Icon size={18} style={{ color: ti.color }} strokeWidth={2.2} />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', tracking: '-0.01em' }}>
                      Deployed {ti.label}: <span style={{ color: ti.color }}>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--on-surface-muted)', fontFamily: 'var(--db-mono)' }}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>·</span>
                      <span style={{ fontSize: 11, color: 'var(--on-surface-muted)', textTransform: 'uppercase', tracking: '0.05em', fontWeight: 600 }}>
                        {item.network}
                      </span>
                    </div>
                  </div>

                  {item.contractAddress && (
                    <a 
                      href={`https://sepolia.etherscan.io/address/${item.contractAddress}`}
                      target="_blank" 
                      rel="noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant="ghost" size="sm" style={{ gap: 6, color: 'var(--on-surface-variant)' }}>
                        <span style={{ fontFamily: 'var(--db-mono)' }}>
                          {item.contractAddress.slice(0, 6)}...{item.contractAddress.slice(-4)}
                        </span>
                        <ExternalLink size={12} />
                      </Button>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

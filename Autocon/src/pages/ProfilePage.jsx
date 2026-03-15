import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, authFetch } = useAuth();
    const [deployments, setDeployments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const shortAddr = user?.walletAddress
        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
        : '';

    useEffect(() => {
        const fetchAll = async () => {
            if (!user?.walletAddress) return;
            const allAssets = [];

            try {
                const tokensRes = await authFetch(`/api/my-tokens/${user.walletAddress}`);
                const tokensData = await tokensRes.json();
                if (tokensData.success && tokensData.tokens) {
                    tokensData.tokens.forEach(t => allAssets.push({ ...t, _type: 'ERC-20' }));
                }
            } catch (e) { /* ignore */ }

            try {
                const nftsRes = await authFetch(`/api/nft/my-nfts/${user.walletAddress}`);
                const nftsData = await nftsRes.json();
                if (nftsData.success && nftsData.nfts) {
                    nftsData.nfts.forEach(n => allAssets.push({ ...n, _type: 'ERC-721' }));
                }
            } catch (e) { /* ignore */ }

            try {
                const auctionsRes = await authFetch(`/api/auction/my-auctions/${user.walletAddress}`);
                const auctionsData = await auctionsRes.json();
                if (auctionsData.success && auctionsData.auctions) {
                    auctionsData.auctions.forEach(a => allAssets.push({ ...a, _type: 'Auction' }));
                }
            } catch (e) { /* ignore */ }

            allAssets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setDeployments(allAssets);
            setIsLoading(false);
        };
        fetchAll();
    }, [user, authFetch]);

    const tokenCount = deployments.filter(d => d._type === 'ERC-20').length;
    const nftCount = deployments.filter(d => d._type === 'ERC-721').length;
    const auctionCount = deployments.filter(d => d._type === 'Auction').length;

    // Milestone badges
    const badges = [];
    if (deployments.length >= 1) badges.push({ icon: '🏅', label: 'First Deploy', color: '#06b6d4' });
    if (deployments.length >= 5) badges.push({ icon: '🌟', label: 'Power User', color: '#a78bfa' });
    if (deployments.length >= 10) badges.push({ icon: '🏆', label: 'Blockchain Pro', color: '#f59e0b' });
    if (nftCount >= 1) badges.push({ icon: '🎨', label: 'NFT Creator', color: '#ec4899' });
    if (auctionCount >= 1) badges.push({ icon: '🔨', label: 'Auctioneer', color: '#f59e0b' });
    if (tokenCount >= 3) badges.push({ icon: '💎', label: 'Token Master', color: '#06b6d4' });

    // Activity timeline (last 5)
    const recentActivity = deployments.slice(0, 5);

    // Stats
    const firstDeploy = deployments.length > 0
        ? new Date(deployments[deployments.length - 1].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';

    const uniqueNetworks = [...new Set(deployments.map(d => d.network).filter(Boolean))];

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Profile Header Card */}
            <div className="card animate-fade-in-up" style={{
                padding: '0', overflow: 'hidden', marginBottom: '24px'
            }}>
                {/* Gradient Banner */}
                <div style={{
                    height: '120px',
                    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute', bottom: '-32px', left: '32px',
                        width: '72px', height: '72px',
                        background: 'var(--bg-card)',
                        borderRadius: '20px',
                        border: '4px solid var(--bg-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}>
                        🦊
                    </div>
                </div>

                <div style={{ padding: '44px 32px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                Web3 Builder
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent)',
                                    background: 'var(--accent-glow)', padding: '4px 12px', borderRadius: '8px',
                                    border: '1px solid rgba(6,182,212,0.2)'
                                }}>
                                    {user?.walletAddress || ''}
                                </span>
                                <button onClick={() => { navigator.clipboard.writeText(user?.walletAddress || ''); toast.success('Address copied!'); }}
                                    style={{
                                        padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                        background: 'transparent', color: 'var(--text-muted)', fontSize: '0.7rem',
                                        fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                                    }}>📋 Copy</button>
                            </div>
                        </div>
                        <a
                            href={`https://sepolia.etherscan.io/address/${user?.walletAddress}`}
                            target="_blank" rel="noreferrer"
                            style={{
                                padding: '8px 16px', borderRadius: '10px',
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600,
                                textDecoration: 'none', transition: 'all 0.2s ease'
                            }}
                        >View on Etherscan ↗</a>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="animate-fade-in-up delay-100" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px'
            }}>
                {[
                    { label: 'Total Deploys', value: deployments.length, icon: '🚀', color: '#06b6d4' },
                    { label: 'ERC-20 Tokens', value: tokenCount, icon: '🪙', color: '#8b5cf6' },
                    { label: 'NFT Collections', value: nftCount, icon: '🎨', color: '#ec4899' },
                    { label: 'Auctions', value: auctionCount, icon: '🔨', color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>{s.icon}</span>
                        <p style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, marginBottom: '4px' }}>{s.value}</p>
                        <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Badges + Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Badges */}
                <div className="card animate-fade-in-up delay-200" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        🏆 Earned Badges
                    </h3>
                    {badges.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Deploy your first contract to earn badges!</p>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {badges.map(b => (
                                <div key={b.label} style={{
                                    padding: '10px 16px', borderRadius: '14px',
                                    background: `${b.color}15`,
                                    border: `1px solid ${b.color}30`,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <span style={{ fontSize: '1.3rem' }}>{b.icon}</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: b.color }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Account Info */}
                <div className="card animate-fade-in-up delay-300" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        📋 Account Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>First Deploy</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{firstDeploy}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Networks Used</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{uniqueNetworks.join(', ') || 'None'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Badges Earned</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{badges.length} / 6</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Member Since</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="card animate-fade-in-up delay-400" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    📜 Recent Activity
                </h3>
                {isLoading ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p>
                ) : recentActivity.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No deployments yet. Create your first contract!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {recentActivity.map((item, idx) => {
                            const typeInfo = item._type === 'Auction'
                                ? { icon: '🔨', color: '#f59e0b', label: 'Auction' }
                                : item._type === 'ERC-721'
                                    ? { icon: '🎨', color: '#ec4899', label: 'NFT Collection' }
                                    : { icon: '🪙', color: '#06b6d4', label: 'ERC-20 Token' };
                            return (
                                <div key={item._id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                                    padding: '14px 0',
                                    borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none'
                                }}>
                                    {/* Timeline dot */}
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                                        background: `${typeInfo.color}15`,
                                        border: `1px solid ${typeInfo.color}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem'
                                    }}>{typeInfo.icon}</div>

                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                            Deployed {typeInfo.label}: <span style={{ color: typeInfo.color }}>{item.name}</span>
                                        </p>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {item.contractAddress && (
                                                <a
                                                    href={`https://sepolia.etherscan.io/address/${item.contractAddress}`}
                                                    target="_blank" rel="noreferrer"
                                                    style={{ fontSize: '0.72rem', color: 'var(--accent)', textDecoration: 'none' }}
                                                >
                                                    {item.contractAddress.substring(0, 10)}...{item.contractAddress.substring(36)} ↗
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

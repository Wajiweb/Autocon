import { useState, useEffect, memo, lazy, Suspense } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LiveCryptoGraph from '../components/dashboard/LiveCryptoGraph';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import EmptyState from '../components/dashboard/EmptyState';
import { SkeletonTable } from '../components/dashboard/LoadingSkeleton';
import { SkeletonDashboard } from '../components/dashboard/LoadingSkeleton';

// Lazy-load the 3D background so it doesn’t block the dashboard data
const DashboardScene = lazy(() => import('../3d/DashboardScene'));

// ─── Memoized table — isolates renders from gas-ticker polling ───
const DeploymentTable = memo(function DeploymentTable({ filteredDeployments, isLoading, activeFilter, setActiveFilter, shortAddr, handleDelete }) {
  return (
    <div className="card animate-fade-in-up delay-400" style={{ overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
      {/* Table Header with Filter Tabs */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--on-surface)' }}>Deployment Registry</h2>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-highest)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
            {[{ id: 'all', label: 'All' }, { id: 'ERC-20', label: 'Tokens' }, { id: 'ERC-721', label: 'NFTs' }, { id: 'Auction', label: 'Auctions' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveFilter(tab.id)}
                style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease', background: activeFilter === tab.id ? 'var(--primary-gradient)' : 'transparent', color: activeFilter === tab.id ? 'white' : 'var(--outline)' }}
              >{tab.label}</button>
            ))}
          </div>
        </div>
        <span className="badge badge-accent">{shortAddr || 'Disconnected'}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              {['Asset', 'Type', 'Contract Address', 'Timestamp', 'Actions'].map(header => (
                <th key={header} style={{ padding: '14px 28px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: header === 'Actions' ? 'right' : 'left' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" style={{ padding: '20px 28px' }}><SkeletonTable rows={3} /></td></tr>
            ) : filteredDeployments.length > 0 ? filteredDeployments.map((item) => {
              const isNFT = item._type === 'ERC-721';
              const isAuction = item._type === 'Auction';
              const typeColors = isAuction
                ? { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b', icon: '🔨', label: 'Auction' }
                : isNFT
                  ? { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#a78bfa', icon: '🎨', label: 'ERC-721' }
                  : { bg: 'var(--accent-glow)', border: 'rgba(6,182,212,0.2)', text: 'var(--accent)', icon: '🪙', label: 'ERC-20' };
              return (
                <tr key={item._id} style={{ transition: 'background 0.2s ease, transform 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-highest)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <td style={{ padding: '18px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: `linear-gradient(135deg, ${typeColors.bg}, transparent)`, border: `1px solid ${typeColors.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem', color: typeColors.text, textTransform: 'uppercase' }}>{(item.symbol || item.name || '').substring(0, 3)}</div>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>{item.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>{item.network} Network{isNFT && item.maxSupply ? ` · ${item.maxSupply} max` : ''}{isAuction && item.itemName ? ` · ${item.itemName}` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 700, background: typeColors.bg, color: typeColors.text, border: `1px solid ${typeColors.border}` }}>{typeColors.icon} {typeColors.label}</span>
                  </td>
                  <td style={{ padding: '18px 28px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{item.contractAddress.substring(0, 10)}...{item.contractAddress.substring(36)}</td>
                  <td style={{ padding: '18px 28px', fontSize: '0.8rem', color: 'var(--outline)' }}>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => { navigator.clipboard.writeText(item.contractAddress); toast.success('Address copied!'); }} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '7px 14px' }}>📋 Copy</button>
                      <button onClick={() => { window.open(`http://localhost:5000/api/site/view?contractAddress=${item.contractAddress}&network=${item.network}&name=${encodeURIComponent(item.name)}&type=${item._type}`, '_blank'); toast.success('Minting Site Opened! 🌐'); }} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '7px 14px', background: 'rgba(0,240,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,240,255,0.2)' }} title="Open your hosted Web3 Minting website">🌐 Site</button>
                      <button onClick={() => handleDelete(item)} className="btn-danger" style={{ padding: '7px 12px' }}>🗑️</button>
                      <a href={`https://sepolia.etherscan.io/address/${item.contractAddress}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '7px 14px', textDecoration: 'none', color: 'var(--accent)', borderColor: 'rgba(6,182,212,0.2)', background: 'var(--accent-glow)' }}>Explorer ↗</a>
                    </div>
                  </td>
                </tr>
              );
            }) : null}
          </tbody>
        </table>
        {!isLoading && filteredDeployments.length === 0 && (
          <div style={{ marginTop: '24px' }}>
            <EmptyState title={activeFilter === 'all' ? 'No deployments yet' : `No ${activeFilter} found`} description="Use the generators in the sidebar to create and deploy your first smart contract without writing code." />
          </div>
        )}
      </div>
      <LiveCryptoGraph />
    </div>
  );
});

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [deployments, setDeployments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        if (!user?.walletAddress) return;

        const allAssets = [];

        // Fetch tokens (independent try/catch so one failure doesn't block the other)
        try {
          const tokensRes = await authFetch(`/api/token/my-tokens/${user.walletAddress}`);
          const tokensData = await tokensRes.json();
          if (tokensData.success && tokensData.tokens) {
            tokensData.tokens.forEach(t => allAssets.push({ ...t, _type: 'ERC-20' }));
          }
        } catch (err) {
          console.error("Token fetch error:", err);
        }

        // Fetch NFTs
        try {
          const nftsRes = await authFetch(`/api/nft/my-nfts/${user.walletAddress}`);
          const nftsData = await nftsRes.json();
          if (nftsData.success && nftsData.nfts) {
            nftsData.nfts.forEach(n => allAssets.push({ ...n, _type: 'ERC-721' }));
          }
        } catch (err) {
          console.error("NFT fetch error:", err);
        }

        // Fetch Auctions
        try {
          const auctionsRes = await authFetch(`/api/auction/my-auctions/${user.walletAddress}`);
          const auctionsData = await auctionsRes.json();
          if (auctionsData.success && auctionsData.auctions) {
            auctionsData.auctions.forEach(a => allAssets.push({ ...a, _type: 'Auction', symbol: a.name?.substring(0, 4)?.toUpperCase() || 'AUC' }));
          }
        } catch (err) {
          console.error("Auction fetch error:", err);
        }

        // Sort all by creation date (newest first)
        allAssets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDeployments(allAssets);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAssets();
  }, [user, authFetch]);

  const executeDelete = async (item) => {
    const deleteToast = toast.loading("Removing from registry...");
    const endpoint = item._type === 'ERC-721'
      ? `/api/nft/delete/${item._id}`
      : item._type === 'Auction'
        ? `/api/auction/delete/${item._id}`
        : `/api/token/delete-token/${item._id}`;

    try {
      const res = await authFetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeployments(prev => prev.filter(d => d._id !== item._id));
        toast.success("Deployment removed!", { id: deleteToast });
      }
    } catch (_error) {
      toast.error("Failed to delete.", { id: deleteToast });
    }
  };

  const handleDelete = (item) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
          Remove this {item._type === 'ERC-721' ? 'NFT collection' : 'token'}?
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--outline)', margin: 0 }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '8px 16px' }}
          >Cancel</button>
          <button
            onClick={() => { toast.dismiss(t.id); executeDelete(item); }}
            className="btn-danger"
            style={{ padding: '8px 16px' }}
          >Delete</button>
        </div>
      </div>
    ), { duration: Infinity, id: "delete-confirm" });
  };

  const shortAddr = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';

  const tokenCount = deployments.filter(d => d._type === 'ERC-20').length;
  const nftCount = deployments.filter(d => d._type === 'ERC-721').length;
  const auctionCount = deployments.filter(d => d._type === 'Auction').length;

  const filteredDeployments = activeFilter === 'all'
    ? deployments
    : deployments.filter(d => d._type === activeFilter);

  // ─── Export Functions ───
  const exportCSV = () => {
    if (deployments.length === 0) return toast.error('No deployments to export.');
    const headers = ['Name', 'Symbol', 'Type', 'Contract Address', 'Network', 'Date'];
    const rows = deployments.map(d => [
      d.name, d.symbol || '', d._type,
      d.contractAddress, d.network || 'Sepolia',
      new Date(d.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `autocon_deployments_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const exportPDF = () => {
    if (deployments.length === 0) return toast.error('No deployments to export.');
    const printWindow = window.open('', '_blank');
    const html = `<!DOCTYPE html><html><head><title>AutoCon Deployment Report</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a2e}h1{color:#06b6d4;border-bottom:2px solid #06b6d4;padding-bottom:10px}
    table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#f0f9ff;color:#0891b2;padding:12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px}
    td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}.badge{padding:3px 8px;border-radius:12px;font-size:11px;font-weight:bold}
    .erc20{background:#e0f2fe;color:#0284c7}.erc721{background:#f3e8ff;color:#7c3aed}.auction{background:#fef3c7;color:#d97706}
    .footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:11px}</style></head>
    <body><h1>⚡ AutoCon Deployment Report</h1>
    <p>Wallet: <code>${user?.walletAddress || ''}</code></p>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table><tr><th>Name</th><th>Type</th><th>Contract Address</th><th>Network</th><th>Date</th></tr>
    ${deployments.map(d => `<tr><td><strong>${d.name}</strong></td>
    <td><span class="badge ${d._type === 'ERC-20' ? 'erc20' : d._type === 'ERC-721' ? 'erc721' : 'auction'}">${d._type}</span></td>
    <td style="font-family:monospace;font-size:11px">${d.contractAddress}</td>
    <td>${d.network || 'Sepolia'}</td>
    <td>${new Date(d.createdAt).toLocaleDateString()}</td></tr>`).join('')}
    </table><div class="footer">AutoCon — No-Code Web3 Smart Contract Platform</div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    toast.success('PDF report generated!');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 3D background — fixed, pointer-events-none, low opacity */}
      <Suspense fallback={null}>
        <DashboardScene />
      </Suspense>



      {/* Header */}
      <div className="animate-fade-in-up flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '99px', marginBottom: '12px',
            background: 'rgba(103,232,249,0.07)', border: '1px solid rgba(103,232,249,0.15)',
            fontSize: '0.67rem', fontWeight: 700, color: '#080c14',
            textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 6px var(--success)' }} />
            Live Dashboard
          </div>
          <h1 style={{ color: 'var(--on-surface)', marginBottom: 'var(--space-1)' }}>
            Executive <span className="gradient-text">Overview</span>
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
            Real-time monitoring of your blockchain assets.
          </p>
        </div>
        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportCSV} style={{
            padding: '8px 16px', borderRadius: '10px',
            border: '1px solid var(--outline-variant)',
            background: 'rgba(255,255,255,0.03)', color: 'var(--on-surface-variant)',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s ease'
          }}>📄 CSV</button>
          <button onClick={exportPDF} style={{
            padding: '8px 16px', borderRadius: '10px',
            border: '1px solid var(--outline-variant)',
            background: 'rgba(255,255,255,0.03)', color: 'var(--on-surface-variant)',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s ease'
          }}>📑 PDF</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-cards" style={{ marginBottom: 'var(--space-4)' }}>
        {/* Total Assets */}
        <div className="stat-card animate-fade-in-up delay-100">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Assets</p>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <img src="dist/folder.png" alt="Total Assets" style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <p style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--on-surface)', lineHeight: 1 }}>{deployments.length}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--outline)', marginTop: '6px' }}>All contract types</p>
        </div>

        {/* ERC-20 Tokens */}
        <div className="stat-card animate-fade-in-up delay-200">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#2563EB,#06B6D4)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>ERC-20 Tokens</p>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              
            </div>
          </div>
          <p className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1 }}>{tokenCount}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--outline)', marginTop: '6px' }}>Fungible tokens deployed</p>
        </div>

        {/* NFT Collections */}
        <div className="stat-card animate-fade-in-up delay-300">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#8b5cf6,#ec4899)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>NFT Collections</p>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <img src="dist/coin.png" alt="ERC-20 Tokens" style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <p style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{nftCount}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--outline)', marginTop: '6px' }}>ERC-721 collections</p>
        </div>

        {/* Status */}
        <div className="stat-card animate-fade-in-up delay-400">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#10b981,#06b6d4)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Status</p>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✅</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse-glow 2.5s infinite' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>Systems Online</p>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--outline)', marginTop: '6px' }}>All services operational</p>
        </div>
      </div>

      {/* Milestone Badges + Social Proof */}
      {deployments.length > 0 && (
        <div className="card animate-fade-in-up delay-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-5 p-6">
          {/* Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {deployments.length >= 1 && (
              <span style={{
                padding: '6px 14px', borderRadius: '50px',
                fontSize: '0.7rem', fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.1))',
                color: 'var(--accent)',
                border: '1px solid rgba(6,182,212,0.2)'
              }}>🏅 First Deploy</span>
            )}
            {deployments.length >= 5 && (
              <span style={{
                padding: '6px 14px', borderRadius: '50px',
                fontSize: '0.7rem', fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.2)'
              }}>🌟 Power User</span>
            )}
            {deployments.length >= 10 && (
              <span style={{
                padding: '6px 14px', borderRadius: '50px',
                fontSize: '0.7rem', fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.2)'
              }}>🏆 Blockchain Pro</span>
            )}
            {nftCount >= 1 && (
              <span style={{
                padding: '6px 14px', borderRadius: '50px',
                fontSize: '0.7rem', fontWeight: 700,
                background: 'rgba(236,72,153,0.1)',
                color: '#ec4899',
                border: '1px solid rgba(236,72,153,0.2)'
              }}>🎨 NFT Creator</span>
            )}
            {auctionCount >= 1 && (
              <span style={{
                padding: '6px 14px', borderRadius: '50px',
                fontSize: '0.7rem', fontWeight: 700,
                background: 'rgba(245,158,11,0.1)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.2)'
              }}>🔨 Auctioneer</span>
            )}
          </div>

          {/* Share Button */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              ` Just deployed ${deployments.length} smart contract${deployments.length > 1 ? 's' : ''} on Sepolia using AutoCon! No-code Web3 is the future. #Web3 #Blockchain #SmartContracts #AutoCon`
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none',
              background: '#1DA1F2', color: 'white',
              fontWeight: 700, fontSize: '0.78rem',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(29,161,242,0.3)'
            }}
          >
             <img src="dist/twitter.png" alt="Twitter" style={{ width: '16px', height: '16px' }} />
             Share on X
          </a>
        </div>
      )}

      {!isLoading && deployments.length > 0 && <AnalyticsCharts deployments={deployments} />}

      <DeploymentTable
        filteredDeployments={filteredDeployments}
        isLoading={isLoading}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        shortAddr={shortAddr}
        handleDelete={handleDelete}
      />
    </div>
  );
}
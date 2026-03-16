import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import CryptoNewsTicker from '../components/CryptoNewsTicker';
import AnalyticsCharts from '../components/AnalyticsCharts';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/LoadingSkeleton';
import { SkeletonDashboard } from '../components/LoadingSkeleton';

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
          const tokensRes = await authFetch(`/api/my-tokens/${user.walletAddress}`);
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
        : `/api/delete-token/${item._id}`;

    try {
      const res = await authFetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeployments(prev => prev.filter(d => d._id !== item._id));
        toast.success("Deployment removed!", { id: deleteToast });
      }
    } catch (error) {
      toast.error("Failed to delete.", { id: deleteToast });
    }
  };

  const handleDelete = (item) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Remove this {item._type === 'ERC-721' ? 'NFT collection' : 'token'}?
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>This action cannot be undone.</p>
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
    <div>
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Header */}
      <div className="animate-fade-in-up" style={{
        marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
            color: 'var(--text-primary)', marginBottom: '8px'
          }}>
            Executive <span className="gradient-text">Overview</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time monitoring of your blockchain assets.
          </p>
        </div>
        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportCSV} style={{
            padding: '8px 16px', borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)', color: 'var(--text-secondary)',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s ease'
          }}>📄 CSV</button>
          <button onClick={exportPDF} style={{
            padding: '8px 16px', borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)', color: 'var(--text-secondary)',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s ease'
          }}>📑 PDF</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="card animate-fade-in-up delay-100" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            Total Assets
          </p>
          <p style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {deployments.length}
          </p>
        </div>
        <div className="card animate-fade-in-up delay-200" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            ERC-20 Tokens
          </p>
          <p className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>
            {tokenCount}
          </p>
        </div>
        <div className="card animate-fade-in-up delay-300" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            NFT Collections
          </p>
          <p style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {nftCount}
          </p>
        </div>
        <div className="card animate-fade-in-up delay-400" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            Status
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>
              Systems Online
            </p>
          </div>
        </div>
      </div>

      {/* Milestone Badges + Social Proof */}
      {deployments.length > 0 && (
        <div className="animate-fade-in-up delay-400" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', padding: '18px 24px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}>
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
              `🚀 Just deployed ${deployments.length} smart contract${deployments.length > 1 ? 's' : ''} on Sepolia using AutoCon! No-code Web3 is the future. #Web3 #Blockchain #SmartContracts #AutoCon`
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
            🐦 Share on X
          </a>
        </div>
      )}

      {!isLoading && deployments.length > 0 && (
        <AnalyticsCharts deployments={deployments} />
      )}

      {/* Deployment Table */}
      <div className="card animate-fade-in-up delay-400" style={{ overflow: 'hidden', marginBottom: '24px' }}>
        {/* Table Header with Filter Tabs */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Deployment Registry
            </h2>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', borderRadius: '10px', padding: '3px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'ERC-20', label: 'Tokens' },
                { id: 'ERC-721', label: 'NFTs' },
                { id: 'Auction', label: 'Auctions' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', border: 'none',
                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s ease',
                    background: activeFilter === tab.id
                      ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                      : 'transparent',
                    color: activeFilter === tab.id ? 'white' : 'var(--text-muted)'
                  }}
                >{tab.label}</button>
              ))}
            </div>
          </div>
          <span className="badge badge-accent">
            {shortAddr || 'Disconnected'}
          </span>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Asset', 'Type', 'Contract Address', 'Timestamp', 'Actions'].map(header => (
                  <th key={header} style={{
                    padding: '14px 28px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    textAlign: header === 'Actions' ? 'right' : 'left'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '20px 28px' }}>
                    <SkeletonTable rows={3} />
                  </td>
                </tr>
              ) : filteredDeployments.length > 0 ? filteredDeployments.map((item) => {
                const isNFT = item._type === 'ERC-721';
                const isAuction = item._type === 'Auction';
                const typeColors = isAuction
                  ? { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b', icon: '🔨', label: 'Auction' }
                  : isNFT
                    ? { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#a78bfa', icon: '🎨', label: 'ERC-721' }
                    : { bg: 'var(--accent-glow)', border: 'rgba(6,182,212,0.2)', text: 'var(--accent)', icon: '🪙', label: 'ERC-20' };
                return (
                  <tr key={item._id} className="table-row" style={{
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,240,255,0.05)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <td style={{ padding: '18px 28px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px', height: '42px',
                          background: `linear-gradient(135deg, ${typeColors.bg}, transparent)`,
                          border: `1px solid ${typeColors.border}`,
                          borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '0.7rem',
                          color: typeColors.text,
                          textTransform: 'uppercase'
                        }}>
                          {(item.symbol || item.name || '').substring(0, 3)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.name}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {item.network} Network
                            {isNFT && item.maxSupply ? ` · ${item.maxSupply} max` : ''}
                            {isAuction && item.itemName ? ` · ${item.itemName}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '50px',
                        fontSize: '0.65rem', fontWeight: 700,
                        background: typeColors.bg,
                        color: typeColors.text,
                        border: `1px solid ${typeColors.border}`
                      }}>
                        {typeColors.icon} {typeColors.label}
                      </span>
                    </td>
                    <td style={{ padding: '18px 28px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {item.contractAddress.substring(0, 10)}...{item.contractAddress.substring(36)}
                    </td>
                    <td style={{ padding: '18px 28px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.contractAddress);
                            toast.success("Address copied!");
                          }}
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '7px 14px' }}
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => {
                            const url = `http://localhost:5000/api/site/view?contractAddress=${item.contractAddress}&network=${item.network}&name=${encodeURIComponent(item.name)}&type=${item._type}`;
                            window.open(url, '_blank');
                            toast.success('Minting Site Opened! 🌐');
                          }}
                          className="btn-secondary"
                          style={{
                            fontSize: '0.75rem', padding: '7px 14px',
                            background: 'rgba(0, 240, 255, 0.1)',
                            color: 'var(--neon-primary)',
                            border: '1px solid rgba(0, 240, 255, 0.2)'
                          }}
                          title="Open your hosted Web3 Minting website"
                        >
                          🌐 Site
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn-danger"
                          style={{ padding: '7px 12px' }}
                        >
                          🗑️
                        </button>
                        <a
                          href={`https://sepolia.etherscan.io/address/${item.contractAddress}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{
                            fontSize: '0.75rem', padding: '7px 14px',
                            textDecoration: 'none',
                            color: 'var(--accent)',
                            borderColor: 'rgba(6,182,212,0.2)',
                            background: 'var(--accent-glow)'
                          }}
                        >
                          Explorer ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              }) : null}
            </tbody>
          </table>
          
          {!isLoading && filteredDeployments.length === 0 && (
            <div style={{ marginTop: '24px' }}>
              <EmptyState 
                title={activeFilter === 'all' ? "No deployments yet" : `No ${activeFilter} found`}
                description="Use the generators in the sidebar to create and deploy your first smart contract without writing code."
              />
            </div>
          )}
        </div>

        {/* Crypto Market & News */}
        <CryptoNewsTicker />
      </div>
    </div>
  );
}
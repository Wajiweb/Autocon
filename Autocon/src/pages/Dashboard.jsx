import { useState, useEffect, memo, lazy, Suspense, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { API_BASE } from '../config';
import AssetGrid from '../components/dashboard/AssetGrid';
import ChartModal from '../components/dashboard/ChartModal';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import EmptyState from '../components/dashboard/EmptyState';
import { SkeletonTable } from '../components/dashboard/LoadingSkeleton';
import useSelectedCoin from '../hooks/useSelectedCoin';
import '../components/dashboard/styles/dashboard.css';

const DashboardScene = lazy(() => import('../3d/DashboardScene'));

/* ─── Stat sparkline helper ─────────────────────────── */
function SparkSVG({ up, color }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const d2 = [50];
    for (let i = 1; i < 14; i++) {
      const trend = up ? 0.3 : -0.3;
      d2.push(Math.max(10, Math.min(90, d2[i - 1] + (Math.random() - 0.5 + trend) * 8)));
    }
    const W = 200, H = 30;
    const max = Math.max(...d2), min = Math.min(...d2), range = max - min || 1;
    const pts = d2.map((v, i) => {
      const x = ((i / (d2.length - 1)) * W).toFixed(1);
      const y = (H - ((v - min) / range) * (H * 0.82) - H * 0.08).toFixed(1);
      return `${x},${y}`;
    });
    const len = Math.ceil(pts.reduce((acc, _, i) => {
      if (i === 0) return 0;
      const [x1, y1] = pts[i - 1].split(',').map(Number);
      const [x2, y2] = pts[i].split(',').map(Number);
      return acc + Math.hypot(x2 - x1, y2 - y1);
    }, 0));
    const gId = `sg${color.replace(/[^a-z0-9]/gi, '')}${Math.random().toString(36).slice(2, 6)}`;
    const fillPts = `${pts[0]} ${pts.join(' ')} ${W},${H} 0,${H}`;
    ref.current.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="${fillPts}" fill="url(#${gId})" style="opacity:0;animation:db-fadeUp .9s ease .4s forwards"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"
        style="stroke-dasharray:${len};stroke-dashoffset:${len};animation:db-drawLine .9s ease .3s forwards"/>
    </svg>`;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} className="db-sc-spark" />;
}

/* ─── Deployment Table ──────────────────────────────── */
const DeploymentTable = memo(function DeploymentTable({
  filteredDeployments, isLoading, activeFilter, setActiveFilter, shortAddr, handleDelete
}) {
  const [search, setSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState(filteredDeployments);

  useEffect(() => {
    if (!search) { setSearchFilter(filteredDeployments); return; }
    const q = search.toLowerCase();
    setSearchFilter(filteredDeployments.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.contractAddress?.toLowerCase().includes(q) ||
      d._type?.toLowerCase().includes(q)
    ));
  }, [search, filteredDeployments]);

  const typeStyles = (type) => ({
    'ERC-20':  { pillClass: '',        icon: '◈', label: 'ERC-20',  color: '#818cf8', bg: 'rgba(129,140,248,.12)' },
    'ERC-721': { pillClass: 'nft',     icon: '⬡', label: 'ERC-721', color: '#60a5fa', bg: 'rgba(96,165,250,.12)'  },
    'Auction': { pillClass: 'auction', icon: '◉', label: 'Auction', color: '#f59e0b', bg: 'rgba(245,158,11,.12)'  },
  }[type] || { pillClass: '', icon: '◈', label: type, color: '#818cf8', bg: 'rgba(129,140,248,.12)' });

  return (
    <div className="db-table-card db-enter db-enter-6">
      <div className="db-table-head">
        <span className="db-th-title">Deployment Registry</span>
        <div className="db-tab-pills">
          {[
            { id: 'all', label: 'All' },
            { id: 'ERC-20', label: 'Tokens' },
            { id: 'ERC-721', label: 'NFTs' },
            { id: 'Auction', label: 'Auctions' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`db-tp${activeFilter === tab.id ? ' on' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="db-search-wrap">
          <span className="db-search-icon">⌕</span>
          <input
            className="db-search-box"
            placeholder="Search contracts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="db-table">
        <thead>
          <tr>
            {['Asset', 'Type', 'Contract Address', 'Deployed', 'Actions'].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="5" style={{ padding: '20px 22px' }}><SkeletonTable rows={3} /></td></tr>
          ) : (searchFilter || []).length > 0
            ? (searchFilter || []).map(item => {
                const ts = typeStyles(item._type);
                const sym = (item.symbol || item.name || '').substring(0, 3).toUpperCase();
                return (
                  <tr key={item._id}>
                    <td>
                      <div className="db-ta-asset">
                        <div className="db-ta-av" style={{ background: ts.bg, color: ts.color }}>{sym}</div>
                        <div>
                          <div className="db-ta-name">{item.name}</div>
                          <div className="db-ta-net">{item.network || 'Sepolia'} · {item._type}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`db-type-pill ${ts.pillClass}`}>{ts.icon} {ts.label}</span></td>
                    <td><span className="db-addr-txt">{item.contractAddress.slice(0, 10)}…{item.contractAddress.slice(-6)}</span></td>
                    <td><span className="db-ts-txt">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                    <td>
                      <div className="db-acts">
                        <button className="db-act" title="Copy address"
                          onClick={() => { navigator.clipboard.writeText(item.contractAddress); toast.success('Address copied!'); }}>
                          ⎘
                        </button>
                        <button className="db-act" title="View site"
                          onClick={() => {
                            window.open(`${API_BASE}/api/site/view?contractAddress=${item.contractAddress}&network=${item.network}&name=${encodeURIComponent(item.name)}&type=${item._type}`, '_blank');
                            toast.success('Minting Site Opened! 🌐');
                          }}>
                          ◈
                        </button>
                        <button className="db-act del" title="Delete" onClick={() => handleDelete(item)}>✕</button>
                        <a
                          href={(() => {
                            const n = (item.network || '').toLowerCase();
                            if (n.includes('amoy') || n.includes('polygon')) return `https://amoy.polygonscan.com/address/${item.contractAddress}`;
                            if (n.includes('bnb') || n.includes('bsc'))      return `https://testnet.bscscan.com/address/${item.contractAddress}`;
                            return `https://sepolia.etherscan.io/address/${item.contractAddress}`;
                          })()}
                          target="_blank" rel="noreferrer"
                          className="db-act exp"
                        >
                          Explorer ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>

      {!isLoading && (searchFilter || []).length === 0 && (
        <div style={{ padding: '32px 22px' }}>
          <EmptyState
            title={activeFilter === 'all' ? 'No deployments yet' : `No ${activeFilter} found`}
            description="Use the generators in the sidebar to deploy your first smart contract."
          />
        </div>
      )}
    </div>
  );
});

/* ─── Counter animation ─────────────────────────────── */
function useCounter(target, delay = 300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (target === 0) { setVal(0); return; }
      const dur = 700, start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, delay]);
  return val;
}

/* ─── Main Dashboard ────────────────────────────────── */
export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const { network } = useNetwork();
  const [deployments, setDeployments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCoin, openModal, closeModal } = useSelectedCoin();

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        if (!user?.walletAddress) return;
        const allAssets = [];
        const fetches = [
          { url: `/api/token/my-tokens/${user.walletAddress}`, key: 'tokens', type: 'ERC-20' },
          { url: `/api/nft/my-nfts/${user.walletAddress}`, key: 'nfts', type: 'ERC-721' },
          { url: `/api/auction/my-auctions/${user.walletAddress}`, key: 'auctions', type: 'Auction' },
        ];
        await Promise.all(fetches.map(async ({ url, key, type }) => {
          try {
            const res = await authFetch(url);
            const data = await res.json();
            if (data.success && data[key]) {
              data[key].forEach(item => allAssets.push({
                ...item,
                _type: type,
                ...(type === 'Auction' ? { symbol: item.name?.substring(0, 4)?.toUpperCase() || 'AUC' } : {}),
              }));
            }
          } catch (e) { console.error(type, 'fetch error:', e); }
        }));
        allAssets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDeployments(allAssets);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAssets();
  }, [user, authFetch]);

  const executeDelete = async (item) => {
    const tid = toast.loading('Removing from registry…');
    const endpoint = {
      'ERC-721': `/api/nft/delete/${item._id}`,
      'Auction': `/api/auction/delete/${item._id}`,
    }[item._type] ?? `/api/token/delete-token/${item._id}`;
    try {
      const res = await authFetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeployments(prev => prev.filter(d => d._id !== item._id));
        toast.success('Deployment removed!', { id: tid });
      }
    } catch (_) { toast.error('Failed to delete.', { id: tid }); }
  };

  const handleDelete = (item) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontWeight: 700, color: 'var(--db-t1)', margin: 0, fontFamily: 'var(--db-font)' }}>
          Remove this {item._type === 'ERC-721' ? 'NFT collection' : item._type === 'Auction' ? 'auction' : 'token'}?
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--db-t3)', margin: 0 }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => toast.dismiss(t.id)}
            style={{ padding: '6px 14px', borderRadius: 7, border: '.5px solid var(--db-br)', background: 'transparent', color: 'var(--db-t2)', cursor: 'pointer', fontFamily: 'var(--db-font)', fontSize: 12 }}>Cancel</button>
          <button onClick={() => { toast.dismiss(t.id); executeDelete(item); }}
            style={{ padding: '6px 14px', borderRadius: 7, border: '.5px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.12)', color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--db-font)', fontSize: 12 }}>Delete</button>
        </div>
      </div>
    ), { duration: Infinity, id: 'delete-confirm' });
  };

  const shortAddr = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';

  const tokenCount   = deployments.filter(d => d._type === 'ERC-20').length;
  const nftCount     = deployments.filter(d => d._type === 'ERC-721').length;
  const auctionCount = deployments.filter(d => d._type === 'Auction').length;

  const filteredDeployments = activeFilter === 'all'
    ? deployments
    : deployments.filter(d => d._type === activeFilter);

  // Animated counters
  const totalCount   = useCounter(deployments.length, 300);
  const tokenCounted = useCounter(tokenCount, 350);
  const nftCounted   = useCounter(nftCount, 400);

  // Export CSV
  const exportCSV = () => {
    if (!deployments.length) return toast.error('No deployments to export.');
    const headers = ['Name', 'Symbol', 'Type', 'Contract Address', 'Network', 'Date'];
    const rows = deployments.map(d => [d.name, d.symbol || '', d._type, d.contractAddress, d.network || 'Sepolia', new Date(d.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `autocon_${Date.now()}.csv` });
    a.click();
    toast.success('CSV exported!');
  };

  const exportPDF = () => {
    if (!deployments.length) return toast.error('No deployments to export.');
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>AutoCon Report</title>
      <style>body{font-family:sans-serif;padding:32px;color:#111}h1{color:#16a34a}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #e5e7eb;text-align:left}th{background:#f0fdf4;color:#15803d;font-size:12px}</style></head>
      <body><h1>AutoCon Deployment Report</h1><p>Wallet: ${user?.walletAddress}</p><p>Generated: ${new Date().toLocaleString()}</p>
      <table><tr>${['Name','Type','Address','Network','Date'].map(h=>`<th>${h}</th>`).join('')}</tr>
      ${deployments.map(d=>`<tr><td>${d.name}</td><td>${d._type}</td><td style="font-family:monospace;font-size:11px">${d.contractAddress}</td><td>${d.network||'Sepolia'}</td><td>${new Date(d.createdAt).toLocaleDateString()}</td></tr>`).join('')}
      </table></body></html>`);
    w.document.close(); w.print();
    toast.success('PDF report generated!');
  };

  return (
    <>
      {/* 3D background */}
      <Suspense fallback={null}><DashboardScene /></Suspense>

      <div className="db-content">

        {/* ── Page Header ── */}
        <div className="db-page-head db-enter db-enter-1">
          <div>
            <div className="db-ph-title">Executive <em>Overview</em></div>
            <div className="db-ph-sub">Real-time monitoring of your blockchain assets · {network.name}</div>
          </div>
          <div className="db-ph-actions">
            <button className="db-btn" onClick={exportCSV}>↓ CSV</button>
            <button className="db-btn" onClick={exportPDF}>↓ PDF</button>
            {deployments.length > 0 && (
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just deployed ${deployments.length} smart contract${deployments.length > 1 ? 's' : ''} on Sepolia using AutoCon! #Web3 #AutoCon`)}`}
                target="_blank" rel="noreferrer"
                className="db-btn accent"
                style={{ textDecoration: 'none' }}
              >
                𝕏 Share
              </a>
            )}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="db-stat-row db-enter db-enter-2">
          <div className="db-stat-card c-green">
            <div className="db-sc-top">
              <span className="db-sc-label">Total Assets</span>
              <div className="db-sc-ico g">◈</div>
            </div>
            <div className="db-sc-num g">{totalCount}</div>
            <div className="db-sc-desc">All contract types deployed</div>
            <SparkSVG up color="#22c55e" />
          </div>

          <div className="db-stat-card c-blue">
            <div className="db-sc-top">
              <span className="db-sc-label">ERC-20 Tokens</span>
              <div className="db-sc-ico b">⬡</div>
            </div>
            <div className="db-sc-num b">{tokenCounted}</div>
            <div className="db-sc-desc">Fungible tokens deployed</div>
            <SparkSVG up color="#60a5fa" />
          </div>

          <div className="db-stat-card c-amber">
            <div className="db-sc-top">
              <span className="db-sc-label">NFT Collections</span>
              <div className="db-sc-ico a">⬢</div>
            </div>
            <div className="db-sc-num a">{nftCounted}</div>
            <div className="db-sc-desc">ERC-721 collections</div>
            <SparkSVG up={nftCount > 0} color="#f59e0b" />
          </div>
        </div>

        {/* ── Status Banner ── */}
        <div className="db-status-bar db-enter db-enter-3">
          <div className="db-status-left">
            <div className="db-online-ring" />
            <div>
              <div className="db-status-txt">Systems Online</div>
              <div className="db-status-sub">All services operational · Wallet {shortAddr || 'not connected'}</div>
            </div>
          </div>
          <div className="db-status-metrics">
            <div className="db-sm-item">
              <div className="db-sm-val">{deployments.length}</div>
              <div className="db-sm-lbl">Contracts</div>
            </div>
            <div className="db-sm-item">
              <div className="db-sm-val">{auctionCount}</div>
              <div className="db-sm-lbl">Auctions</div>
            </div>
            <div className="db-sm-item">
              <div className="db-sm-val">99.9%</div>
              <div className="db-sm-lbl">Uptime</div>
            </div>
          </div>
        </div>

        {/* ── Live Asset Grid ── */}
        <AssetGrid onSelectCoin={openModal} />

        {/* ── Analytics Charts ── */}
        {!isLoading && deployments.length > 0 && (
          <AnalyticsCharts deployments={deployments} />
        )}

        {/* ── Deployment Table ── */}
        <DeploymentTable
          filteredDeployments={filteredDeployments}
          isLoading={isLoading}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          shortAddr={shortAddr}
          handleDelete={handleDelete}
        />

      </div>

      {/* ── Chart Modal ── */}
      <ChartModal coin={selectedCoin} onClose={closeModal} />
    </>
  );
}
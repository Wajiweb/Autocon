import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import AssetGrid from '../components/dashboard/AssetGrid';
import ChartModal from '../components/dashboard/ChartModal';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import useSelectedCoin from '../hooks/useSelectedCoin';
import '../components/dashboard/styles/dashboard.css';
import OnboardingTour from '../components/dashboard/OnboardingTour';
import DeploymentTable from '../components/dashboard/DeploymentTable';
import Sparkline from '../components/ui/Sparkline';
import { exportDeploymentsCSV, exportDeploymentsPDF } from '../utils/exportUtils';
import { Button } from '../components/ui/Button';

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
            const responseData = await res.json();
            if (responseData.success) {
              // The backend wraps responses in a `data` object
              const items = responseData.data ? responseData.data[key] : responseData[key];
              if (items) {
                items.forEach(item => allAssets.push({
                  ...item,
                  _type: type,
                  ...(type === 'Auction' ? { symbol: item.name?.substring(0, 4)?.toUpperCase() || 'AUC' } : {}),
                }));
              }
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
          <Button variant="ghost" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={() => { toast.dismiss(t.id); executeDelete(item); }}>Delete</Button>
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

  return (
    <>
      <OnboardingTour />
      <div className="db-content">

        {/* ── Page Header ── */}
        <div className="db-page-head db-enter db-enter-1">
          <div>
            <div className="db-ph-title">Executive <em>Overview</em></div>
            <div className="db-ph-sub">Real-time monitoring of your blockchain assets · {network.name}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportDeploymentsCSV(deployments)}>↓ CSV</Button>
            <Button variant="secondary" onClick={() => exportDeploymentsPDF(deployments, user?.walletAddress)}>↓ PDF</Button>
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
            <Sparkline up color="#22c55e" />
          </div>

          <div className="db-stat-card c-blue">
            <div className="db-sc-top">
              <span className="db-sc-label">ERC-20 Tokens</span>
              <div className="db-sc-ico b">⬡</div>
            </div>
            <div className="db-sc-num b">{tokenCounted}</div>
            <div className="db-sc-desc">Fungible tokens deployed</div>
            <Sparkline up color="#60a5fa" />
          </div>

          <div className="db-stat-card c-amber">
            <div className="db-sc-top">
              <span className="db-sc-label">NFT Collections</span>
              <div className="db-sc-ico a">⬢</div>
            </div>
            <div className="db-sc-num a">{nftCounted}</div>
            <div className="db-sc-desc">ERC-721 collections</div>
            <Sparkline up={nftCount > 0} color="#f59e0b" />
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
          <AnalyticsCharts deployments={deployments} networkName={network.name} />
        )}

        {/* ── Deployment Table ── */}
        <DeploymentTable
          filteredDeployments={filteredDeployments}
          isLoading={isLoading}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          handleDelete={handleDelete}
        />

      </div>

      {/* ── Chart Modal ── */}
      <ChartModal coin={selectedCoin} onClose={closeModal} />
    </>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import AssetGrid from '../components/dashboard/AssetGrid';
import ChartModal from '../components/dashboard/ChartModal';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import useSelectedCoin from '../hooks/useSelectedCoin';
import '../components/dashboard/styles/dashboard.css';
/* Phase 3: useCounter extracted to src/hooks/useCounter.js (react-patterns: hooks in hooks/) */
import { useCounter } from '../hooks/useCounter';
import DeploymentTable from '../components/dashboard/DeploymentTable';
import Sparkline from '../components/ui/Sparkline';
import { exportDeploymentsCSV, exportDeploymentsPDF } from '../utils/exportUtils';
import { Button } from '../components/ui/Button';
import { usePlatformStore } from '../store/usePlatformStore';
import { AnimatedDashboardCard } from '../components/ui/animated-dashboard-card';
import { Download, Share2 } from 'lucide-react';

/* ─── Main Dashboard ────────────────────────────────── */

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const { network } = useNetwork();
  const { deployments, setDeployments, isInitialLoad } = usePlatformStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const isLoading = isInitialLoad;
  const { selectedCoin, openModal, closeModal } = useSelectedCoin();



  /* Phase 3 — react-component-performance:
     useCallback: executeDelete was a new function reference every render.
     DeploymentTable receiving a new handler on each render busts any React.memo
     optimizations inside it. Stable reference via useCallback. */
  const executeDelete = useCallback(async (item) => {
    const tid = toast.loading('Removing from registry…');
    const endpoint = `/api/contracts/delete/${item._id}`;
    try {
      const res = await authFetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeployments(prev => prev.filter(d => d._id !== item._id));
        toast.success('Deployment removed!', { id: tid });
      }
    } catch (_) { toast.error('Failed to delete.', { id: tid }); }
  }, [authFetch, setDeployments]);

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

  /* Phase 3 — react-component-performance:
     useMemo: filteredDeployments was recomputed on EVERY render (any state change).
     Now recomputes only when deployments array reference or activeFilter changes. */
  const filteredDeployments = useMemo(
    () => activeFilter === 'all'
      ? deployments
      : deployments.filter(d => d._type === activeFilter),
    [deployments, activeFilter]
  );

  // Animated counters
  const totalCount   = useCounter(deployments.length, 300);
  const tokenCounted = useCounter(tokenCount, 350);
  const nftCounted   = useCounter(nftCount, 400);

  return (
    <>
      {/* OnboardingTour is mounted at App level (App.jsx) — NOT here.
          Previously double-mounted, causing driver.js to init twice per /dashboard visit.
          architect-review: one component, one mount point — SRP. */}
      <div className="db-content">

        {/* ── Page Header ── */}
        <section className="mb-10">
          <div className="db-page-head db-enter db-enter-1">
            <div>
              <div className="db-ph-title">Executive <em>Overview</em></div>
              <div className="db-ph-sub">Real-time monitoring of your blockchain assets · {network.name}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => exportDeploymentsCSV(deployments)}><Download size={14} /> CSV</Button>
              <Button variant="secondary" onClick={() => exportDeploymentsPDF(deployments, user?.walletAddress)}><Download size={14} /> PDF</Button>
              {deployments.length > 0 && (
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just deployed ${deployments.length} smart contract${deployments.length > 1 ? 's' : ''} on Sepolia using AutoCon! #Web3 #AutoCon`)}`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', height: 'fit-content' }}
                >
                  <Share2 size={16} /> Share
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Status Banner ── */}
        <section className="mb-8">
          <div
            className="flex items-center justify-between p-4 px-6 rounded-2xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] db-enter db-enter-2 transition-transform hover:scale-[1.01]"
            style={{ background: 'var(--surface-low)' }}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Systems Online</h3>
                <p className="text-[11px] mt-0.5 tracking-wide" style={{ color: 'var(--on-surface-variant)' }}>All services operational · Wallet {shortAddr || 'not connected'}</p>
              </div>
            </div>
            <div className="flex gap-8 text-right">
              <div>
                <p className="text-lg font-mono font-semibold text-white leading-none">{deployments.length}</p>
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--on-surface-muted)' }}>Contracts</p>
              </div>
              <div>
                <p className="text-lg font-mono font-semibold text-white leading-none">{auctionCount}</p>
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--on-surface-muted)' }}>Auctions</p>
              </div>
              <div>
                <p className="text-lg font-mono font-semibold leading-none" style={{ color: 'var(--success)' }}>99.9%</p>
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--on-surface-muted)' }}>Uptime</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ── */}
        <section className="mb-8">
          <div className="db-enter db-enter-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Phase 2: accentColor hex props → semantic variant prop (design system tokens) */}
            <AnimatedDashboardCard 
              title="TOTAL DEPLOYMENTS"
              mainValue={totalCount.toString()}
              variant="primary"
              delayOffset={0}
              leftLabel="Network"
              leftValue="Sepolia"
              leftSub="Active"
              rightLabel="Status"
              rightValue="Online"
              rightSub="Live"
            />
            <AnimatedDashboardCard 
              title="FUNGIBLE TOKENS"
              mainValue={tokenCounted.toString()}
              variant="blue"
              delayOffset={0.15}
              leftLabel="Standard"
              leftValue="ERC-20"
              leftSub="Verified"
              rightLabel="Type"
              rightValue="Utility"
              rightSub="Mintable"
            />
            <AnimatedDashboardCard 
              title="DIGITAL ASSETS"
              mainValue={(nftCounted + auctionCount).toString()}
              variant="green"
              delayOffset={0.3}
              leftLabel="Collections"
              leftValue={nftCounted.toString()}
              leftSub="ERC-721"
              rightLabel="Auctions"
              rightValue={auctionCount.toString()}
              rightSub="Live"
            />
          </div>
        </section>

        {/* ── Analytics Charts ── */}
        {!isLoading && deployments.length > 0 && (
          <section className="mb-8 db-enter db-enter-4">
            <AnalyticsCharts deployments={deployments} networkName={network.name} />
          </section>
        )}

        {/* ── Live Asset Grid ── */}
        <section className="mb-8 db-enter db-enter-5">
          <AssetGrid onSelectCoin={openModal} />
        </section>

        {/* ── Deployment Table ── */}
        <section className="mb-8 db-enter db-enter-6">
          <DeploymentTable
            filteredDeployments={filteredDeployments}
            isLoading={isLoading}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            handleDelete={handleDelete}
          />
        </section>

      </div>

      {/* ── Chart Modal ── */}
      <ChartModal coin={selectedCoin} onClose={closeModal} />
    </>
  );
}

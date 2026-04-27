import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../config';
import { SkeletonTable } from './LoadingSkeleton';
import EmptyState from './EmptyState';
import JobStatusBadge from './JobStatusBadge';
import { useVerificationStore } from '../../store/useVerificationStore';
import { useAuth } from '../../context/AuthContext';

const EXPLORER_URLS = {
  sepolia: 'https://sepolia.etherscan.io',
  mainnet: 'https://etherscan.io',
  amoy: 'https://amoy.polygonscan.com',
  polygon: 'https://polygonscan.com',
  bsc: 'https://bscscan.com',
  'bsc-testnet': 'https://testnet.bscscan.com',
};

function getExplorerUrl(network) {
  const n = (network || '').toLowerCase();
  if (n.includes('amoy') || n.includes('polygon') && n.includes('test')) return EXPLORER_URLS.amoy;
  if (n.includes('polygon')) return EXPLORER_URLS.polygon;
  if (n.includes('bnb') || n.includes('bsc') && n.includes('test')) return EXPLORER_URLS['bsc-testnet'];
  if (n.includes('bsc') || n.includes('bnb')) return EXPLORER_URLS.bsc;
  if (n.includes('mainnet') || n === 'ethereum') return EXPLORER_URLS.mainnet;
  return EXPLORER_URLS.sepolia;
}

export default function DeploymentTable({ filteredDeployments, isLoading, activeFilter, setActiveFilter, handleDelete }) {
  const [search, setSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState(filteredDeployments);
  const { authFetch } = useAuth();
  const { verificationJobs, updateVerificationStatus, setVerificationJob, getVerificationJob } = useVerificationStore();
  useEffect(() => {
    if (!search) { setSearchFilter(filteredDeployments); return; }
    const q = search.toLowerCase();
    setSearchFilter(filteredDeployments.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.contractAddress?.toLowerCase().includes(q) ||
      d._type?.toLowerCase().includes(q)
    ));
  }, [search, filteredDeployments]);

  const handleVerify = async (item) => {
    const job = verificationJobs[item.contractAddress];
    if (job?.status === 'pending' || job?.status === 'processing') return;

    const tid = toast.loading('Submitting verification...');
    try {
      const res = await authFetch(`${API_BASE}/api/jobs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'verification',
          payload: {
            contractAddress: item.contractAddress,
            sourceCode: item.sourceCode,
            contractName: item.name,
            compilerVersion: item.compilerVersion || 'v0.8.20+commit.a1b79de6',
            network: item.network || 'sepolia',
          }
        }),
      });
      const data = await res.json();
      
      if (data.success && data.jobId) {
        setVerificationJob(item.contractAddress, data.jobId);
        toast.success('Verification submitted!', { id: tid });
      } else {
        toast.error(data.error || 'Verification failed to submit.', { id: tid });
      }
    } catch (err) {
      toast.error('Failed to submit verification.', { id: tid });
    }
  };

  const getVerificationBadge = (item) => {
    const job = getVerificationJob(item.contractAddress);
    const status = job?.status?.toLowerCase();
    
    // If we have a completed job or the backend already knows it's verified
    if (status === 'completed' || item.isVerified) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
            background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)',
            width: 'fit-content'
          }}>
            ✅ Verified
          </span>
          {job?.updatedAt && (
            <span style={{ fontSize: '0.65rem', color: 'var(--db-t3)', marginLeft: 4 }}>
              Verified at: {new Date(job.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      );
    }
    
    // Delegate to existing JobStatusBadge for live job tracking (pending, processing, failed)
    if (job?.jobId) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <JobStatusBadge 
            jobId={job.jobId} 
            type="verification" 
            compact 
            onComplete={(result) => updateVerificationStatus(item.contractAddress, { status: 'completed', result })}
            onFailed={(error) => updateVerificationStatus(item.contractAddress, { status: 'failed', error })}
          />
          {status === 'failed' && (
            <span style={{ fontSize: '0.65rem', color: '#f87171', marginLeft: 4 }}>
              Verification failed. You can retry.
            </span>
          )}
        </div>
      );
    }

    // Default empty state
    return (
      <span style={{ color: 'var(--db-t3)', fontSize: '0.8rem' }}>Not verified</span>
    );
  };

  const getExplorerLink = (item) => {
    const job = verificationJobs[item.contractAddress];
    const status = job?.status?.toLowerCase();
    
    if ((status === 'completed' || item.isVerified) && item.contractAddress) {
      const baseUrl = getExplorerUrl(item.network);
      return (
        <a
          href={`${baseUrl}/address/${item.contractAddress}#code`}
          target="_blank"
          rel="noreferrer"
          className="db-act exp"
          style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', borderColor: 'rgba(52,211,153,0.35)' }}
        >
          View on Explorer ↗
        </a>
      );
    }
    return null;
  };

  const typeStyles = (type) => ({
    'ERC-20': { pillClass: '', icon: '◈', label: 'ERC-20', color: '#818cf8', bg: 'rgba(129,140,248,.12)' },
    'ERC-721': { pillClass: 'nft', icon: '⬡', label: 'ERC-721', color: '#60a5fa', bg: 'rgba(96,165,250,.12)' },
    'Auction': { pillClass: 'auction', icon: '◉', label: 'Auction', color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
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
            {['Asset', 'Type', 'Verification', 'Contract Address', 'Deployed', 'Actions'].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="6" style={{ padding: '20px 22px' }}><SkeletonTable rows={3} /></td></tr>
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
                    <td>{getVerificationBadge(item)}</td>
                    <td><span className="db-addr-txt">{item.contractAddress.slice(0, 10)}…{item.contractAddress.slice(-6)}</span></td>
                    <td><span className="db-ts-txt">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                    <td>
                      <div className="db-acts">
                        <button className="db-act" title="Copy address"
                          onClick={() => { navigator.clipboard.writeText(item.contractAddress); toast.success('Address copied!'); }}>
                          ⎘
                        </button>
                        {!item.isVerified && (!verificationJobs[item.contractAddress]?.jobId || verificationJobs[item.contractAddress]?.status?.toLowerCase() === 'failed') && (
                          <button className="db-act" title="Verify Contract"
                            onClick={() => handleVerify(item)}
                            disabled={verificationJobs[item.contractAddress]?.status?.toLowerCase() === 'pending' || verificationJobs[item.contractAddress]?.status?.toLowerCase() === 'processing'}
                            style={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.35)', background: 'rgba(96,165,250,0.08)' }}
                          >
                            ✓
                          </button>
                        )}
                        <button className="db-act" title="View site"
                          onClick={() => {
                            window.open(`${API_BASE}/api/site/view?contractAddress=${item.contractAddress}&network=${item.network}&name=${encodeURIComponent(item.name)}&type=${item._type}`, '_blank');
                            toast.success('Minting Site Opened! 🌐');
                          }}>
                          ◈
                        </button>
                        {getExplorerLink(item) || (
                          <a
                            href={(() => {
                              const n = (item.network || '').toLowerCase();
                              if (n.includes('amoy') || n.includes('polygon')) return `https://amoy.polygonscan.com/address/${item.contractAddress}`;
                              if (n.includes('bnb') || n.includes('bsc')) return `https://testnet.bscscan.com/address/${item.contractAddress}`;
                              return `https://sepolia.etherscan.io/address/${item.contractAddress}`;
                            })()}
                            target="_blank" rel="noreferrer"
                            className="db-act exp"
                          >
                            Explorer ↗
                          </a>
                        )}
                        <button className="db-act del" title="Delete" onClick={() => handleDelete(item)}>✕</button>
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
}
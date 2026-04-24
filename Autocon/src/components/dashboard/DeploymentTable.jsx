import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../config';
import { SkeletonTable } from './LoadingSkeleton';
import EmptyState from './EmptyState';

export default function DeploymentTable({ filteredDeployments, isLoading, activeFilter, setActiveFilter, handleDelete }) {
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
  }

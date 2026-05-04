import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { usePlatformStore } from '../store/usePlatformStore';

const POLL_INTERVAL_MS = 10_000;

export function usePlatformSync() {
  const { user, authFetch } = useAuth();
  const { setDeployments, setJobs, setStats, setSyncStatus, deployments, jobs } = usePlatformStore();
  const deploymentsRef = useRef(deployments);
  const jobsRef = useRef(jobs);

  // Keep refs up to date to avoid dependency cycle in setInterval
  useEffect(() => { deploymentsRef.current = deployments; }, [deployments]);
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);

  useEffect(() => {
    if (!user?.walletAddress) return;

    const fetchAll = async () => {
      setSyncStatus(true);
      try {
        // 1. Fetch Deployments
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
            const items = data.success ? (data.data?.[key] ?? data[key]) : null;
            if (items) {
              console.log('[usePlatformSync] Fetched', type, 'count:', items.length, 'first item has sourceCode:', items[0]?.sourceCode?.length > 0);
              items.forEach(item => allAssets.push({
                ...item,
                _type: type,
                ...(type === 'Auction' ? { symbol: item.name?.substring(0, 4)?.toUpperCase() || 'AUC' } : {}),
              }));
            }
          } catch (e) { console.error('Fetch error for', type, e); }
        }));
        
        allAssets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Diff deployments to notify user of new ones
        const currentIds = new Set(deploymentsRef.current.map(d => d._id));
        const newAssets = allAssets.filter(a => !currentIds.has(a._id));
        if (deploymentsRef.current.length > 0 && newAssets.length > 0) {
          // It's not the initial load and we found new items
          newAssets.forEach(asset => {
            toast.success(`New ${asset._type} discovered: ${asset.name}`);
          });
        }
        
        // Only update state if length changed to minimize re-renders (simple diff)
        if (allAssets.length !== deploymentsRef.current.length || newAssets.length > 0) {
           setDeployments(allAssets);
        }

        // 2. Fetch Jobs & Stats
        try {
          const [jobsRes, statsRes] = await Promise.all([
            authFetch('/api/jobs'),
            authFetch('/api/jobs/stats'),
          ]);
          
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            const fetchedJobs = jobsData.success ? (jobsData.data?.jobs ?? jobsData.jobs ?? []) : [];
            
            // Diff jobs to notify user of completions
            if (jobsRef.current.length > 0) {
              fetchedJobs.forEach(newJob => {
                const oldJob = jobsRef.current.find(j => j.jobId === newJob.jobId);
                if (oldJob && oldJob.status !== 'completed' && newJob.status === 'completed') {
                  toast.success(`Job completed: ${newJob.contractName}`);
                }
                if (oldJob && oldJob.status !== 'failed' && newJob.status === 'failed') {
                  toast.error(`Job failed: ${newJob.contractName}`);
                }
              });
            }
            setJobs(fetchedJobs);
          }
          
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.data || statsData.stats);
          }
        } catch (e) {
          console.error('Job fetch error:', e);
        }

      } catch (err) {
        console.error('Sync error:', err);
      } finally {
        setSyncStatus(false, Date.now());
      }
    };

    // Initial fetch
    fetchAll();

    // Poll
    const intervalId = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [user, authFetch, setDeployments, setJobs, setStats, setSyncStatus]);
}

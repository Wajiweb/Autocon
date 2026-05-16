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
  /* Phase 3 fix: authFetch from context may be a new reference each render.
     Store it in a ref so the polling interval always calls the latest version
     without needing authFetch in the effect dependency array (which would
     tear down + restart the interval on every render). */
  const authFetchRef = useRef(authFetch);
  useEffect(() => { authFetchRef.current = authFetch; }, [authFetch]);

  // Keep refs up to date to avoid dependency cycle in setInterval
  useEffect(() => { deploymentsRef.current = deployments; }, [deployments]);
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);

  useEffect(() => {
    if (!user?.walletAddress) return;

    const fetchAll = async () => {
      setSyncStatus(true);
      try {
        // 1. Fetch Deployments
        const res = await authFetchRef.current(`/api/contracts/my-contracts/${user.walletAddress}`);
        if (!res.ok) {
          console.error('Sync error: contract fetch failed with status', res.status);
          setSyncStatus(false, Date.now());
          return; // Bail out — don't process empty/invalid data
        }
        const data = await res.json();
        
        const allAssets = data.success && data.data ? data.data.map(item => ({
            ...item,
            _type: item.contractType === 'ERC20' ? 'ERC-20' : item.contractType === 'ERC721' ? 'ERC-721' : 'Auction',
            symbol: item.symbol || (item.contractType === 'AUCTION' ? item.name?.substring(0, 4)?.toUpperCase() || 'AUC' : '')
        })) : [];

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
        toast.error('Failed to sync with server. Check your connection.');
      } finally {
        setSyncStatus(false, Date.now());
      }
    };

    // Initial fetch
    fetchAll();

    // Poll
    const intervalId = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [user, setDeployments, setJobs, setStats, setSyncStatus]);
  /* Phase 3: removed authFetch from deps — it's accessed via authFetchRef.current
     to prevent the polling interval from restarting on every render where
     authFetch reference changes. (react-component-performance: stable intervals) */
}

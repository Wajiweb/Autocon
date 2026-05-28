import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { usePlatformStore } from '../store/usePlatformStore';
import { getMyContracts } from '../services/contractApi';
import { getJobs, getJobStats } from '../services/jobApi';

const POLL_INTERVAL_MS = 10_000;

export function usePlatformSync() {
  const { user, authFetch } = useAuth();
  const { setDeployments, setJobs, setStats, setSyncStatus, deployments, jobs } = usePlatformStore();
  const deploymentsRef = useRef(deployments);
  const jobsRef = useRef(jobs);
  
  /* authFetch from context may be a new reference each render.
     Store it in a ref so the polling interval always calls the latest version. */
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
        const contracts = await getMyContracts(authFetchRef.current, user.walletAddress);
        const allAssets = contracts.map(item => ({
          ...item,
          _type: item.contractType === 'ERC20' ? 'ERC-20' : item.contractType === 'ERC721' ? 'ERC-721' : 'Auction',
          symbol: item.symbol || (item.contractType === 'AUCTION' ? item.name?.substring(0, 4)?.toUpperCase() || 'AUC' : '')
        }));

        // Diff deployments to notify user of new ones
        const currentIds = new Set(deploymentsRef.current.map(d => d._id));
        const newAssets = allAssets.filter(a => !currentIds.has(a._id));
        if (deploymentsRef.current.length > 0 && newAssets.length > 0) {
          newAssets.forEach(asset => {
            toast.success(`New ${asset._type} discovered: ${asset.name}`);
          });
        }
        
        // Only update state if length changed or new items are present to minimize re-renders
        if (allAssets.length !== deploymentsRef.current.length || newAssets.length > 0) {
          setDeployments(allAssets);
        }

        // 2. Fetch Jobs & Stats
        try {
          const [fetchedJobs, fetchedStats] = await Promise.all([
            getJobs(authFetchRef.current),
            getJobStats(authFetchRef.current),
          ]);
          
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
          
          if (fetchedStats) {
            setStats(fetchedStats);
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
}

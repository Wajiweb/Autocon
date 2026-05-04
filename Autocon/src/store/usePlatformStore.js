import { create } from 'zustand';

export const usePlatformStore = create((set) => ({
  deployments: [],
  jobs: [],
  stats: null,
  isSyncing: false,
  lastSynced: null,
  isInitialLoad: true,

  setDeployments: (deployments) => set({ deployments }),
  setJobs: (jobs) => set({ jobs }),
  setStats: (stats) => set({ stats }),
  setSyncStatus: (isSyncing, lastSynced) => set((state) => ({
    isSyncing,
    lastSynced: lastSynced || state.lastSynced,
    isInitialLoad: false
  }))
}));

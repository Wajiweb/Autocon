import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVerificationStore = create(
  persist(
    (set, get) => ({
      verificationJobs: {},

      setVerificationJob: (contractAddress, jobId) => {
        set((state) => ({
          verificationJobs: {
            ...state.verificationJobs,
            [contractAddress]: {
              jobId,
              status: 'pending',
              result: null,
              error: null,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      updateVerificationStatus: (contractAddress, updates) => {
        set((state) => ({
          verificationJobs: {
            ...state.verificationJobs,
            [contractAddress]: {
              ...state.verificationJobs[contractAddress],
              ...updates,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      getVerificationJob: (contractAddress) => {
        return get().verificationJobs[contractAddress] || null;
      },

      clearVerificationJob: (contractAddress) => {
        set((state) => {
          const { [contractAddress]: _, ...rest } = state.verificationJobs;
          return { verificationJobs: rest };
        });
      },

      clearAllVerificationJobs: () => {
        set({ verificationJobs: {} });
      },
    }),
    {
      name: 'autocon-verification-storage',
      partialize: (state) => ({ verificationJobs: state.verificationJobs }),
    }
  )
);
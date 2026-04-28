/**
 * queryClient.js
 * Singleton React Query client for the landing page data layer.
 * Scoped to landing — does NOT touch the main app's data flow.
 *
 * Config:
 * - staleTime: 5 min (landing content rarely changes per session)
 * - retry: 1 (one retry on fail before falling back to defaults)
 * - refetchOnWindowFocus: false (static landing data)
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000, // 5 minutes
      gcTime:               10 * 60 * 1000, // 10 minutes
      retry:                1,
      refetchOnWindowFocus: false,
      refetchOnMount:       false,
    },
  },
});

import { API_BASE } from '../config';

/**
 * Fetches the user's active background jobs.
 */
export async function getJobs(authFetch) {
  const res = await authFetch(`${API_BASE}/api/jobs`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch jobs');
  }
  return data.data?.jobs ?? data.jobs ?? [];
}

/**
 * Fetches background job execution statistics.
 */
export async function getJobStats(authFetch) {
  const res = await authFetch(`${API_BASE}/api/jobs/stats`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch stats');
  }
  return data.data ?? data.stats ?? null;
}

/**
 * Fetches the status of a specific job by ID.
 */
export async function getJobStatus(authFetch, jobId) {
  const res = await authFetch(`${API_BASE}/api/jobs/${jobId}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch job status');
  }
  return data.data ?? data.job ?? null;
}

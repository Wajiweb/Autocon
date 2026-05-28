import { API_BASE } from '../config';

/**
 * Submits a new security audit job.
 */
export async function createAuditJob(authFetch, contractCode, contractType) {
  const res = await authFetch(`${API_BASE}/api/jobs/create`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'audit',
      payload: { contractCode, contractType }
    })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to start audit job');
  }
  return data.jobId;
}

/**
 * Requests an AI explanation of contract audit vulnerabilities.
 */
export async function explainAudit(authFetch, vulnerabilities, contractCode) {
  const res = await authFetch(`${API_BASE}/api/ai/audit-explain`, {
    method: 'POST',
    body: JSON.stringify({ vulnerabilities, contractCode })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to get AI explanations');
  }
  return data.data;
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useJobPoller
 *
 * Polls GET /api/jobs/:jobId on an interval until the job reaches
 * a terminal state ('completed' or 'failed'), then stops.
 *
 * Returns:
 *   {
 *     status:   'pending' | 'processing' | 'completed' | 'failed' | null,
 *     result:   object | null,    — populated on success
 *     error:    string | null,    — populated on failure
 *     attempts: number,
 *     progress: number,           — 0-100 estimate based on status
 *     isPolling: boolean,
 *     startPolling: (jobId) => void,
 *     stopPolling: () => void,
 *   }
 *
 * Usage:
 *   const { status, result, error, progress, startPolling } = useJobPoller();
 *   // After enqueuing:
 *   startPolling(jobId);
 */
export function useJobPoller({
    pollIntervalMs   = 3000,   // Poll every 3 seconds
    timeoutMs        = 300000, // Stop after 5 minutes regardless
} = {}) {
    const { authFetch } = useAuth();
    const [jobId,     setJobId]     = useState(null);
    const [status,    setStatus]    = useState(null);
    const [result,    setResult]    = useState(null);
    const [error,     setError]     = useState(null);
    const [attempts,  setAttempts]  = useState(0);
    const [isPolling, setIsPolling] = useState(false);

    const intervalRef  = useRef(null);
    const timeoutRef   = useRef(null);
    const activeJobRef = useRef(null);

    // Compute a UX-friendly 0–100 progress estimate from status
    const getProgress = (s) => {
        if (!s || s === 'pending')      return 10;
        if (s === 'processing')         return 55;
        if (s === 'completed')          return 100;
        if (s === 'failed')             return 100;
        return 0;
    };

    const stopPolling = useCallback(() => {
        if (intervalRef.current)  clearInterval(intervalRef.current);
        if (timeoutRef.current)   clearTimeout(timeoutRef.current);
        intervalRef.current = null;
        timeoutRef.current  = null;
        setIsPolling(false);
    }, []);

    const poll = useCallback(async (id) => {
        try {
            const res  = await authFetch(`/api/jobs/${id}`);
            const data = await res.json();

            if (!data.success) {
                console.warn(`[useJobPoller] Server error for job ${id}:`, data.error);
                return;
            }

            const { status: s, result: r, error: e, attempts: a } = data.job;

            setStatus(s);
            setAttempts(a ?? 0);

            if (s === 'completed') {
                setResult(r);
                setError(null);
                stopPolling();
            } else if (s === 'failed') {
                setError(e || 'Job failed after maximum retries.');
                setResult(null);
                stopPolling();
            }
        } catch (err) {
            // Network hiccup — do NOT stop polling, just log and wait for next interval
            console.warn(`[useJobPoller] Poll error for job ${id}:`, err.message);
        }
    }, [authFetch, stopPolling]);

    const startPolling = useCallback((id) => {
        if (!id) return;

        // Reset all state for a fresh job
        setJobId(id);
        setStatus('pending');
        setResult(null);
        setError(null);
        setAttempts(0);
        setIsPolling(true);
        activeJobRef.current = id;

        // Immediate first poll
        poll(id);

        // Start interval
        intervalRef.current = setInterval(() => {
            if (activeJobRef.current) poll(activeJobRef.current);
        }, pollIntervalMs);

        // Hard timeout — stop polling even if job is stuck
        timeoutRef.current = setTimeout(() => {
            console.warn(`[useJobPoller] Polling timeout reached for job ${id}`);
            setError('Job is taking longer than expected. Please check back later.');
            stopPolling();
        }, timeoutMs);
    }, [poll, pollIntervalMs, timeoutMs, stopPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    return {
        jobId,
        status,
        result,
        error,
        attempts,
        progress:   getProgress(status),
        isPolling,
        startPolling,
        stopPolling,
    };
}

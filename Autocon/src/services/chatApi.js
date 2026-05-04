import { API_BASE } from '../config';

export async function sendChatRequest(authFetch, payload) {
    if (payload.mode === 'contract' && !payload.contract) {
        return Promise.resolve({
            success: false,
            error: 'Contract mode requires contract content.',
            details: [{ field: 'contract', message: 'Contract is required for contract mode.' }],
        });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
        const response = await authFetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json().catch(() => ({}));
        const responseBody = responseData && typeof responseData === 'object' ? responseData : {};
        const retryAfter = response.status === 429
            ? parseInt(response.headers.get('Retry-After') || '0', 10) || undefined
            : undefined;

        if (!response.ok) {
            // Log rate limit events for client-side monitoring
            if (response.status === 429) {
                console.warn('Rate limit exceeded:', {
                    retryAfter,
                    endpoint: '/api/chat',
                    timestamp: new Date().toISOString(),
                });
            }

            return {
                success: false,
                error: responseBody.error || responseBody.message || 'Chat request failed.',
                details: responseBody.details,
                retryAfter,
            };
        }

        return {
            ...(responseBody),
            retryAfter,
        };
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timed out. Please try again.',
            };
        }

        return {
            success: false,
            error: error.message || 'Network error occurred.',
        };
    }
}

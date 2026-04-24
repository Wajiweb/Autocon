import React from 'react';

/**
 * ErrorBoundary
 *
 * Global React error boundary — catches unhandled component errors
 * and renders a clean fallback UI instead of a blank white screen.
 *
 * Wrap around the root App component in main.jsx:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // In production this should send to an error tracking service (e.g. Sentry)
        console.error('[ErrorBoundary] Caught unhandled error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const isDev = import.meta.env.DEV;

        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-base, #0a0a0f)', padding: '24px',
                fontFamily: 'Inter, sans-serif',
            }}>
                <div style={{
                    maxWidth: '520px', width: '100%', textAlign: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '20px', padding: '48px 36px',
                }}>
                    {/* Icon */}
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>

                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginBottom: '10px' }}>
                        Something went wrong
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '28px', lineHeight: 1.6 }}>
                        AutoCon encountered an unexpected error. Your wallet and contracts are safe.
                        You can try refreshing the page or click the button below to retry.
                    </p>

                    {/* Dev-only error details */}
                    {isDev && this.state.error && (
                        <details style={{
                            marginBottom: '24px', textAlign: 'left',
                            background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px',
                            fontSize: '0.72rem', color: '#fca5a5', fontFamily: 'monospace',
                            maxHeight: '160px', overflowY: 'auto',
                        }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '8px', color: '#f87171' }}>
                                Error Details (dev only)
                            </summary>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                padding: '12px 28px', borderRadius: '12px',
                                background: 'rgba(16,185,129,0.15)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                color: '#34d399', fontWeight: 700, fontSize: '0.9rem',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            🔄 Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 28px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8', fontWeight: 700, fontSize: '0.9rem',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            ↺ Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

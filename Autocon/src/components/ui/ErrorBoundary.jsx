import React from 'react';
import { AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/react';

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
        // Send to Sentry in production
        import.meta.env.PROD && Sentry.captureException(error, { extra: errorInfo });
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
            <div className="error-boundary-shell" style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg)', padding: '24px',
            }}>
                <div role="alert" aria-live="assertive" style={{
                    maxWidth: '520px', width: '100%', textAlign: 'center',
                    background: 'var(--surface)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 'var(--radius-xl)', padding: '48px 36px',
                }}>
                    {/* Icon */}
                    <div aria-hidden="true" style={{ marginBottom: '16px', color: '#f59e0b', display: 'flex', justifyContent: 'center' }}>
                      <AlertTriangle size={64} />
                    </div>

                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--error)', marginBottom: '10px' }}>
                        Something went wrong
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '28px', lineHeight: 1.6 }}>
                        AutoCon encountered an unexpected error. Your wallet and contracts are safe.
                        You can try refreshing the page or click the button below to retry.
                    </p>

                    {/* Dev-only error details */}
                    {isDev && this.state.error && (
                        <details
                            aria-label="Error details (development only)"
                            style={{
                                marginBottom: '24px', textAlign: 'left',
                                background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px',
                                fontSize: '0.72rem', color: 'var(--error)', fontFamily: 'monospace',
                                maxHeight: '160px', overflowY: 'auto',
                            }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                                Error Details (dev only)
                            </summary>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={this.handleRetry}
                            className="btn btn-ghost"
                            aria-label="Try rendering the application again"
                        >
                            🔄 Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="btn btn-secondary"
                            aria-label="Go to Dashboard"
                        >
                            🏠 Dashboard
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-secondary"
                            aria-label="Reload the page"
                        >
                            ↺ Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

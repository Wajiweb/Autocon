import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorCard({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl p-6 text-center"
         style={{
           border: '1px solid rgba(239,68,68,0.3)',
           background: 'rgba(239,68,68,0.08)'
         }}>
      <AlertTriangle className="h-8 w-8" style={{ color: '#f87171' }} />
      <p className="text-sm" style={{ color: '#fca5a5' }}>
        {message ?? 'An unexpected error occurred.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'var(--surface)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)' }}
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

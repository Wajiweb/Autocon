import { useGasTracker } from '../hooks/useGasTracker';

/**
 * GasWidget - Displays live network gas price.
 * Shifts colors based on congestion.
 */
export default function GasWidget() {
  const { gasPriceGwei, status, isLoading } = useGasTracker();

  // Determine dynamic styling based on 'cheap', 'average', or 'expensive'
  const getStatusStyles = () => {
    switch (status) {
      case 'cheap':
        return {
          color: 'var(--success)',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          glow: '0 0 10px rgba(16, 185, 129, 0.4)'
        };
      case 'expensive':
        return {
          color: 'var(--danger)',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          glow: '0 0 10px rgba(239, 68, 68, 0.4)'
        };
      case 'average':
      default:
        return {
          color: 'var(--warning)',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          glow: '0 0 10px rgba(245, 158, 11, 0.4)'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className="glass"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '50px',
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        boxShadow: styles.glow,
        fontSize: '0.72rem',
        fontWeight: 700,
        color: styles.color,
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.3s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      title={`Current gas price is ${status}`}
    >
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: styles.color,
          boxShadow: `0 0 8px ${styles.color}`,
          animation: 'pulse-glow 2s ease-in-out infinite'
        }}
      />
      ⛽ {isLoading || gasPriceGwei === null ? '---' : Math.round(gasPriceGwei)} Gwei
    </div>
  );
}

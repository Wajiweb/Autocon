/**
 * EmptyState — Reusable empty state component with icon, title, and description.
 * Used when there's no data to display (empty tables, no deployments, etc.)
 */
export default function EmptyState({ 
  icon = '📭', 
  title = 'Nothing here yet', 
  description = 'Get started by creating something new!',
  action = null,
  actionLabel = 'Get Started'
}) {
  return (
    <div className="animate-fade-in" style={{
      textAlign: 'center',
      padding: '60px 40px',
      borderRadius: '20px',
      background: 'var(--bg-card)',
      border: '1px dashed var(--border-color)'
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '24px',
        background: 'var(--accent-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '2.5rem',
        animation: 'float 3s ease-in-out infinite'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)',
        marginBottom: '8px'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.85rem', color: 'var(--text-muted)',
        maxWidth: '360px', margin: '0 auto', lineHeight: 1.5
      }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className="btn-primary"
          style={{ marginTop: '20px', padding: '12px 28px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

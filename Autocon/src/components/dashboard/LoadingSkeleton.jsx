function SkeletonPulse({ width = '100%', height = '16px', borderRadius = '8px', style = {} }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, var(--bg-input) 0%, var(--bg-card-hover) 40%, var(--bg-input) 80%)',
      backgroundSize: '300% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style
    }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <SkeletonPulse width="40%" height="14px" style={{ marginBottom: '14px' }} />
      <SkeletonPulse width="100%" height="42px" style={{ marginBottom: '12px' }} />
      <SkeletonPulse width="70%" height="12px" style={{ marginBottom: '8px' }} />
      <SkeletonPulse width="50%" height="12px" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr',
        gap: '14px', padding: '14px 20px',
        borderRadius: '12px', background: 'var(--bg-input)'
      }}>
        {[1,2,3,4,5].map((i, idx) => (
          <SkeletonPulse key={i} height="12px" width={['55%','70%','60%','80%','50%'][idx]} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr',
          gap: '14px', padding: '16px 20px',
          borderRadius: '10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          animation: `fadeIn 0.4s ease-out ${rowIdx * 0.1}s forwards`,
          opacity: 0
        }}>
          {[1,2,3,4,5].map((i, idx) => (
            <SkeletonPulse key={i} height="14px" width={['75%','55%','80%','45%','65%'][idx]} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="card" style={{ padding: '20px' }}>
            <SkeletonPulse width="60%" height="12px" style={{ marginBottom: '12px' }} />
            <SkeletonPulse width="40%" height="28px" style={{ marginBottom: '8px' }} />
            <SkeletonPulse width="80%" height="10px" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <SkeletonPulse width="35%" height="14px" style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SkeletonPulse width="140px" height="140px" borderRadius="50%" />
          </div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <SkeletonPulse width="35%" height="14px" style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
            {[60,40,80,50,70,90].map((h, i) => (
              <SkeletonPulse key={i} width="28px" height={`${h}%`} borderRadius="6px" />
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <SkeletonTable rows={3} />
    </div>
  );
}

export default SkeletonPulse;

import { useContractStore } from '../../store/useContractStore';

export default function DeveloperToggle() {
  const { isEditingEnabled, toggleEditing, generatedCode } = useContractStore();

  if (!generatedCode) return null;

  return (
    <label
      title="Toggle code editing"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--surface)',
        padding: '5px 9px',
        borderRadius: '999px',
        border: '1px solid var(--border-dark)',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dark-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Dev
      </span>
      <span style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px' }}>
        <input
          type="checkbox"
          checked={isEditingEnabled}
          onChange={(e) => toggleEditing(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isEditingEnabled ? 'var(--primary)' : 'var(--card-active)',
            transition: 'var(--transition-fast)',
            borderRadius: '999px',
            border: '1px solid var(--border-dark)',
            boxShadow: isEditingEnabled ? '0 0 12px var(--primary-glow)' : 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              height: '12px',
              width: '12px',
              left: '2px',
              bottom: '2px',
              backgroundColor: '#ECFDF5',
              transition: 'var(--transition-fast)',
              borderRadius: '50%',
              transform: isEditingEnabled ? 'translateX(16px)' : 'translateX(0)',
            }}
          />
        </span>
      </span>
    </label>
  );
}

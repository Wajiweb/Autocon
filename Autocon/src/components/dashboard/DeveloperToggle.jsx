import { useContractStore } from '../../store/useContractStore';

export default function DeveloperToggle() {
    const { isEditingEnabled, toggleEditing, generatedCode } = useContractStore();

    if (!generatedCode) return null; // Don't show if no code generated

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-input)', padding: '6px 12px', borderRadius: '50px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>👨‍💻 Developer Mode</span>
            <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                <input 
                    type="checkbox" 
                    checked={isEditingEnabled} 
                    onChange={(e) => toggleEditing(e.target.checked)} 
                    style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isEditingEnabled ? 'var(--primary)' : 'var(--bg)',
                    transition: '.4s', borderRadius: '20px', border: '1px solid var(--border-color)'
                }}>
                    <span style={{
                        position: 'absolute', content: '""', height: '14px', width: '14px', left: '2px', bottom: '2px',
                        backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                        transform: isEditingEnabled ? 'translateX(16px)' : 'translateX(0)'
                    }}></span>
                </span>
            </label>
        </div>
    );
}

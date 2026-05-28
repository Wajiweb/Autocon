import React from 'react';
import { CONTRACT_TYPES } from '../../constants/contract';

export function StepType({ selected, onSelect }) {
  return (
    <div className="wz-card">
      <div className="wz-card-title">What would you like to create?</div>
      <div className="wz-card-sub">Choose a contract type. Your progress auto-saves so you can return anytime.</div>
      <div className="wz-type-grid">
        {CONTRACT_TYPES.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.id} className={`wz-type-card${selected === t.id ? ' selected' : ''}`} onClick={() => onSelect(t.id)}>
              <span className="wz-type-icon"><Icon size={32} strokeWidth={1.5} /></span>
              <div className="wz-type-name">{t.name}</div>
              <div className="wz-type-desc">{t.desc}</div>
              <span className="wz-type-tag">{t.tag}</span>
            </div>
          );
        })}
      </div>
      {!selected && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Select a contract type to begin
        </div>
      )}
    </div>
  );
}
export default StepType;

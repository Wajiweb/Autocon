import React from 'react';
import { Check } from 'lucide-react';
import { STEPS } from '../../constants/contract';

export function Stepper({ current }) {
  return (
    <div className="wz-stepper">
      {STEPS.map((label, i) => {
        const s = i < current ? 'done' : i === current ? 'active' : '';
        return (
          <div key={label} className="wz-step" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div className="wz-step-inner">
              <div className={`wz-step-circle ${s}`}>{i < current ? <Check size={14} strokeWidth={3} /> : i + 1}</div>
              <div className={`wz-step-label ${s}`}>{label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="wz-connector">
                <div className="wz-connector-fill" style={{ width: i < current ? '100%' : '0%' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default Stepper;

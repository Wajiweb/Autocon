/**
 * Container.jsx
 * Global layout constraint for landing page sections.
 * Max-width 1350px, responsive horizontal padding.
 */
import React from 'react';

export default function Container({ children, className = '' }) {
  return (
    <div
      className={className}
      style={{
        maxWidth:     '1350px',
        margin:       '0 auto',
        width:        '100%',
        paddingLeft:  'clamp(16px, 4vw, 60px)',
        paddingRight: 'clamp(16px, 4vw, 60px)',
      }}
    >
      {children}
    </div>
  );
}

import React from 'react';

export default function AnimatedPage({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

import React from 'react';

/**
 * Skeleton - Universal loading placeholder.
 * Accepts className for sizing (e.g. "w-full h-8 rounded-md")
 */
export default function Skeleton({ className = '' }) {
    return (
        <div
            className={`animate-pulse bg-[var(--surface-elevated)] border border-white/10 rounded-lg ${className}`}
            aria-hidden="true"
        />
    );
}

/** Pre-built skeleton for a stat card */
export function StatCardSkeleton() {
    return (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-14 mt-2" />
            <Skeleton className="h-3 w-36 mt-1" />
        </div>
    );
}

/** Pre-built skeleton for a table row */
export function TableRowSkeleton() {
    return (
        <tr>
            {[1, 2, 3, 4, 5].map((i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className={`h-4 ${i === 1 ? 'w-28' : i === 3 ? 'w-36' : 'w-16'}`} />
                </td>
            ))}
        </tr>
    );
}

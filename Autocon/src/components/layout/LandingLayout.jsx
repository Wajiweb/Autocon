/**
 * LandingLayout.jsx
 * Master wrapper for the entire landing page.
 *
 * Responsibilities:
 * 1. Applies `.landing-theme` CSS variable scope (dark tokens, isolated from dashboard)
 * 2. Provides QueryClientProvider scoped to the landing page only
 *    → Does NOT pollute the main app's data layer
 * 3. Sets base typography, scroll, and overflow rules
 */
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';

export default function LandingLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="landing-theme"
        style={{
          background:          'var(--lp-bg)',
          color:               'var(--lp-text-primary)',
          minHeight:           '100vh',
          overflowX:           'hidden',
          scrollBehavior:      'smooth',
          fontFamily:          '"Inter", system-ui, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </div>
    </QueryClientProvider>
  );
}

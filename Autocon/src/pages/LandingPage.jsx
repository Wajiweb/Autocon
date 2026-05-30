/**
 * LandingPage.jsx — Production Landing Page (V3 — ScrollGlobe)
 *
 * Architecture note:
 * LandingLayout owns the QueryClientProvider.
 * useLandingQuery() MUST be called inside a child of LandingLayout.
 * Solution: outer shell <LandingPage> renders LandingLayout,
 * inner <LandingPageContent> consumes React Query hooks.
 *
 * V3 Changes:
 * - Replaced static Hero + Logos with scroll-driven ScrollGlobe
 * - ScrollGlobe provides 4 viewport-height sections with animated globe
 * - All below-the-fold sections remain unchanged
 */
import React, { lazy, Suspense } from 'react';

// Layout — always eagerly loaded
import LandingLayout from '../components/layout/LandingLayout';
import Navbar        from '../components/layout/Navbar';
import Footer        from '../components/layout/Footer';

// ScrollGlobe — eagerly loaded (above the fold, replaces Hero + Logos)
import ScrollGlobe from '../components/sections/ScrollGlobe';

// Heavy sections — lazy-loaded (below the fold, code-split)
const Features       = lazy(() => import('../components/sections/Features'));
const ChainSection   = lazy(() => import('../components/sections/ChainSection'));
const TradingSection = lazy(() => import('../components/sections/TradingSection'));

const FAQ            = lazy(() => import('../components/sections/FAQ'));
const CTA            = lazy(() => import('../components/sections/CTA'));

// React Query — called INSIDE the QueryClientProvider tree
import { useLandingQuery } from '../hooks/useLandingQuery';

// Invisible Suspense fallback — initialData prevents any loading flash
const SectionFallback = () => null;

// ── Inner component — lives inside QueryClientProvider ────────────────────
function LandingPageContent({ onLoginClick }) {
  // Safe to call here: LandingLayout (parent) has already mounted QueryClientProvider
  const { features } = useLandingQuery();

  return (
    <>
      <Navbar onConnect={onLoginClick} />
      <ScrollGlobe onGetStarted={onLoginClick} />

      <Suspense fallback={<SectionFallback />}>
        <Features       features={features}              />
        <ChainSection                                    />
        <TradingSection onGetStarted={onLoginClick}      />

        <FAQ                                             />
        <CTA            onGetStarted={onLoginClick}      />
      </Suspense>

      <Footer />
    </>
  );
}

// ── Outer shell — provides QueryClientProvider via LandingLayout ──────────
export default function LandingPage({ onLoginClick }) {
  return (
    <LandingLayout>
      <LandingPageContent onLoginClick={onLoginClick} />
    </LandingLayout>
  );
}

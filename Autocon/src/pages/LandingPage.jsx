/**
 * LandingPage.jsx — Production Landing Page (V2)
 *
 * Architecture note:
 * LandingLayout owns the QueryClientProvider.
 * useLandingQuery() MUST be called inside a child of LandingLayout.
 * Solution: outer shell <LandingPage> renders LandingLayout,
 * inner <LandingPageContent> consumes React Query hooks.
 */
import React, { lazy, Suspense } from 'react';

// Layout — always eagerly loaded
import LandingLayout from '../components/layout/LandingLayout';
import Navbar        from '../components/layout/Navbar';
import Footer        from '../components/layout/Footer';

// Hero + Logos — eagerly loaded (above the fold)
import Hero  from '../components/sections/Hero';
import Logos from '../components/sections/Logos';

// Heavy sections — lazy-loaded (below the fold, code-split)
const Features       = lazy(() => import('../components/sections/Features'));
const ChainSection   = lazy(() => import('../components/sections/ChainSection'));
const TradingSection = lazy(() => import('../components/sections/TradingSection'));
const Testimonials   = lazy(() => import('../components/sections/Testimonials'));
const FAQ            = lazy(() => import('../components/sections/FAQ'));
const CTA            = lazy(() => import('../components/sections/CTA'));

// React Query — called INSIDE the QueryClientProvider tree
import { useLandingQuery } from '../hooks/useLandingQuery';

// Invisible Suspense fallback — initialData prevents any loading flash
const SectionFallback = () => null;

// ── Inner component — lives inside QueryClientProvider ────────────────────
function LandingPageContent({ onLoginClick }) {
  // Safe to call here: LandingLayout (parent) has already mounted QueryClientProvider
  const { features, testimonials } = useLandingQuery();

  return (
    <>
      <Navbar onConnect={onLoginClick} />
      <Hero onGetStarted={onLoginClick} />
      <Logos />

      <Suspense fallback={<SectionFallback />}>
        <Features       features={features}              />
        <ChainSection                                    />
        <TradingSection onGetStarted={onLoginClick}      />
        <Testimonials   testimonials={testimonials}       />
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

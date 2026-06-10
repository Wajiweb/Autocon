/**
 * LandingPage.jsx — Production Landing Page Component
 *
 * Exposes the main interactive layout and code-split sections for the public landing view.
 * Keeps structural section layout neatly nested within the components directory.
 */
import React, { lazy, Suspense } from 'react';

// Layout components
import LandingLayout from '../layout/LandingLayout';
import Navbar        from '../layout/Navbar';
import Footer        from '../layout/Footer';

// ScrollGlobe component (above the fold)
import ScrollGlobe   from './ScrollGlobe';

// Heavy sections below the fold (lazy-loaded & code-split)
const Features       = lazy(() => import('./Features'));
const ChainSection   = lazy(() => import('./ChainSection'));
const TradingSection = lazy(() => import('./TradingSection'));
const Testimonials   = lazy(() => import('./Testimonials'));
const FAQ            = lazy(() => import('./FAQ'));
const CTA            = lazy(() => import('./CTA'));

// Custom React Query hook
import { useLandingQuery } from '../../hooks/useLandingQuery';

// Invisible Suspense fallback
const SectionFallback = () => null;

/**
 * LandingPageContent — Renders individual layout and section components.
 * Invoked inside LandingLayout to consume React Query hooks safely.
 */
function LandingPageContent({ onLoginClick }) {
  const { features, testimonials } = useLandingQuery();

  return (
    <>
      {/* Dynamic public header navigation */}
      <Navbar onConnect={onLoginClick} />
      
      {/* Viewport-height scroll-driven interactive globe */}
      <ScrollGlobe onGetStarted={onLoginClick} />

      {/* Code-split lazy loaded sections */}
      <Suspense fallback={<SectionFallback />}>
        <Features features={features} />
        <ChainSection />
        <TradingSection onGetStarted={onLoginClick} />
        <Testimonials testimonials={testimonials} />
        <FAQ />
        <CTA onGetStarted={onLoginClick} />
      </Suspense>

      {/* Public footer */}
      <Footer />
    </>
  );
}

/**
 * LandingPage — Coordinates outer layout context provider wrapper.
 */
export default function LandingPage({ onLoginClick }) {
  return (
    <LandingLayout>
      <LandingPageContent onLoginClick={onLoginClick} />
    </LandingLayout>
  );
}

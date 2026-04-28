/**
 * Section.jsx
 * Standardized section wrapper for all landing page sections.
 * Provides consistent vertical padding and auto-wraps in Container.
 *
 * Usage:
 *   <Section id="features" aria-label="Features">
 *     <h2>...</h2>
 *   </Section>
 *
 * Or without Container (for full-bleed sections like Logos, Testimonials):
 *   <Section id="logos" contained={false}>
 *     ...marquee content...
 *   </Section>
 */
import React from 'react';
import Container from '../layout/Container';

export default function Section({
  children,
  id,
  contained   = true,
  className   = '',
  style       = {},
  'aria-label': ariaLabel,
  ...rest
}) {
  return (
    <section
      id={id}
      className={`landing-section ${className}`}
      aria-label={ariaLabel}
      style={style}
      {...rest}
    >
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}

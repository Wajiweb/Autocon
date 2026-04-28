/**
 * Features.jsx — "Why Choose AutoCon" 4-card grid
 * Desktop: 4 columns with vertical offsets (0, 72, 120, 120px)
 * Tablet: 2×2 grid, no offsets
 * Mobile: single column
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, ShieldCheck, Globe, LayoutTemplate } from 'lucide-react';
import Container from '../layout/Container';
import LandingCard from '../ui/LandingCard';
import { fadeUp, staggerContainer, viewportConfig } from '../../lib/motionVariants';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const ICON_MAP = { Wand2, ShieldCheck, Globe, LayoutTemplate };

const OFFSETS = [0, 72, 120, 120]; // px, desktop only

export default function Features({ features = [] }) {
  const { ref, controls } = useScrollAnimation();

  return (
    <section
      id="features"
      className="landing-section"
      aria-label="Features section"
    >
      <Container>
        {/* Section header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px, 7vw, 80px)' }}
        >
          <motion.span
            variants={fadeUp}
            style={{
              display:      'inline-block',
              fontSize:     '0.72rem',
              fontWeight:   700,
              textTransform:'uppercase',
              letterSpacing:'0.1em',
              color:        'var(--lp-accent)',
              marginBottom: '12px',
            }}
          >
            Why Choose AutoCon
          </motion.span>
          <motion.h2
            variants={fadeUp}
            style={{
              fontSize:   'clamp(1.75rem, 3.5vw, 3rem)',
              fontWeight: 900,
              color:      'var(--lp-text-primary)',
              marginBottom:'16px',
            }}
          >
            Everything You Need to
            <br />
            <span style={{ color: 'var(--lp-accent)' }}>Ship on Web3</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}
          >
            From generation to deployment — AutoCon handles the full smart contract lifecycle.
          </motion.p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap:                 'clamp(16px, 2vw, 24px)',
            alignItems:         'start',
          }}
        >
          {features.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] || Wand2;
            return (
              <motion.div
                key={feature.id}
                variants={fadeUp}
                style={{ marginTop: `clamp(0px, ${OFFSETS[index] * 0.5}px, ${OFFSETS[index]}px)` }}
                className="features-offset-card"
              >
                <LandingCard role="article" aria-label={feature.title} elevated>
                  {/* Icon */}
                  <div style={{
                    width:        '52px',
                    height:       '52px',
                    borderRadius: '14px',
                    background:   'var(--lp-accent-soft)',
                    border:       '1px solid hsla(14,100%,50%,0.2)',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent:'center',
                    marginBottom: '20px',
                  }}>
                    <Icon size={24} color="var(--lp-accent)" strokeWidth={1.8} />
                  </div>

                  {/* Content */}
                  <h3 style={{
                    fontSize:     '1.1rem',
                    fontWeight:   800,
                    color:        'var(--lp-text-primary)',
                    marginBottom: '10px',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize:   '0.9rem',
                    color:      'var(--lp-text-secondary)',
                    lineHeight: 1.65,
                  }}>
                    {feature.description}
                  </p>

                  {/* Bottom accent line */}
                  <div style={{
                    position:   'absolute',
                    bottom:     0,
                    left:       0,
                    right:      0,
                    height:     '2px',
                    background: 'linear-gradient(90deg, var(--lp-accent), transparent)',
                    opacity:    0,
                    transition: 'opacity 0.3s',
                  }} className="card-accent-line" />
                </LandingCard>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>

      {/* Responsive: disable vertical offsets on small screens */}
      <style>{`
        @media (max-width: 1023px) {
          .features-offset-card { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  );
}

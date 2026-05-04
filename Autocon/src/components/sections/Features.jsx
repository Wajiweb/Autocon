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
import SectionGlow from '../landingpage/SectionGlow';

const ICON_MAP = { Wand2, ShieldCheck, Globe, LayoutTemplate };

const OFFSETS = [0, 48, 96, 144];

const CARD_VARIATIONS = [
  { glowIntensity: 'high', iconColor: 'hsl(25 100% 60%)', borderColor: 'hsla(25,100%,50%,0.28)', shadowColor: 'hsla(25,100%,50%,0.18)', accentColor: '25', accentLine: 'hsla(25,100%,50%,0.45)' },
  { glowIntensity: 'high', iconColor: 'hsl(190 100% 55%)', borderColor: 'hsla(190,100%,50%,0.25)', shadowColor: 'hsla(190,100%,50%,0.15)', accentColor: '190', accentLine: 'hsla(190,100%,50%,0.4)' },
  { glowIntensity: 'high', iconColor: 'hsl(270 100% 65%)', borderColor: 'hsla(270,100%,60%,0.25)', shadowColor: 'hsla(270,100%,60%,0.15)', accentColor: '270', accentLine: 'hsla(270,100%,60%,0.4)' },
  { glowIntensity: 'high', iconColor: 'hsl(150 100% 55%)', borderColor: 'hsla(150,100%,50%,0.22)', shadowColor: 'hsla(150,100%,50%,0.12)', accentColor: '150', accentLine: 'hsla(150,100%,50%,0.35)' },
];

export default function Features({ features = [] }) {
  const { ref, controls } = useScrollAnimation();

  return (
    <section
      id="features"
      className="landing-section"
      aria-label="Features section"
      style={{ position: 'relative', paddingTop: 'clamp(48px, 8vw, 80px)', paddingBottom: 'clamp(32px, 6vw, 60px)' }}
    >
      <SectionGlow position="both" intensity="medium" size="md" variations={{ leftTop: '20%', rightTop: '60%' }} />
      <Container>
        {/* Section header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}
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
            gap:                 'clamp(24px, 4vw, 48px)',
            alignItems:         'start',
          }}
>
          {features.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] || Wand2;
            const variation = CARD_VARIATIONS[index] || CARD_VARIATIONS[0];
            return (
              <motion.div
                key={feature.id}
                variants={fadeUp}
                style={{ marginTop: `${OFFSETS[index]}px` }}
              >
                <LandingCard role="article" aria-label={feature.title} elevated glowIntensity={variation.glowIntensity} accentColor={variation.accentColor}>
                  {/* Icon */}
                  <div style={{
                    width:            '56px',
                    height:           '56px',
                    borderRadius:     '16px',
                    background:       'linear-gradient(145deg, hsl(0,0%,10%) 0%, hsl(0,0%,6%) 100%)',
                    border:           `1px solid ${variation.borderColor}`,
                    display:          'flex',
                    alignItems:      'center',
                    justifyContent:   'center',
                    marginBottom:    '24px',
                    boxShadow:        `0 4px 16px rgba(0,0,0,0.4), 0 0 24px ${variation.shadowColor}, inset 0 1px 0 hsla(0,0%,100%,0.05)`,
                    position:         'relative',
                    overflow:         'hidden',
                  }}>
                    {/* Icon glow ring */}
                    <div style={{
                      position:    'absolute',
                      inset:      '-3px',
                      borderRadius: '18px',
                      background:  `radial-gradient(circle at 50% 50%, ${variation.borderColor} 0%, transparent 70%)`,
                      filter:     'blur(10px)',
                      opacity:    0.8,
                    }} />
                    <Icon size={26} color={variation.iconColor} strokeWidth={1.7} style={{ position: 'relative', zIndex: 1 }} />
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
                    left:       '10%',
                    right:      '10%',
                    height:     '2px',
                    background: `linear-gradient(90deg, transparent, ${variation.accentLine} 50%, transparent)`,
                    opacity:    0.4,
                    transition: 'opacity 0.3s ease',
                  }} className="card-bottom-accent" />
                </LandingCard>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}

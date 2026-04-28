/**
 * CTA.jsx — Full-width call-to-action section
 * Dark gradient overlay, centered content, button hover scale
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Container from '../layout/Container';
import Button from '../ui/Button';
import { fadeUp, staggerContainer, floatYSlow, viewportConfig } from '../../lib/motionVariants';

export default function CTA({ onGetStarted }) {
  return (
    <section
      id="cta"
      aria-label="Call to action"
      style={{
        position:     'relative',
        overflow:     'hidden',
        padding:      'clamp(80px, 12vw, 160px) 0',
        background:   'var(--lp-surface)',
        borderTop:    '1px solid var(--lp-border-subtle)',
        borderBottom: '1px solid var(--lp-border-subtle)',
      }}
    >
      {/* Background glow mesh */}
      <motion.div
        variants={floatYSlow}
        animate="animate"
        aria-hidden="true"
        style={{
          position:     'absolute',
          inset:        '-30%',
          background:   'radial-gradient(ellipse 80% 60% at 50% 50%, hsla(14,100%,50%,0.12) 0%, transparent 65%)',
          pointerEvents:'none',
          willChange:   'transform',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          backgroundImage: `
            linear-gradient(var(--lp-border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--lp-border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity:        0.3,
          pointerEvents:  'none',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
        style={{
          position:     'absolute',
          width:        '300px',
          height:       '300px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, hsla(14,100%,50%,0.2) 0%, transparent 70%)',
          top:          '-80px',
          left:         '10%',
          pointerEvents:'none',
          willChange:   'transform',
        }}
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        aria-hidden="true"
        style={{
          position:     'absolute',
          width:        '250px',
          height:       '250px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, hsla(260,80%,65%,0.15) 0%, transparent 70%)',
          bottom:       '-60px',
          right:        '10%',
          pointerEvents:'none',
          willChange:   'transform',
        }}
      />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
        >
          {/* Badge */}
          <motion.span
            variants={fadeUp}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '8px',
              padding:      '6px 18px',
              borderRadius: '99px',
              background:   'var(--lp-accent-soft)',
              border:       '1px solid hsla(14,100%,50%,0.3)',
              fontSize:     '0.75rem',
              fontWeight:   700,
              color:        'var(--lp-accent)',
              textTransform:'uppercase',
              letterSpacing:'0.07em',
            }}
          >
            <Zap size={12} strokeWidth={2.5} />
            Ready to Build?
          </motion.span>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            style={{
              fontSize:    'clamp(2rem, 5vw, 4rem)',
              fontWeight:  900,
              lineHeight:  1.1,
              letterSpacing: '-0.04em',
              color:       'var(--lp-text-primary)',
              maxWidth:    '680px',
            }}
          >
            Deploy Your First
            <br />
            <span style={{
              background:        'linear-gradient(135deg, var(--lp-accent) 0%, hsl(30,100%,60%) 100%)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:    'text',
            }}>
              Smart Contract Today
            </span>
          </motion.h2>

          {/* Sub-text */}
          <motion.p
            variants={fadeUp}
            style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', maxWidth: '480px', lineHeight: 1.7 }}
          >
            No setup. No code. No waiting. Just configure, audit, and deploy to any EVM testnet in minutes.
          </motion.p>

          {/* CTA button */}
          <motion.div variants={fadeUp}>
            <Button
              variant="primary"
              onClick={onGetStarted}
              aria-label="Get started with AutoCon for free"
              style={{
                fontSize:   '1rem',
                padding:    '16px 36px',
                boxShadow:  '0 0 50px hsla(14,100%,50%,0.35)',
                borderRadius:'14px',
              }}
            >
              Get Started Free
              <ArrowRight size={18} strokeWidth={2.5} />
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeUp}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}
          >
            {['No credit card required', 'Free testnet deployment', 'AI audit included'].map((text) => (
              <span key={text} style={{ fontSize: '0.82rem', color: 'var(--lp-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span> {text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

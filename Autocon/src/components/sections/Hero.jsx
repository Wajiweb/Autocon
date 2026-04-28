/**
 * Hero.jsx — Two-column hero with floating visual, bubbles, and parallax
 * Desktop: 84px h1 | Tablet: 56px | Mobile: 32px
 * Lazy-loaded HeroVisual for performance
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, Zap, Shield, Globe } from 'lucide-react';
import Container from '../layout/Container';
import Button from '../ui/Button';
import { fadeUp, fadeIn, staggerContainer, rotateFloat, viewportConfig, conditionalMotion } from '../../lib/motionVariants';

// ── Floating Dashboard Visual (lazy-loaded) ───────────────────────────────
function HeroVisual() {
  const stats = [
    { label: 'Contracts',  value: '10K+',  color: 'var(--lp-accent)'  },
    { label: 'Chains',     value: '5',     color: '#a78bfa'             },
    { label: 'Uptime',     value: '99.9%', color: '#34d399'             },
  ];

  const rows = [
    { name: 'MyToken',       sym: 'MTK', type: 'ERC-20',  net: 'Sepolia', dot: '#34d399' },
    { name: 'ArtCollection', sym: 'ART', type: 'ERC-721', net: 'Polygon', dot: '#a78bfa' },
    { name: 'BidAuction',    sym: 'AUC', type: 'Auction', net: 'BNB',     dot: 'var(--lp-accent)' },
  ];

  return (
    <motion.div
      {...conditionalMotion(rotateFloat)}
      style={{
        width:        '100%',
        maxWidth:     '520px',
        background:   'var(--lp-surface)',
        border:       '1px solid var(--lp-border-subtle)',
        borderRadius: '24px',
        overflow:     'hidden',
        willChange:   'transform',
        boxShadow:    '0 32px 80px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--lp-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#ff5f57', '#ffbd2e', '#28ca41'].map(c => (
              <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-muted)' }}>AutoCon Dashboard</span>
        </div>
        <span style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 99, background: 'var(--lp-accent-soft)', color: 'var(--lp-accent)', fontWeight: 700 }}>
          ● Live
        </span>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--lp-border-subtle)' }}>
        {stats.map(({ label, value, color }) => (
          <div key={label} style={{ padding: '14px 18px', borderRight: '1px solid var(--lp-border-subtle)' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lp-text-muted)', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ padding: '10px 0' }}>
        {rows.map(({ name, sym, type, net, dot }) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: '11px 22px', alignItems: 'center', borderBottom: '1px solid var(--lp-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--lp-surface-elevated)', border: '1px solid var(--lp-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.52rem', fontWeight: 800, color: dot, flexShrink: 0 }}>
                {sym}
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>{name}</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--lp-text-muted)' }}>{net}</p>
              </div>
            </div>
            <span style={{ fontSize: '0.62rem', padding: '3px 9px', borderRadius: 20, background: 'var(--lp-surface-elevated)', color: 'var(--lp-text-muted)', border: '1px solid var(--lp-border-subtle)', whiteSpace: 'nowrap' }}>{type}</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 22px', background: 'var(--lp-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={13} color="#34d399" />
          <span style={{ fontSize: '0.68rem', color: 'var(--lp-text-muted)', fontWeight: 600 }}>AI Audit Passed</span>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--lp-text-muted)', fontFamily: 'monospace' }}>0x7a2...f3e1</span>
      </div>
    </motion.div>
  );
}

// ── Floating Bubble Element ───────────────────────────────────────────────
function Bubble({ size, top, left, right, delay, color = 'var(--lp-accent-soft)' }) {
  const floatProps = conditionalMotion({
    animate:    { y: [0, -18, 0], opacity: [0.5, 0.8, 0.5] },
    transition: { duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay },
  });
  return (
    <motion.div
      {...floatProps}
      style={{
        position:     'absolute',
        width:        size,
        height:       size,
        borderRadius: '50%',
        background:   color,
        border:       '1px solid var(--lp-border-subtle)',
        top, left, right,
        pointerEvents: 'none',
        willChange:   'transform',
      }}
      aria-hidden="true"
    />
  );
}

// ── Feature Badge ─────────────────────────────────────────────────────────
function FeatureBadge({ icon: Icon, label, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '8px',
        padding:      '8px 16px',
        borderRadius: '99px',
        background:   'var(--lp-surface)',
        border:       '1px solid var(--lp-border-subtle)',
        fontSize:     '0.78rem',
        fontWeight:   600,
        color:        'var(--lp-text-secondary)',
        whiteSpace:   'nowrap',
      }}
    >
      <Icon size={14} color="var(--lp-accent)" />
      {label}
    </motion.div>
  );
}

export default function Hero({ onGetStarted }) {
  return (
    <section
      id="hero"
      aria-label="Hero section"
      style={{
        position:  'relative',
        minHeight: '100vh',
        display:   'flex',
        alignItems:'center',
        paddingTop:'100px',
        paddingBottom:'80px',
        overflow:  'hidden',
      }}
    >
      {/* Background glow blobs — suppressed on reduced-motion / mobile */}
      <motion.div
        {...conditionalMotion({
          animate:    { scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] },
          transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
        })}
        aria-hidden="true"
        style={{
          position:     'absolute',
          width:        '600px',
          height:       '600px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, hsla(14,100%,50%,0.12) 0%, transparent 70%)',
          top:          '-200px',
          right:        '-100px',
          pointerEvents:'none',
          opacity:       0.4,
          willChange:   'transform',
        }}
      />
      <motion.div
        {...conditionalMotion({
          animate:    { scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] },
          transition: { duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 },
        })}
        aria-hidden="true"
        style={{
          position:     'absolute',
          width:        '500px',
          height:       '500px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, hsla(260,80%,65%,0.1) 0%, transparent 70%)',
          bottom:       '-100px',
          left:         '-150px',
          pointerEvents:'none',
          opacity:       0.3,
          willChange:   'transform',
        }}
      />

      {/* Floating bubbles */}
      <Bubble size="60px"  top="20%"  left="5%"   delay={0}   />
      <Bubble size="40px"  top="60%"  left="8%"   delay={1.5} color="hsla(260,80%,65%,0.1)" />
      <Bubble size="80px"  top="15%"  right="10%" delay={2}   color="hsla(14,100%,50%,0.07)" />
      <Bubble size="30px"  top="70%"  right="5%"  delay={0.8} />

      <Container>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap:                 'clamp(48px, 8vw, 96px)',
          alignItems:          'center',
        }}>
          {/* ── Left Column ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
          >
            {/* Eyebrow badge */}
            <motion.div variants={fadeUp}>
              <span style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '8px',
                padding:      '6px 16px',
                borderRadius: '99px',
                background:   'var(--lp-accent-soft)',
                border:       '1px solid hsla(14,100%,50%,0.25)',
                fontSize:     '0.75rem',
                fontWeight:   700,
                color:        'var(--lp-accent)',
                letterSpacing:'0.06em',
                textTransform:'uppercase',
              }}>
                <Zap size={12} strokeWidth={2.5} />
                Web3 Smart Contract Generator
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontSize:    'clamp(2rem, 5.5vw, 5.25rem)',
                fontWeight:  900,
                lineHeight:  1.08,
                letterSpacing: '-0.04em',
                color:       'var(--lp-text-primary)',
              }}
            >
              Deploy Smart
              <br />
              Contracts{' '}
              <span style={{
                background:       'linear-gradient(135deg, var(--lp-accent) 0%, hsl(30,100%,60%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip:   'text',
              }}>
                Without Code
              </span>
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize:   'clamp(0.95rem, 1.5vw, 1.15rem)',
                lineHeight: 1.7,
                color:      'var(--lp-text-secondary)',
                maxWidth:   '520px',
              }}
            >
              Generate, AI-audit, and deploy ERC-20 tokens, NFT collections, and auctions
              on Sepolia, Polygon, and BNB in minutes — no Solidity experience required.
            </motion.p>

            {/* Feature badges row */}
            <motion.div variants={staggerContainer} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <FeatureBadge icon={Zap}    label="No-Code Deploy"   />
              <FeatureBadge icon={Shield} label="AI Security Audit" />
              <FeatureBadge icon={Globe}  label="Multi-Chain"       />
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Button
                variant="primary"
                onClick={onGetStarted}
                aria-label="Get started with AutoCon for free"
                style={{ fontSize: '0.95rem', padding: '14px 30px', boxShadow: 'var(--lp-accent-glow)' }}
              >
                Get Started Free
                <ChevronRight size={18} strokeWidth={2.5} />
              </Button>
              <Button
                variant="secondary"
                href="#features"
                aria-label="Explore AutoCon features"
                style={{ fontSize: '0.95rem', padding: '14px 30px' }}
              >
                <Play size={15} strokeWidth={2} />
                Explore Features
              </Button>
            </motion.div>

            {/* Social proof strip */}
            <motion.div variants={fadeIn} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
              <div style={{ display: 'flex' }}>
                {['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'].map((c, i) => (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid var(--lp-bg)', marginLeft: i ? '-8px' : 0, flexShrink: 0 }} />
                ))}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--lp-text-muted)', fontWeight: 500 }}>
                Trusted by <strong style={{ color: 'var(--lp-text-secondary)' }}>2,500+</strong> developers
              </span>
            </motion.div>
          </motion.div>

          {/* ── Right Column — Floating Visual ── */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

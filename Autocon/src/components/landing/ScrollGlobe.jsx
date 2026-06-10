/**
 * ScrollGlobe.jsx — Scroll-driven multi-section hero with animated globe
 *
 * KEY ARCHITECTURE: All scroll-driven updates bypass React state entirely.
 * Globe position, progress bar, and nav visibility are set via direct DOM
 * mutation through refs, preventing React re-renders on every scroll frame.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Globe as GlobeIcon, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import Globe from '../ui/Globe';
import Container from '../layout/Container';
import Button from '../ui/Button';
import { fadeUp, staggerContainer } from '../../lib/motionVariants';

// ── Section data tailored for AutoCon ─────────────────────────────────────
const SECTIONS = [
  {
    id: 'hero',
    badge: 'Web3 Smart Contract Generator',
    badgeIcon: Zap,
    title: 'Deploy Smart Contracts',
    titleAccent: 'Without Writing Code',
    description:
      'Generate production-ready Solidity contracts. No Solidity knowledge required. Deploy to multiple chains in minutes.',
    align: 'left',
    features: [
      { title: 'No-Code UI', description: 'Configure contracts visually — just pick parameters and deploy.' },
      { title: 'Instant Generation', description: 'Production-ready Solidity in seconds, not days.' },
    ],
    actions: [
      { label: 'Start Building Free', variant: 'primary' },
      { label: 'See How It Works', variant: 'ghost' },
    ],

  },
  {
    id: 'ai-audit',
    badge: 'AI Security',
    badgeIcon: ShieldCheck,
    title: 'AI-Powered',
    titleAccent: 'Security Audit',
    description:
      'Every contract is automatically scanned by our Gemini-powered AI engine before deployment. Catch vulnerabilities before they cost you.',
    align: 'right',
    features: [
      { title: 'Reentrancy Detection', description: 'Catches reentrancy, integer overflow, and access control flaws.' },
      { title: 'Instant Reports', description: 'Detailed audit reports with severity levels and fix suggestions.' },
      { title: 'Zero False Positives', description: 'Fine-tuned AI trained on thousands of real-world exploits.' },
    ],
  },
  {
    id: 'multi-chain',
    badge: 'Multi-Chain',
    badgeIcon: GlobeIcon,
    title: 'One Platform,',
    titleAccent: 'Every Chain',
    description:
      'Deploy on Sepolia, BNB Testnet, and more from a single unified interface. No config files, no CLI — just click and deploy.',
    align: 'left',
    features: [
      { title: 'Sepolia & BNB Testnet', description: 'First-class support for the most popular EVM testnets.' },
      { title: 'Gas Optimization', description: 'Automatically optimized contracts reduce deployment costs.' },
    ],
  },
  {
    id: 'cta-globe',
    badge: 'Get Started',
    badgeIcon: Rocket,
    title: 'Build Your First',
    titleAccent: 'Smart Contract Today',
    description:
      'No setup. No code. No waiting. Configure, audit, and deploy to any EVM testnet in minutes.',
    align: 'center',
    actions: [{ label: 'Get Started Free', variant: 'primary' }],
    trustItems: ['No credit card required', 'Free testnet deployment', 'AI audit included'],
  },
];

// ── Globe positions per section ───────────────────────────────────────────
const GLOBE_POSITIONS = [
  { top: 50, left: 74, scale: 0.95 },
  { top: 46, left: 22, scale: 0.70 },
  { top: 48, left: 76, scale: 0.85 },
  { top: 50, left: 50, scale: 1.25 },
];

const lerp = (a, b, t) => a + (b - a) * t;

export default function ScrollGlobe({ onGetStarted }) {
  const containerRef   = useRef(null);
  const sectionRefs    = useRef([]);
  const rafRef         = useRef(null);
  // Direct DOM refs — mutated each scroll frame without triggering re-renders
  const globeWrapRef   = useRef(null);
  const progressBarRef = useRef(null);
  const progressWrapRef = useRef(null);
  const navWrapRef     = useRef(null);
  const dotRefs        = useRef([]);
  const labelRefs      = useRef([]);

  // ── Core scroll handler: 100% DOM mutation, zero React setState ────────
  const updateOnScroll = useCallback(() => {
    const container   = containerRef.current;
    const globeEl     = globeWrapRef.current;
    if (!container || !globeEl) return;

    const containerTop    = container.offsetTop;
    const scrollTop       = window.pageYOffset;
    const containerHeight = container.scrollHeight;
    const viewportH       = window.innerHeight;
    const containerBottom = containerTop + containerHeight;

    // Show/hide progress bar
    const pastContainer = scrollTop > containerBottom - viewportH;
    const navOp = pastContainer ? '0' : '1';
    if (progressWrapRef.current) progressWrapRef.current.style.opacity = navOp;

    // Progress bar fill
    const rawProg = (scrollTop - containerTop) / (containerHeight - viewportH);
    const progress = Math.min(Math.max(rawProg, 0), 1);
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${progress})`;
    }

    // Globe position interpolation
    const sp = progress * (SECTIONS.length - 1);
    const ci = Math.floor(sp);
    const ni = Math.min(ci + 1, SECTIONS.length - 1);
    const t  = sp - ci;
    const curr = GLOBE_POSITIONS[ci];
    const next = GLOBE_POSITIONS[ni];
    const top   = lerp(curr.top,   next.top,   t);
    const left  = lerp(curr.left,  next.left,  t);
    const scale = lerp(curr.scale, next.scale, t);

    let opacity = ci === SECTIONS.length - 1 && t > 0.5 ? 0.35 : 0.8;
    const startLast = containerHeight - viewportH;
    if (scrollTop > startLast) {
      const fp = Math.min(Math.max((scrollTop - startLast) / (viewportH * 0.5), 0), 1);
      opacity = lerp(opacity, 0, fp);
    }

    // Direct DOM write — no React involved
    globeEl.style.transform = `translate3d(${left}vw, ${top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${scale}, ${scale}, 1)`;
    globeEl.style.opacity   = opacity;
  }, []);

  // ── Passive, RAF-gated scroll listener ─────────────────────────────────
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          updateOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateOnScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateOnScroll]);

  // ── Seed initial globe position immediately via ref ─────────────────────
  useEffect(() => {
    const p = GLOBE_POSITIONS[0];
    if (globeWrapRef.current) {
      globeWrapRef.current.style.transform = `translate3d(${p.left}vw, ${p.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${p.scale}, ${p.scale}, 1)`;
      globeWrapRef.current.style.opacity   = '0.8';
    }
  }, []);

  const handleAction = useCallback((label) => {
    if (label === 'See How It Works') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else if (onGetStarted) {
      onGetStarted();
    }
  }, [onGetStarted]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-screen overflow-hidden"
      style={{ background: 'var(--lp-bg)', color: 'var(--lp-text-primary)' }}
    >
      <div className="sg-grid-bg" />

      {/* ── Scroll Progress Bar ── */}
      <div
        ref={progressWrapRef}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '2px',
          background: 'linear-gradient(to right, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
          zIndex: 50, pointerEvents: 'none',
          transition: 'opacity 0.4s ease',
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: '100%',
            background: 'linear-gradient(to right, hsl(25,100%,50%), hsl(220,80%,50%), hsl(220,70%,30%))',
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
            filter: 'drop-shadow(0 0 3px hsla(25,100%,50%,0.4))',
          }}
        />
      </div>

      {/* ── Side Navigation Dots ── */}
      <div
        ref={navWrapRef}
        className="sg-side-nav"
        style={{
          position: 'fixed',
          right: 'clamp(12px, 2vw, 32px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(16px, 2.5vh, 28px)',
          transition: 'opacity 0.4s ease',
        }}
      >
        {SECTIONS.map((section, index) => (
          <div key={index} style={{ position: 'relative' }}>
            {/* Label — visibility set by ref in scroll handler */}
            <div
              ref={(el) => (labelRefs.current[index] = el)}
              style={{
                position: 'absolute',
                right: 'clamp(20px, 3vw, 36px)',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(10, 11, 15, 0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                opacity: index === 0 ? '1' : '0',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 50,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lp-accent)', animation: 'sg-pulse-dot 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--lp-text-primary)' }}>
                  {section.badge}
                </span>
              </div>
            </div>

            {/* Dot — style set by ref in scroll handler */}
            <button
              ref={(el) => (dotRefs.current[index] = el)}
              onClick={() => sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              style={{
                position: 'relative',
                width: index === 0 ? '10px' : '8px',
                height: index === 0 ? '10px' : '8px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: index === 0 ? 'var(--lp-accent)' : 'rgba(255,255,255,0.25)',
                background: index === 0 ? 'var(--lp-accent)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: index === 0 ? '0 0 12px hsla(25,100%,50%,0.5)' : 'none',
                padding: 0,
              }}
              aria-label={`Go to ${section.badge} section`}
            />

            {index < SECTIONS.length - 1 && (
              <div style={{
                position: 'absolute', left: '50%', top: '100%',
                width: '1px', height: 'clamp(16px, 2.5vh, 28px)',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)',
                transform: 'translateX(-50%)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Globe — ref-driven, NO CSS transition on transform ── */}
      <div
        ref={globeWrapRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10,
          pointerEvents: 'none',
          willChange: 'transform, opacity',
          // transition only on opacity, NOT transform
          transition: 'opacity 0.6s ease',
        }}
      >
        <div className="scale-[0.55] sm:scale-[0.75] lg:scale-100">
          <Globe size={420} />
        </div>
      </div>

      {/* ── Sections ── */}
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          ref={(el) => (sectionRefs.current[index] = el)}
          className="sg-section-content"
          aria-label={`${section.badge} section`}
        >
          <Container>
            <div
              style={{
                maxWidth: section.align === 'center' ? '760px' : '620px',
                margin: section.align === 'center' ? '0 auto' : section.align === 'right' ? '0 0 0 auto' : '0 auto 0 0',
                textAlign: section.align === 'center' ? 'center' : 'left',
              }}
            >
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '32px',
                  alignItems: section.align === 'center' ? 'center' : 'flex-start',
                }}
              >
                {/* Badge */}
                {section.id !== 'hero' && (
                  <motion.span variants={fadeUp} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 16px', borderRadius: '99px',
                    background: 'var(--lp-accent-soft)', border: '1px solid hsla(14,100%,50%,0.25)',
                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--lp-accent)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {section.badgeIcon && <section.badgeIcon size={12} strokeWidth={2.5} />}
                    {section.badge}
                  </motion.span>
                )}

                {/* Title */}
                <motion.h2 variants={fadeUp} style={{
                  fontSize: index === 0 ? 'clamp(2.25rem, 5vw, 4.25rem)' : 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.04em', color: 'var(--lp-text-primary)',
                }}>
                  {section.title}<br />
                  <span style={{ color: 'var(--lp-accent)' }}>{section.titleAccent}</span>
                </motion.h2>

                {/* Description */}
                <motion.p variants={fadeUp} style={{
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'var(--lp-text-secondary)',
                  maxWidth: '560px', lineHeight: 1.8,
                }}>
                  {section.description}
                </motion.p>

                {/* Feature cards */}
                {section.features && (
                  <motion.div variants={fadeUp} style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px', width: '100%', marginTop: '8px',
                  }}>
                    {section.features.map((feat, fi) => (
                      <div key={fi} className="sg-feature-card">
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--lp-text-primary)', marginBottom: '6px' }}>{feat.title}</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>{feat.description}</p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Actions */}
                {section.actions && (
                  <motion.div variants={fadeUp} style={{
                    display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '8px',
                    justifyContent: section.align === 'center' ? 'center' : 'flex-start',
                  }}>
                    {section.actions.map((action, ai) => (
                      <Button key={ai} variant={action.variant} size="md" onClick={() => handleAction(action.label)}
                        style={action.variant === 'primary' && index === SECTIONS.length - 1 ? { boxShadow: '0 0 40px hsla(14,100%,50%,0.25)' } : {}}
                      >
                        {action.label}
                        {action.variant === 'primary' && index === SECTIONS.length - 1 && <ArrowRight size={16} strokeWidth={2.5} />}
                      </Button>
                    ))}
                  </motion.div>
                )}

                {/* Trust items */}
                {section.trustItems && (
                  <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '8px' }}>
                    {section.trustItems.map((text) => (
                      <span key={text} style={{ fontSize: '0.82rem', color: 'var(--lp-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} color="#34d399" strokeWidth={2.5} />
                        {text}
                      </span>
                    ))}
                  </motion.div>
                )}

              </motion.div>
            </div>
          </Container>
        </section>
      ))}

      {/* ── Bottom gradient transition into next sections ── */}
      <div
        aria-hidden="true"
        style={{
          height: '120px',
          background:
            'linear-gradient(to bottom, var(--lp-bg), transparent)',
          position: 'relative',
          zIndex: 20,
          marginTop: '-120px',
        }}
      />
    </div>
  );
}

/**
 * Testimonials.jsx — Dual-row infinite scroll testimonials
 * Row 1: left → right  |  Row 2: right → left
 * aria-hidden on marquee tracks; descriptive aria-label on section
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Container from '../layout/Container';
import { fadeUp, staggerContainer, marqueeX, marqueeXReverse, viewportConfig } from '../../lib/motionVariants';
import SectionGlow from '../landingpage/SectionGlow';

function TestimonialCard({ name, role, company, review, rating }) {
  return (
    <div
      style={{
        background:   'var(--lp-surface)',
        border:       '1px solid var(--lp-border-subtle)',
        borderRadius: '16px',
        padding:      '22px 24px',
        width:        '300px',
        flexShrink:   0,
        marginRight:  '14px',
        userSelect:   'none',
      }}
    >
      {/* Stars */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={13} color="var(--lp-accent)" fill="var(--lp-accent)" />
        ))}
      </div>

      {/* Review */}
      <p style={{
        fontSize:     '0.88rem',
        color:        'var(--lp-text-secondary)',
        lineHeight:   1.65,
        marginBottom: '18px',
        display:      '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow:     'hidden',
      }}>
        "{review}"
      </p>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width:          '34px',
          height:         '34px',
          borderRadius:   '50%',
          background:     `hsl(${(name.charCodeAt(0) * 37) % 360}, 60%, 50%)`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '0.82rem',
          fontWeight:     800,
          color:          'var(--surface)',
          flexShrink:     0,
        }}>
          {name[0]}
        </div>
        <div>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>{name}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)' }}>{role} · {company}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ testimonials, reverse = false }) {
  const doubled = [...testimonials, ...testimonials];
  const variant = reverse ? marqueeXReverse : marqueeX;

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }} aria-hidden="true">
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 1, background: 'linear-gradient(to right, var(--lp-bg), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 1, background: 'linear-gradient(to left, var(--lp-bg), transparent)', pointerEvents: 'none' }} />

      <motion.div
        variants={variant}
        animate="animate"
        style={{ display: 'inline-flex', willChange: 'transform' }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} {...t} />
        ))}
      </motion.div>
    </div>
  );
}

export default function Testimonials({ testimonials = [] }) {
  const half1 = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const half2 = testimonials.slice(Math.ceil(testimonials.length / 2));

  return (
    <section
      id="testimonials"
      className="landing-section"
      aria-label="Customer testimonials"
      style={{ position: 'relative' }}
    >
      <SectionGlow position="both" intensity="low" size="md" variations={{ leftTop: '70%', rightTop: '30%' }} />
      {/* Header */}
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 72px)' }}
        >
          <motion.span
            variants={fadeUp}
            style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lp-accent)', marginBottom: '12px' }}
          >
            What Developers Say
          </motion.span>
          <motion.h2
            variants={fadeUp}
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontWeight: 900, color: 'var(--lp-text-primary)', marginBottom: '14px' }}
          >
            Loved by Web3 Builders
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--lp-text-secondary)', fontSize: '1.05rem', maxWidth: '460px', margin: '0 auto', lineHeight: 1.7 }}>
            Thousands of developers trust AutoCon to ship their smart contracts faster.
          </motion.p>
        </motion.div>
      </Container>

      {/* Marquee rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <MarqueeRow testimonials={half1 .length ? half1  : testimonials.slice(0, 4)} reverse={false} />
        <MarqueeRow testimonials={half2.length  ? half2  : testimonials.slice(4)}    reverse={true}  />
      </div>

      {/* Screen-reader accessible list */}
      <div className="sr-only" role="list" aria-label="Customer testimonials">
        {testimonials.map(t => (
          <div key={t.id} role="listitem">
            <blockquote cite={t.company}>{t.review}</blockquote>
            <cite>{t.name}, {t.role} at {t.company}</cite>
          </div>
        ))}
      </div>
    </section>
  );
}

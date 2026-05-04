/**
 * ChainSection.jsx — Premium Feature Matrix
 * Card-based comparison with glow integration and hover interactions
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import Container from '../layout/Container';
import { fadeUp, staggerContainer, viewportConfig } from '../../lib/motionVariants';
import SectionGlow from '../landingpage/SectionGlow';

const CHAINS = [
  { name: 'AutoCon', isPrimary: true, badge: 'Best Choice' },
  { name: 'Ethereum', isPrimary: false, badge: null },
  { name: 'Polygon', isPrimary: false, badge: null },
  { name: 'BNB Chain', isPrimary: false, badge: null },
];

const ROWS = [
  { feature: 'No-Code UI',         values: [true,  false, false, false] },
  { feature: 'AI Security Audit',  values: [true,  false, false, false] },
  { feature: 'Multi-Chain Deploy', values: [true,  false, true,  false] },
  { feature: 'Gas Optimization',   values: [true,  false, true,  true]  },
  { feature: 'Free Tier',          values: [true,  false, false, true] },
  { feature: 'Instant Deploy',     values: [true,  false, true,  true]  },
];

function FeatureIcon({ val, isPrimary }) {
  if (val) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: isPrimary 
            ? 'linear-gradient(135deg, hsl(14 100% 50%) 0%, hsl(25 90% 45%) 100%)'
            : 'linear-gradient(135deg, hsl(150 60% 45%) 0%, hsl(150 60% 35%) 100%)',
          boxShadow: isPrimary 
            ? '0 2px 12px hsla(14, 100%, 50%, 0.4)' 
            : '0 2px 8px hsla(150, 60%, 35%, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Check size={14} color="#fff" strokeWidth={3} />
        </div>
      </div>
    );
  }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.35,
    }}>
      <X size={14} color="hsl(240 5% 65%)" strokeWidth={2} />
    </div>
  );
}

function ColumnCard({ chain, columnIndex, rows }) {
  const isPrimary = chain.isPrimary;
  const badge = chain.badge;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig}
      transition={{ 
        duration: 0.6, 
        delay: columnIndex * 0.12,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      style={{
        flex: '1',
        minWidth: '160px',
        maxWidth: '200px',
        background: isPrimary
          ? 'linear-gradient(180deg, hsl(240 10% 16%) 0%, hsl(240 10% 12%) 100%)'
          : 'linear-gradient(180deg, hsl(240 6% 13%) 0%, hsl(240 6% 10%) 100%)',
        borderRadius: '24px',
        border: isPrimary 
          ? '1px solid hsla(14, 100%, 50%, 0.25)' 
          : '1px solid hsla(0, 0%, 100%, 0.05)',
        boxShadow: isPrimary
          ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px hsla(14, 100%, 50%, 0.1), inset 0 1px 0 hsla(0, 0%, 100%, 0.03)'
          : '0 6px 20px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'default',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '24px 16px',
        borderBottom: '1px solid hsla(0, 0%, 100%, 0.04)',
        textAlign: 'center',
        background: isPrimary
          ? 'linear-gradient(180deg, hsla(14, 100%, 50%, 0.08) 0%, transparent 100%)'
          : 'transparent',
        minHeight: '88px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
      }}>
        {badge && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: 'hsla(14, 100%, 50%, 0.15)',
            border: '1px solid hsla(14, 100%, 50%, 0.25)',
          }}>
            <Zap size={10} color="hsl(14 100% 60%)" />
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: 'hsl(14 100% 60%)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {badge}
            </span>
          </div>
        )}
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: isPrimary ? 'hsl(14 100% 60%)' : 'hsl(240 5% 75%)',
          letterSpacing: '0.02em',
        }}>
          {chain.name}
        </div>
      </div>

      {/* Rows */}
      <div style={{ padding: '8px' }}>
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '56px',
              borderBottom: rowIdx < rows.length - 1 
                ? '1px solid hsla(0, 0%, 100%, 0.03)' 
                : 'none',
              background: isPrimary && row.values[columnIndex]
                ? 'hsla(14, 100%, 50%, 0.05)'
                : 'transparent',
              transition: 'background 0.2s ease',
            }}
          >
            <FeatureIcon val={row.values[columnIndex]} isPrimary={isPrimary && row.values[columnIndex]} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FeatureRow({ feature }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid hsla(0, 0%, 100%, 0.03)',
      minHeight: '56px',
    }}>
      <span style={{
        fontSize: '0.82rem',
        fontWeight: 600,
        color: 'hsl(240 5% 75%)',
      }}>
        {feature}
      </span>
    </div>
  );
}

export default function ChainSection() {
  return (
    <section
      id="chain"
      className="landing-section"
      aria-label="Chain comparison matrix"
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        paddingTop: 'clamp(48px, 8vw, 80px)',
        paddingBottom: 'clamp(32px, 6vw, 60px)',
      }}
    >
      <SectionGlow position="both" intensity="low" size="lg" variations={{ leftTop: '60%', rightTop: '30%' }} />

      <Container>
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}
        >
          <motion.span
            variants={fadeUp}
            style={{ 
              display: 'inline-block', 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              textTransform:'uppercase', 
              letterSpacing:'0.12em', 
              color: 'hsl(14 100% 55%)', 
              marginBottom: '14px' 
            }}
          >
            Platform Comparison
          </motion.span>
          <motion.h2
            variants={fadeUp}
            style={{ 
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', 
              fontWeight: 900, 
              color: 'hsl(0 0% 95%)', 
              marginBottom:'12px',
              letterSpacing: '-0.02em',
            }}
          >
            Why AutoCon Wins
          </motion.h2>
          <motion.p 
            variants={fadeUp} 
            style={{ 
              color: 'hsl(240 5% 65%)', 
              fontSize: '1rem', 
              maxWidth: '480px', 
              margin: '0 auto', 
              lineHeight: 1.6 
            }}
          >
            Compare AutoCon against raw chain development. No contest.
          </motion.p>
        </motion.div>

        {/* Comparison Cards Container */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          style={{
            display: 'flex',
            gap: 'clamp(16px, 3vw, 28px)',
            justifyContent: 'center',
            alignItems: 'stretch',
            overflowX: 'auto',
            padding: '8px 4px 20px',
            WebkitOverflowScrolling: 'touch',
          }}
          role="region"
          aria-label="Feature comparison cards"
        >
          {/* Feature labels column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '160px',
            maxWidth: '200px',
            background: 'transparent',
          }}>
            <div style={{
              padding: '24px 20px',
              borderBottom: '1px solid hsla(0, 0%, 100%, 0.04)',
              minHeight: '88px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'hsl(240 5% 55%)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Feature
              </span>
            </div>
            {ROWS.map((row, idx) => (
              <FeatureRow key={idx} feature={row.feature} />
            ))}
          </div>

          {/* Chain columns */}
          {CHAINS.map((chain, idx) => (
            <ColumnCard 
              key={chain.name} 
              chain={chain} 
              columnIndex={idx}
              rows={ROWS}
            />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}